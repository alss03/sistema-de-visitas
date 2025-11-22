import React, { useEffect, useState } from "react";
import { getVisitas } from "../api/visitas.service";
import type { PessoasParaVisitar } from "../types/visitas";
import { ordenarVisitas } from "../utils/sort";
import { UserCard } from "../components/Usercard/UserCard";
import styles from "./Dashboard.module.scss";
import { isVisitaPendente } from "../utils/date";
import type { VisitaRegistradaEvent } from "../types/events";
import { StatsBar } from "../components/StatsBar/StatsBar";
import { StatusPieChart } from "../components/StatusPieChart/StatusPieChart";
import { FrequencyBarChart } from "../components/FrequencyBarChart/FrequencyBarChart";

// definir tipos de filtro
type FiltroVisitas = "todas" | "pendentes" | "emdia" | "ativas" | "inativas";

// helper para agrupar frequências em faixas
function agruparFrequencias(
  // lista de visitas
  visitas: PessoasParaVisitar[]
): { range: string; count: number }[] {
  // definir grupos de frequencia
  const grupos: Record<string, number> = {
    "1-3 dias": 0,
    "4-7 dias": 0,
    "8-14 dias": 0,
    "15-30 dias": 0,
    "31+ dias": 0,
  };

  // agrupar cada visita em um grupo
  visitas.forEach((v) => {
    const freq = v.verify_frequency_in_days;

    // incrementar contagem do grupo correspondente
    if (freq >= 1 && freq <= 3) grupos["1-3 dias"]++;
    else if (freq >= 4 && freq <= 7) grupos["4-7 dias"]++;
    else if (freq >= 8 && freq <= 14) grupos["8-14 dias"]++;
    else if (freq >= 15 && freq <= 30) grupos["15-30 dias"]++;
    else grupos["31+ dias"]++;
  });

  // converter objeto de grupos em array
  return Object.entries(grupos).map(([range, count]) => ({
    range,
    count,
  }));
}

// componente Dashboard
export const Dashboard: React.FC = () => {
  console.log("=Dashboard exibido");

  // estados locais
  const [visitas, setVisitas] = useState<PessoasParaVisitar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroVisitas>("todas");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [busca, setBusca] = useState<string>("");

  // carregar dados ao montar o componente
  useEffect(() => {
    async function load() {
      try {
        const result = await getVisitas();
        setVisitas(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ouvir evento global de visita registrada (PATCH) e atualizar estado + toast
  useEffect(() => {
    const listener = (ev: Event) => {
      const { id, lastVerified, name } = (ev as CustomEvent<VisitaRegistradaEvent>).detail;

      // atualizar lista de visitas com nova data
      setVisitas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, last_verified_date: lastVerified } : p))
      );

      // exibir toast/banner de feedback
      setFlashMessage(`Visita registrada para ${name}`);

      // remover toast apos 3 segundos
      setTimeout(() => {
        setFlashMessage(null);
      }, 3000);
    };

    // adicionar listener
    window.addEventListener("visita-registrada", listener);

    // remover listener ao desmontar
    return () => {
      window.removeEventListener("visita-registrada", listener);
    };
  }, []);

  // renderizar loading enquanto carrega dados
  if (loading) {
    return <div>Loading...</div>;
  }

  // renderizar erro se houver
  if (error) {
    return <div>Error: {error}</div>;
  }

  // ordenar visitas
  const visitasOrdenadas = ordenarVisitas(visitas);

  // calcular metricas para StatsBar e graficos
  const total = visitas.length;
  const ativos = visitas.filter((v) => v.active).length;
  const inativos = visitas.filter((v) => !v.active).length;
  const pendentes = visitas.filter(
    (v) => v.active && isVisitaPendente(v.last_verified_date, v.verify_frequency_in_days)
  ).length;
  const emDia = Math.max(ativos - pendentes, 0);
  const percentualEmDia = ativos === 0 ? 0 : Math.round((emDia / ativos) * 100);

  // dados para grafico de frequencia
  const frequenciaData = agruparFrequencias(visitas);

  // aplicar filtro de status + busca
  const visitasFiltradas = visitasOrdenadas
    .filter((user) => {
      const pendente = isVisitaPendente(
        user.last_verified_date,
        user.verify_frequency_in_days
      );

      // aplicar filtro de status
      switch (filtro) {
        case "pendentes":
          return user.active && pendente;
        case "emdia":
          return user.active && !pendente;
        case "ativas":
          return user.active;
        case "inativas":
          return !user.active;
        case "todas":
        default:
          return true;
      }
    })
    .filter((user) => {
      // aplicar busca por nome ou CPF
      const termo = busca.trim();
      if (!termo) return true;

      // arrumar o case-insensitive
      const termoLower = termo.toLowerCase();
      const nomeLower = user.name.toLowerCase();

      // limpar CPF para comparar apenas numeros
      const cpfLimpo = user.cpf.replace(/\D/g, "");
      const termoCpf = termo.replace(/\D/g, "");

      // verificar se nome ou CPF batem com o termo
      return (
        nomeLower.includes(termoLower) ||
        (termoCpf.length > 0 && cpfLimpo.includes(termoCpf))
      );
    });

  // renderizar lista de visitas
  return (
    <main className={styles.container}>

      {/* toast de feedback */}
      {flashMessage && <div className={styles.toast}>{flashMessage}</div>}

      {/* barra de estatisticas + filtro */}
      <StatsBar
        total={total}
        ativos={ativos}
        pendentes={pendentes}
        inativos={inativos}
        emDia={emDia}
        percentualEmDia={percentualEmDia}
        currentFilter={filtro}
        onFilterChange={setFiltro}
      />

      {/* linha com busca + barra de progresso */}
      <section className={styles.searchAndProgressRow}>
        <div className={styles.searchGroup}>
          <label className={styles.searchLabel} htmlFor="search">
            Buscar por nome ou CPF
          </label>
          <input
            id="search"
            type="text"
            placeholder="Digite um nome ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* barra de progresso de visitas em dia */}
        <div className={styles.progressGroup}>
          <span className={styles.progressLabel}>Em dia entre os ativos</span>
          <div className={styles.progressBarWrapper}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${percentualEmDia}%` }}
            />
          </div>
          <span className={styles.progressPercent}>{percentualEmDia}%</span>
        </div>
      </section>

      {/* divisao de 2 colunas */}
      <section className={styles.content}>
        {/* coluna esquerda cards */}
        <div className={styles.leftColumn}>
          {/* estado vazio */}
          {visitasFiltradas.length === 0 ? (
            <div className={styles.emptyState}>
              Nenhum usuário encontrado com os filtros e a busca atuais.
            </div>
          ) : (
            <ul className={styles.list}>
              {visitasFiltradas.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </ul>
          )}
        </div>

        {/* coluna direita graficos */}
        <div className={styles.rightColumn}>
          <StatusPieChart emDia={emDia} pendentes={pendentes} inativos={inativos} />
          <FrequencyBarChart data={frequenciaData} />
        </div>
      </section>
    </main>
  );
};

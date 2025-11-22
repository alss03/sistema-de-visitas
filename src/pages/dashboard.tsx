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
type FiltroVisitas = "todas" | "pendentes" | "ativas" | "inativas";

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

  // ouvir evento global de visita registrada (PATCH) e atualizar estado e toast
  useEffect(() => {
    const listener = (ev: Event) => {
      const { id, lastVerified, name } = (ev as CustomEvent<VisitaRegistradaEvent>).detail;

      // atualizar lista de visitas com nova data
      setVisitas((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, last_verified_date: lastVerified } : p
        )
      );

      // exibir toast de feedback
      setFlashMessage(`Visita registrada para ${name}`);

      // tempo de exibicao do toast de 3 segundos
      setTimeout(() => {
        setFlashMessage(null);
      }, 3000);
    };

    // adicionar listener ao evento global
    window.addEventListener("visita-registrada", listener);

    // cleanup ao desmontar
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

  // calcular metricas para a StatsBar
  const total = visitas.length;
  const ativos = visitas.filter((v) => v.active).length;
  const inativos = visitas.filter((v) => !v.active).length;
  const pendentes = visitas.filter(
    (v) => v.active && isVisitaPendente(v.last_verified_date, v.verify_frequency_in_days)
  ).length;
  const emDia = Math.max(ativos - pendentes, 0);
  const percentualEmDia = ativos === 0 ? 0 : Math.round((emDia / ativos) * 100);

  // aplicar filtro
  const visitasFiltradas = visitasOrdenadas
  // filtro por status
  .filter((user) => {
    const pendente = isVisitaPendente(
      user.last_verified_date,
      user.verify_frequency_in_days
    );

    switch (filtro) {
      case "pendentes":
        return user.active && pendente;
      case "ativas":
        return user.active && !pendente;
      case "inativas":
        return !user.active;
      case "todas":
      default:
        return true;
    }
  })
  
  // busca por nome/CPF
  .filter((user) => {
    // limpar termo de busca
    const termo = busca.trim();
    if (!termo) return true;

    // converter para minusculas para comparacao
    const termoLower = termo.toLowerCase();
    const nomeLower = user.name.toLowerCase();

    // limpar CPF para comparacao
    const cpfLimpo = user.cpf.replace(/\D/g, "");
    const termoCpf = termo.replace(/\D/g, "");

    // verificar se o nome ou CPF contem o termo buscado
    return (
      nomeLower.includes(termoLower) ||
      (termoCpf.length > 0 && cpfLimpo.includes(termoCpf))
    );
  });

  // preparar dados para o grafico de frequencias
  const frequenciaMap: Record<number, number> = {};

  // contar frequencias
  visitas.forEach((v) => {
    const freq = v.verify_frequency_in_days;
    if (!frequenciaMap[freq]) frequenciaMap[freq] = 0;
    frequenciaMap[freq]++;
  });

  // transformar em array para o grafico
  const frequenciaData = Object.entries(frequenciaMap).map(([freq, count]) => ({
    frequency: Number(freq),
    count: count as number,
  }));

  // renderizar lista de visitas
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Sistema de Visitas</h1>

      {/* toast de feedback */}
      {flashMessage && (
        <div className={styles.toast}>
          {flashMessage}
        </div>
      )}

      {/* barra de estatisticas e filtro */}
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

        {/* gráfico pizza de status */}
        <StatusPieChart
          emDia={emDia}
          pendentes={pendentes}
          inativos={inativos}
        />

        {/* gráfico de distribuição de frequência */}
        <FrequencyBarChart data={frequenciaData} />

      {/* busca por nome/CPF */}
      <div className={styles.searchRow}>
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
      {/* lista de usuarios */}
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
    </main>
  );
};

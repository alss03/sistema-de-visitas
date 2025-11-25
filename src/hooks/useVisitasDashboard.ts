import { useEffect, useMemo, useState } from "react";
import { getVisitas } from "../api/visitas.service";
import type { PessoasParaVisitar } from "../types/visitas";
import type { VisitaRegistradaEvent } from "../types/events";
import { ordenarVisitas } from "../utils/sort";
import { isVisitaPendente } from "../utils/date";
import {
  agruparFrequencias,
  calcularResumoVisitas,
  type FrequenciaIntervalo,
  type ResumoVisitas,
} from "../utils/visitasMetrics";

// definir tipos de filtro
export type FiltroVisitas = "todas" | "pendentes" | "ativas" | "inativas" | "emdia";

// definir tipo de retorno do hook
interface UseVisitasDashboardResult {
  visitas: PessoasParaVisitar[];
  visitasOrdenadas: PessoasParaVisitar[];
  visitasFiltradas: PessoasParaVisitar[];
  loading: boolean;
  error: string | null;
  filtro: FiltroVisitas;
  setFiltro: (filtro: FiltroVisitas) => void;
  busca: string;
  setBusca: (valor: string) => void;
  flashMessage: string | null;
  resumo: ResumoVisitas;
  frequenciaData: FrequenciaIntervalo[];
  reload: () => void;
}

// hook para gerenciar estado do dashboard de visitas
export function useVisitasDashboard(): UseVisitasDashboardResult {
  const [visitas, setVisitas] = useState<PessoasParaVisitar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroVisitas>("todas");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [busca, setBusca] = useState<string>("");

  // função reutilizável para carregar as visitas (inicial + retry)
  async function load() {
    setLoading(true);      // mostra loading no retry
    setError(null);        // limpa erro anterior

    try {
      const result = await getVisitas();
      setVisitas(result);
    } catch (err) {
      console.error(err);
      setVisitas([]);      // garante que não fica lixo
      setError(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  // carregar dados ao montar
  useEffect(() => {
    load();
  }, []);

  // ouvir evento global de visita registrada (PATCH)
  useEffect(() => {
    let timeoutId: number | undefined;

    // listener do evento
    const listener = (ev: Event) => {
      const { id, lastVerified, name } = (
        ev as CustomEvent<VisitaRegistradaEvent>
      ).detail;

      //
      setVisitas((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, last_verified_date: lastVerified } : p
        )
      );

      // exibir mensagem de feedback
      setFlashMessage(`Visita registrada para ${name}`);

      // limpa eventual timeout anterior e agenda o novo
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        setFlashMessage(null);
      }, 3000);
    };

    // registrar listener
    window.addEventListener("visita-registrada", listener);

    // cleanup
    return () => {
      window.removeEventListener("visita-registrada", listener);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  // memorizar dados derivados
  const visitasOrdenadas = useMemo(
    () => ordenarVisitas(visitas),
    [visitas]
  );

  // resumo das visitas
  const resumo = useMemo(
    () => calcularResumoVisitas(visitas),
    [visitas]
  );

  // dados para grafico de frequencia
  const frequenciaData = useMemo(
    () => agruparFrequencias(visitas),
    [visitas]
  );

  // visitas filtradas por filtro e busca
  const visitasFiltradas = useMemo(
    () =>
      visitasOrdenadas
        .filter((user) => {
          const pendente = isVisitaPendente(
            user.last_verified_date,
            user.verify_frequency_in_days
          );

          switch (filtro) {
            case "pendentes":
              return user.active && pendente;
            case "emdia":
              // apenas ativos e em dia
              return user.active && !pendente;
            case "ativas":
              // todas ativas (em dia + pendentes)
              return user.active;
            case "inativas":
              return !user.active;
            case "todas":
            default:
              return true;
          }
        })
        .filter((user) => {
          const termo = busca.trim();
          if (!termo) return true;

          const termoLower = termo.toLowerCase();
          const nomeLower = user.name.toLowerCase();

          const cpfLimpo = user.cpf.replace(/\D/g, "");
          const termoCpf = termo.replace(/\D/g, "");

          return (
            nomeLower.includes(termoLower) ||
            (termoCpf.length > 0 && cpfLimpo.includes(termoCpf))
          );
        }),
    [visitasOrdenadas, filtro, busca]
  );

  // retornar estado e funcoes
  return {
    visitas,
    visitasOrdenadas,
    visitasFiltradas,
    loading,
    error,
    filtro,
    setFiltro,
    busca,
    setBusca,
    flashMessage,
    resumo,
    frequenciaData,
    reload: load,
  };
}

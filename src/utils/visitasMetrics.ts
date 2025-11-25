import type { PessoasParaVisitar } from "../types/visitas";
import { getDiasAtraso, getDiasParaVencer, isVencendoHoje, isVisitaPendente } from "./date";

// resumo das visitas para dashboard
export interface ResumoVisitas {
  total: number;
  ativos: number;
  inativos: number;
  pendentes: number;
  emDia: number;
  percentualEmDia: number;
  emDiaSeguro: number;
  venceHoje: number;
  atrasoLeve: number;
  atrasoGrave: number;
}

// frequencia em intervalos predefinidos
export interface FrequenciaIntervalo {
  range: string;
  count: number;
}

// calcula total / ativos / vencimentos
export function calcularResumoVisitas(
  visitas: PessoasParaVisitar[]
): ResumoVisitas {
   const total = visitas.length;
  const ativos = visitas.filter((v) => v.active).length;
  const inativos = visitas.filter((v) => !v.active).length;

  // contadores detalhados
  let pendentes = 0;
  let emDia = 0;

  let emDiaSeguro = 0;
  let venceHoje = 0;
  let atrasoLeve = 0;
  let atrasoGrave = 0;

  visitas.forEach((v) => {
    if (!v.active) {
      return;
    }

    // verifica se é pendente
    const pending = isVisitaPendente(
      v.last_verified_date,
      v.verify_frequency_in_days
    );

    // se não for pendente, verifica se vence hoje
    const venceHojeFlag =
      !pending &&
      isVencendoHoje(
        v.last_verified_date,
        v.verify_frequency_in_days
      );

    // conta o atraso
    if (pending) {
      pendentes++;
      const diasAtraso = getDiasAtraso(
        v.last_verified_date,
        v.verify_frequency_in_days
      );

      if (diasAtraso <= 3) {
        atrasoLeve++;
      } else {
        atrasoGrave++;
      }
    } else {
      // não pendente é considerado em dia
      emDia++;

      if (venceHojeFlag) {
        venceHoje++;
      } else {
        const diasParaVencer = getDiasParaVencer(
          v.last_verified_date,
          v.verify_frequency_in_days
        );

        // em dia seguro, não vence hoje
        if (diasParaVencer >= 0) {
          emDiaSeguro++;
        }
      }
    }
  });

  // calcula em dia e percentual
  const percentualEmDia =
    ativos === 0 ? 0 : Math.round((emDia / ativos) * 100);

  return {
    total,
    ativos,
    inativos,
    pendentes,
    emDia,
    percentualEmDia,
    emDiaSeguro,
    venceHoje,
    atrasoLeve,
    atrasoGrave,
  };
}

// agrupa frequencia em intervalos
export function agruparFrequencias(
  visitas: PessoasParaVisitar[]
): FrequenciaIntervalo[] {
  const grupos: Record<string, number> = {
    "1-3 dias": 0,
    "4-7 dias": 0,
    "8-14 dias": 0,
    "15-30 dias": 0,
    "31+ dias": 0,
  };

  // conta quantas visitas em cada intervalo
  visitas.forEach((v) => {
    const freq = v.verify_frequency_in_days;

    // incrementa o grupo correspondente
    if (freq >= 1 && freq <= 3) grupos["1-3 dias"]++;
    else if (freq >= 4 && freq <= 7) grupos["4-7 dias"]++;
    else if (freq >= 8 && freq <= 14) grupos["8-14 dias"]++;
    else if (freq >= 15 && freq <= 30) grupos["15-30 dias"]++;
    else grupos["31+ dias"]++;
  });

  // transforma em array de objetos
  return Object.entries(grupos).map(([range, count]) => ({
    range,
    count,
  }));
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calcularResumoVisitas,
  agruparFrequencias,
} from "./visitasMetrics";
import type { PessoasParaVisitar } from "../types/visitas";
import * as dateUtils from "./date";

describe("utils/visitasMetrics – calcularResumoVisitas", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calcula corretamente total, ativos, inativos, pendentes, em dia e categorias detalhadas", () => {
    const visitas: PessoasParaVisitar[] = [
      {
        id: "1",
        name: "Em dia seguro",
        cpf: "111",
        active: true,
        last_verified_date: "emDiaSeguro",
        verify_frequency_in_days: 7,
      },
      {
        id: "2",
        name: "Vence hoje",
        cpf: "222",
        active: true,
        last_verified_date: "venceHoje",
        verify_frequency_in_days: 7,
      },
      {
        id: "3",
        name: "Pendente leve",
        cpf: "333",
        active: true,
        last_verified_date: "pendenteLeve",
        verify_frequency_in_days: 7,
      },
      {
        id: "4",
        name: "Pendente grave",
        cpf: "444",
        active: true,
        last_verified_date: "pendenteGrave",
        verify_frequency_in_days: 7,
      },
      {
        id: "5",
        name: "Inativo",
        cpf: "555",
        active: false,
        last_verified_date: "ignorado",
        verify_frequency_in_days: 7,
      },
    ];

    vi.spyOn(dateUtils, "isVisitaPendente").mockImplementation(
      (lastVerified: string) =>
        lastVerified === "pendenteLeve" || lastVerified === "pendenteGrave"
    );

    vi.spyOn(dateUtils, "isVencendoHoje").mockImplementation(
      (lastVerified: string) => lastVerified === "venceHoje"
    );

    vi.spyOn(dateUtils, "getDiasAtraso").mockImplementation(
      (lastVerified: string) => {
        if (lastVerified === "pendenteLeve") return 2;
        if (lastVerified === "pendenteGrave") return 5;
        return 0;
      }
    );

    vi.spyOn(dateUtils, "getDiasParaVencer").mockImplementation(
      (lastVerified: string) => {
        if (lastVerified === "emDiaSeguro") return 5;
        return 0;
      }
    );

    const resumo = calcularResumoVisitas(visitas);

    expect(resumo.total).toBe(5);
    expect(resumo.ativos).toBe(4);
    expect(resumo.inativos).toBe(1);

    expect(resumo.pendentes).toBe(2);
    expect(resumo.emDia).toBe(2);
    expect(resumo.percentualEmDia).toBe(50);

    expect(resumo.emDiaSeguro).toBe(1);
    expect(resumo.venceHoje).toBe(1);
    expect(resumo.atrasoLeve).toBe(1);
    expect(resumo.atrasoGrave).toBe(1);
  });

  it("percentualEmDia deve ser 0 quando não há ativos", () => {
    const visitas: PessoasParaVisitar[] = [
      {
        id: "1",
        name: "Inativo 1",
        cpf: "111",
        active: false,
        last_verified_date: "x",
        verify_frequency_in_days: 7,
      },
      {
        id: "2",
        name: "Inativo 2",
        cpf: "222",
        active: false,
        last_verified_date: "y",
        verify_frequency_in_days: 15,
      },
    ];

    vi.spyOn(dateUtils, "isVisitaPendente").mockReturnValue(true);
    vi.spyOn(dateUtils, "isVencendoHoje").mockReturnValue(false);
    vi.spyOn(dateUtils, "getDiasAtraso").mockReturnValue(10);
    vi.spyOn(dateUtils, "getDiasParaVencer").mockReturnValue(0);

    const resumo = calcularResumoVisitas(visitas);

    expect(resumo.total).toBe(2);
    expect(resumo.ativos).toBe(0);
    expect(resumo.inativos).toBe(2);

    expect(resumo.pendentes).toBe(0);
    expect(resumo.emDia).toBe(0);
    expect(resumo.percentualEmDia).toBe(0);

    expect(resumo.emDiaSeguro).toBe(0);
    expect(resumo.venceHoje).toBe(0);
    expect(resumo.atrasoLeve).toBe(0);
    expect(resumo.atrasoGrave).toBe(0);
  });
});

describe("utils/visitasMetrics – agruparFrequencias", () => {
  it("agrupa verify_frequency_in_days nos intervalos corretos", () => {
    const visitas: PessoasParaVisitar[] = [
      {
        id: "1",
        name: "1-3 dias",
        cpf: "111",
        active: true,
        last_verified_date: "ok",
        verify_frequency_in_days: 2,
      },
      {
        id: "2",
        name: "4-7 dias",
        cpf: "222",
        active: true,
        last_verified_date: "ok",
        verify_frequency_in_days: 5,
      },
      {
        id: "3",
        name: "8-14 dias",
        cpf: "333",
        active: true,
        last_verified_date: "ok",
        verify_frequency_in_days: 10,
      },
      {
        id: "4",
        name: "15-30 dias",
        cpf: "444",
        active: true,
        last_verified_date: "ok",
        verify_frequency_in_days: 20,
      },
      {
        id: "5",
        name: "31+ dias",
        cpf: "555",
        active: true,
        last_verified_date: "ok",
        verify_frequency_in_days: 45,
      },
    ];

    const result = agruparFrequencias(visitas);
    const map = Object.fromEntries(result.map((g) => [g.range, g.count]));

    expect(map["1-3 dias"]).toBe(1);
    expect(map["4-7 dias"]).toBe(1);
    expect(map["8-14 dias"]).toBe(1);
    expect(map["15-30 dias"]).toBe(1);
    expect(map["31+ dias"]).toBe(1);
  });

  it("retorna 0 para intervalos sem visitas", () => {
    const visitas: PessoasParaVisitar[] = [
      {
        id: "1",
        name: "Só 31+",
        cpf: "111",
        active: true,
        last_verified_date: "ok",
        verify_frequency_in_days: 60,
      },
    ];

    const result = agruparFrequencias(visitas);
    const map = Object.fromEntries(result.map((g) => [g.range, g.count]));

    expect(map["1-3 dias"]).toBe(0);
    expect(map["4-7 dias"]).toBe(0);
    expect(map["8-14 dias"]).toBe(0);
    expect(map["15-30 dias"]).toBe(0);
    expect(map["31+ dias"]).toBe(1);
  });
});

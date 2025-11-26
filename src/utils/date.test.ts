import { describe, it, expect } from "vitest";
import {
  parseDataVisita,
  getDataProximaVisita,
  isVisitaPendente,
  isVencendoHoje,
  getDiasAtraso,
  getDiasParaVencer,
  formatDateTime,
} from "./date";

describe("utils/date – regras de visita", () => {
  // mockar data para "hoje"
  const HOJE = new Date(2025, 0, 10, 12, 0, 0);

  it("parseDataVisita deve converter string yyyy/mm/dd hh:mm:ss em Date válida", () => {
    const d = parseDataVisita("2025/01/05 10:30:00");

    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(0); // janeiro = 0
    expect(d.getDate()).toBe(5);
    expect(d.getHours()).toBe(10);
    expect(d.getMinutes()).toBe(30);
  });

  it("parseDataVisita deve converter string dd/mm/yyyy hh:mm:ss em Date válida", () => {
    const d = parseDataVisita("05/01/2025 10:30:00");

    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(5);
    expect(d.getHours()).toBe(10);
    expect(d.getMinutes()).toBe(30);
  });

  it("getDataProximaVisita deve somar a frequência de dias à última visita", () => {
    const last = "2025/01/01 10:00:00";
    const freq = 7;

    const proxima = getDataProximaVisita(last, freq);

    expect(proxima.getFullYear()).toBe(2025);
    expect(proxima.getMonth()).toBe(0); // janeiro
    expect(proxima.getDate()).toBe(8); // 1 + 7 = 8
  });

  it("isVisitaPendente deve ser true quando a próxima visita é antes de hoje", () => {
    // última visita: 01/01/2025, freq: 3
    // próxima visita: 04/01/2025
    // hoje: 10/01/2025: atrasada
    const last = "01/01/2025 10:00:00";
    const freq = 3;

    const pendente = isVisitaPendente(last, freq, HOJE);
    expect(pendente).toBe(true);

    const diasAtraso = getDiasAtraso(last, freq, HOJE);
    // 04/01 -> 10/01 = 6 dias
    expect(diasAtraso).toBe(6);
  });

  it("isVisitaPendente deve ser false quando a próxima visita ainda não chegou", () => {
    // última visita: 08/01/2025, freq: 5
    // próxima visita: 13/01/2025
    // hoje: 10/01/2025: em dia
    const last = "08/01/2025 10:00:00";
    const freq = 5;

    const pendente = isVisitaPendente(last, freq, HOJE);
    expect(pendente).toBe(false);

    const diasAtraso = getDiasAtraso(last, freq, HOJE);
    expect(diasAtraso).toBe(0);

    const diasParaVencer = getDiasParaVencer(last, freq, HOJE);
    // 10 -> 13 = 3 dias
    expect(diasParaVencer).toBe(3);
  });

  it("isVencendoHoje deve ser true quando a próxima visita cai exatamente na data atual", () => {
    // última visita: 05/01/2025, freq: 5
    // próxima visita: 10/01/2025 (igual a hoje)
    const last = "05/01/2025 10:00:00";
    const freq = 5;

    const vencendoHoje = isVencendoHoje(last, freq, HOJE);
    expect(vencendoHoje).toBe(true);

    // não deve ser considerada pendente ainda
    const pendente = isVisitaPendente(last, freq, HOJE);
    expect(pendente).toBe(false);

    const diasAtraso = getDiasAtraso(last, freq, HOJE);
    expect(diasAtraso).toBe(0);

    const diasParaVencer = getDiasParaVencer(last, freq, HOJE);
    expect(diasParaVencer).toBe(0);
  });

  it("getDiasAtraso deve retornar 0 quando não estiver atrasado", () => {
    // próxima visita ainda no futuro
    const last = "08/01/2025 10:00:00"; // próxima 13
    const freq = 5;

    const diasAtraso = getDiasAtraso(last, freq, HOJE);
    expect(diasAtraso).toBe(0);
  });

  it("getDiasParaVencer deve retornar 0 quando já estiver vencida", () => {
    // próxima visita em 04/01/2025, hoje 10/01/2025
    const last = "01/01/2025 10:00:00";
    const freq = 3;

    const diasParaVencer = getDiasParaVencer(last, freq, HOJE);
    expect(diasParaVencer).toBe(0);
  });

  it("formatDateTime deve formatar a data no padrão dd/mm/aaaa hh:mm", () => {
    const d = new Date(2025, 0, 5, 10, 15, 0); // 05/01/2025 10:15
    const formatted = formatDateTime(d);

    // verifica formato da data
    expect(formatted).toContain("05/01/2025");
    expect(formatted).toContain("10:15");
  });
});

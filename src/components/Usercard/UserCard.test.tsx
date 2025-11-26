import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserCard } from "./UserCard";
import type { PessoasParaVisitar } from "../../types/visitas";

// mocks
vi.mock("../../utils/date", () => ({
  parseDataVisita: vi.fn(() => new Date(2025, 0, 1, 10, 0, 0)),
  getDataProximaVisita: vi.fn(() => new Date(2025, 0, 10, 10, 0, 0)),
  isVisitaPendente: vi.fn(),
  isVencendoHoje: vi.fn(),
  formatDateTime: vi.fn(() => "DATA_FORMATADA"),
  getDiasAtraso: vi.fn(),
  getDiasParaVencer: vi.fn(),
}));

vi.mock("../../api/visitas.service", () => ({
  registrarVisita: vi.fn(),
}));

// import dos mocks
import {
  isVisitaPendente,
  isVencendoHoje,
  getDiasAtraso,
  getDiasParaVencer,
} from "../../utils/date";

import { registrarVisita } from "../../api/visitas.service";

// criar consts a partir doss mocks
const mockIsPendente = vi.mocked(isVisitaPendente);
const mockIsVencendo = vi.mocked(isVencendoHoje);
const mockAtraso = vi.mocked(getDiasAtraso);
const mockDiasParaVencer = vi.mocked(getDiasParaVencer);
const mockRegistrarVisita = vi.mocked(registrarVisita);


// helper para criar objetos tipados
const mkPessoa = (p: Partial<PessoasParaVisitar> = {}): PessoasParaVisitar => ({
  id: "1",
  name: "Fulano de Tal",
  cpf: "123.456.789-00",
  active: true,
  last_verified_date: "2025/01/01 10:00:00",
  verify_frequency_in_days: 7,
  ...p,
});

// testes
describe("UserCard", () => {
  it("renderiza nome, CPF e datas corretamente", () => {
    mockIsPendente.mockReturnValue(false);
    mockIsVencendo.mockReturnValue(false);

    render(<UserCard user={mkPessoa()} />);

    expect(screen.getByText("Fulano de Tal")).toBeInTheDocument();

    const datas = screen.getAllByText("DATA_FORMATADA");
    expect(datas.length).toBeGreaterThanOrEqual(2); // última e próxima visita
  });

  it("exibe badge de atraso leve (≤ 3 dias)", () => {
    mockIsPendente.mockReturnValue(true);
    mockAtraso.mockReturnValue(2);

    render(<UserCard user={mkPessoa()} />);

    expect(screen.getByText("2 dias em atraso")).toBeInTheDocument();
  });

  it("exibe badge de atraso grave (> 3 dias)", () => {
    mockIsPendente.mockReturnValue(true);
    mockAtraso.mockReturnValue(5);

    render(<UserCard user={mkPessoa()} />);

    expect(screen.getByText("5 dias em atraso")).toBeInTheDocument();
  });

  it("exibe badge 'Vence hoje'", () => {
    mockIsPendente.mockReturnValue(false);
    mockIsVencendo.mockReturnValue(true);

    render(<UserCard user={mkPessoa()} />);

    expect(screen.getByText("Vence hoje")).toBeInTheDocument();
  });

  it("exibe 'Vence em X dias' quando em dia e não vence hoje", () => {
    mockIsPendente.mockReturnValue(false);
    mockIsVencendo.mockReturnValue(false);
    mockDiasParaVencer.mockReturnValue(4);

    render(<UserCard user={mkPessoa()} />);

    expect(screen.getByText("Vence em 4 dias")).toBeInTheDocument();
  });

  it("não mostra botão se usuário está inativo", () => {
    mockIsPendente.mockReturnValue(false);

    render(<UserCard user={mkPessoa({ active: false })} />);

    expect(
      screen.queryByRole("button", { name: /registrar visita/i })
    ).not.toBeInTheDocument();
  });

  it("chama registrarVisita e dispara evento global", async () => {
    mockIsPendente.mockReturnValue(false);
    mockRegistrarVisita.mockResolvedValue("2025/02/01 10:00:00");

    const eventoSpy = vi.spyOn(window, "dispatchEvent");

    render(<UserCard user={mkPessoa()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /registrar visita/i })
    );

    expect(mockRegistrarVisita).toHaveBeenCalledWith("1");

    await waitFor(() => {
      expect(eventoSpy).toHaveBeenCalled();

      const evt = eventoSpy.mock.calls[0][0] as CustomEvent;
      expect(evt.type).toBe("visita-registrada");
      expect(evt.detail).toMatchObject({
        id: "1",
        name: "Fulano de Tal",
      });
    });
  });
});

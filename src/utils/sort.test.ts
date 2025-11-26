import { describe, it, expect, vi, type Mock } from "vitest";
import type { PessoasParaVisitar } from "../types/visitas";

// modulo mockado para importar ordenarVisitas
vi.mock("./date", () => ({
  isVisitaPendente: vi.fn(),
  getDataProximaVisita: vi.fn(),
}));

// import das funções mockadas e a função a ser testada
import { isVisitaPendente, getDataProximaVisita } from "./date";
import { ordenarVisitas } from "./sort";

describe("utils/sort - ordenarVisitas", () => {
  const mkPessoa = (
    overrides: Partial<PessoasParaVisitar>
  ): PessoasParaVisitar =>
    ({
      id: "0",
      name: "Pessoa",
      cpf: "000",
      active: true,
      last_verified_date: "data",
      verify_frequency_in_days: 7,
      ...overrides,
    } as PessoasParaVisitar);

  it("não deve mutar o array original", () => {
    const visitas = [
      mkPessoa({ id: "1", name: "A" }),
      mkPessoa({ id: "2", name: "B" }),
    ];

    const copiaOriginal = [...visitas];

    (isVisitaPendente as Mock).mockReturnValue(false);
    (getDataProximaVisita as Mock).mockReturnValue(new Date());

    const resultado = ordenarVisitas(visitas);

    expect(resultado).not.toBe(visitas);
    expect(visitas).toEqual(copiaOriginal);
  });

  it("coloca usuários ativos antes dos inativos", () => {
    const ativo = mkPessoa({ id: "1", name: "Ativo", active: true });
    const inativo = mkPessoa({ id: "2", name: "Inativo", active: false });

    (isVisitaPendente as Mock).mockReturnValue(false);
    (getDataProximaVisita as Mock).mockReturnValue(new Date());

    const resultado = ordenarVisitas([inativo, ativo]);

    expect(resultado.map((p) => p.id)).toEqual(["1", "2"]); // ativo depois inativo
  });

  it("entre ativos, pendentes vêm antes dos não pendentes", () => {
    const pendente = mkPessoa({
      id: "1",
      name: "Pendente",
      active: true,
      last_verified_date: "pendente",
    });
    const emDia = mkPessoa({
      id: "2",
      name: "Em dia",
      active: true,
      last_verified_date: "emdia",
    });

    // checa o pendente
    (isVisitaPendente as Mock).mockImplementation(
      (lastVerified: string) => lastVerified === "pendente"
    );

    (getDataProximaVisita as Mock).mockReturnValue(new Date());

    const resultado = ordenarVisitas([emDia, pendente]);

    expect(resultado.map((p) => p.id)).toEqual(["1", "2"]); // pendente primeiro
  });

  it("quando ambos têm mesmo status, ordena pela próxima data de visita (mais antiga primeiro)", () => {
    const pessoaA = mkPessoa({
      id: "1",
      name: "Pessoa A",
      active: true,
      last_verified_date: "a",
    });
    const pessoaB = mkPessoa({
      id: "2",
      name: "Pessoa B",
      active: true,
      last_verified_date: "b",
    });

    (isVisitaPendente as Mock).mockReturnValue(false);

    (getDataProximaVisita as Mock).mockImplementation(
      (lastVerified: string) => {
        if (lastVerified === "a") {
          return new Date(2025, 0, 10); // mais urgente
        }
        if (lastVerified === "b") {
          return new Date(2025, 0, 20); // menos urgente
        }
        return new Date(2025, 0, 15);
      }
    );

    const resultado = ordenarVisitas([pessoaB, pessoaA]);

    expect(resultado.map((p) => p.id)).toEqual(["1", "2"]); // A (10/01) vem antes de B (20/01)
  });
});

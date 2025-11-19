import type { PessoasParaVisitar } from "../types/visitas";

export async function getVisitas(): Promise<PessoasParaVisitar[]> {
    console.log("=== getVisitas called ===");

    const BASE_URL = "https://tatico.spocws.icu/teste/followups_f38d";

    const response = await fetch(BASE_URL);

    if (!response.ok) {
        throw new Error(`Erro ao buscar follow ups. Status: ${response.status}`);
    }

    const data = (await response.json()) as PessoasParaVisitar[];

    console.log("Sucesso ao buscar follow ups:", data);

    return data;
}
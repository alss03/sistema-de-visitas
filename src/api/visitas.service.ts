import type { PessoasParaVisitar } from "../types/visitas";

// funcao para buscar informacoes de visitas da API
export async function getVisitas(): Promise<PessoasParaVisitar[]> {
    console.log("=== getVisitas called ===");

    // definir URL da API
    const BASE_URL = "https://tatico.spocws.icu/teste/followups_f38d";

    // fazer requisição GET
    const response = await fetch(BASE_URL);

    // verificar se a resposta foi bem sucedida
    if (!response.ok) {
        throw new Error(`Erro ao buscar follow ups. Status: ${response.status}`);
    }

    // extrair dados JSON da resposta
    const data = (await response.json()) as PessoasParaVisitar[];

    console.log("Sucesso ao buscar follow ups:", data);

    // retornar dados
    return data;
}
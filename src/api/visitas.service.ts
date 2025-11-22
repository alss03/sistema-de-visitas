import type { PessoasParaVisitar } from "../types/visitas";

// URL base da API
const BASE_URL = "https://tatico.spocws.icu/teste/followups_f38d";

// Formata data atual no padrao da API
function formatNowForApi(): string {
  return new Date()
    .toLocaleString("pt-BR", { hour12: false })
    .replace(",", "")
    .replace(/-/g, "/");
}

// helper de fetch com erro padronizado
async function apiFetch(url: string, options?: RequestInit) {
    // realiza o fetch
  const response = await fetch(url, options);

  // verifica erros
  if (!response.ok) {
    throw new Error(
      `Erro na requisicao (${options?.method ?? "GET"}). Status: ${response.status}`
    );
  }

  return response;
}

// GET – obtem visitas
export async function getVisitas(): Promise<PessoasParaVisitar[]> {
  console.log("GET /visitas iniciando requisicao");

  // realiza o fetch
  const response = await apiFetch(BASE_URL);
  // extrai os dados
  const data = (await response.json()) as PessoasParaVisitar[];

  console.log("GET /visitas → sucesso:", data);
  return data;
}


// PATCH – registra visita
export async function registrarVisita(id: string): Promise<string> {
    // formata payload
  const formattedDate = formatNowForApi();
  // monta o payload
  const payload = { last_verified_date: formattedDate };

  console.log(`PATCH /visitas/${id} enviando`, payload);

  // realiza o fetch
  await apiFetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log(`PATCH /visitas/${id} sucesso`);

  return formattedDate;
}
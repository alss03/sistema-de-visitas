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
  try {
    // realiza a requisicao
    const response = await fetch(url, options);

    // verifica erros HTTP
    if (!response.ok) {
      console.error(
        // log detalhado do erro
        `Erro HTTP em ${options?.method ?? "GET"} ${url}:`,
        response.status,
        response.statusText
      );

      // mapeia mensagens de erro
      let message = "Erro ao comunicar com o servidor. Tente novamente.";

      // mensagens especificas por status
      if (response.status >= 500) {
        message = "Erro interno no servidor. Tente novamente em alguns instantes.";
      } else if (response.status === 404) {
        message = "Recurso não encontrado. Verifique a URL da API.";
      } else if (response.status === 400) {
        message = "Requisição inválida. Verifique os dados enviados.";
      }

      // lanca o erro com a mensagem apropriada
      throw new Error(message);
    }

    // retorna a resposta se tudo estiver ok
    return response;
  } catch (err) {
    // Erro de rede / CORS / queda de conexao
    console.error(`Falha na requisição:`, err);
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
    );
  }
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
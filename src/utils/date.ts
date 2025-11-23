// funcao para converter string de data em objeto Date
// aceita "yyyy/mm/dd hh:mm:ss" e "dd/mm/yyyy hh:mm:ss"
export function parseDataVisita(input: string): Date {
  // separa data e hora
  const [datePart, timePart = "00:00:00"] = input.split(" ");

  // separa componentes da data
  const [p1, p2, p3] = datePart.split("/");

  // determina ordem dos componentes
  let year: number;
  let month: number;
  let day: number;

  // se o primeiro pedaço tiver 4 dígitos, é ano (yyyy/mm/dd)
  if (p1.length === 4) {
    year = Number(p1);
    month = Number(p2);
    day = Number(p3);
  } else {
    // senão, assumimos dd/mm/yyyy
    day = Number(p1);
    month = Number(p2);
    year = Number(p3);
  }

  // separa componentes da hora
  const [hour = 0, minute = 0, second = 0] = timePart
    .split(":")
    .map(Number);

  // cria e retorna o objeto Date
  return new Date(year, month - 1, day, hour, minute, second);
}


// funcao para calcular a próxima data de visita seguindo a regra last_verified_date + verify_frequency_in_days
export function getDataProximaVisita(lastVerified: string, frequencyInDays: number): Date {
   // obtém a data da última visita
    const last = parseDataVisita(lastVerified);
    // calcula a próxima data somando os dias de frequencia
    const next = new Date(last.getTime());
    // adiciona os dias
    next.setDate(next.getDate() + frequencyInDays);
    return next;
}

// funcao para verificar se a visita está pendente (data atual > data próxima visita)
export function isVisitaPendente(lastVerified: string, frequencyInDays: number, now: Date = new Date()): boolean {
    // obtem a próxima data de visita
    const next = getDataProximaVisita(lastVerified, frequencyInDays);
    // compara com a data atual
    return next.getTime() < now.getTime();
}

// calcula quantos dias a visita esta em atraso
// se nao venceu, retorna 0
export function getDiasAtraso(
  last_verified_date: string,
  verify_frequency_in_days: number
): number {
  
  // proxima visita esperada
  const nextVisit = getDataProximaVisita(
    last_verified_date,
    verify_frequency_in_days
  );

  const hoje = new Date();

  // calcula diferenca em milissegundos
  const diffMs = hoje.getTime() - nextVisit.getTime();

  // se nao venceu ainda, retorna 0
  if (diffMs <= 0) {
    return 0;
  }

  // converte milissegundos em dias
  const MS_POR_DIA = 1000 * 60 * 60 * 24;
  return Math.floor(diffMs / MS_POR_DIA);
}

// funcao para formatar objeto Date em string "dd/mm/yyyy hh:mm"
export function formatDateTime(date: Date): string {
    // formata a data conforme o padrao pt-BR
    return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
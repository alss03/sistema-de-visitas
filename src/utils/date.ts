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
  const [hour = 0, minute = 0, second = 0] = timePart.split(":").map(Number);

  // cria e retorna o objeto Date
  return new Date(year, month - 1, day, hour, minute, second);
}

// funcao para calcular a próxima data de visita seguindo a regra last_verified_date + verify_frequency_in_days
export function getDataProximaVisita(
  lastVerified: string,
  frequencyInDays: number
): Date {
  // obtém a data da última visita
  const last = parseDataVisita(lastVerified);
  // calcula a próxima data somando os dias de frequencia
  const next = new Date(last.getTime());
  // adiciona os dias
  next.setDate(next.getDate() + frequencyInDays);
  return next;
}

// funcao para verificar se a visita está pendente (data atual > data próxima visita)
export function isVisitaPendente(
  lastVerified: string,
  frequencyInDays: number,
  now: Date = new Date()
): boolean {
  // calcula a proxima data de visita
  const next = getDataProximaVisita(lastVerified, frequencyInDays);

  // zera hora, minuto, segundo e ms da data atual
  const hoje = new Date(now);
  hoje.setHours(0, 0, 0, 0);

  // zera hora, minuto, segundo e ms da data limite
  const limite = new Date(next);
  limite.setHours(0, 0, 0, 0);

  // pendente somente se limite < hoje
  return limite.getTime() < hoje.getTime();
}

// helper: verifica se a visita vence hoje (mesmo dia e ainda nao pendente)
export function isVencendoHoje(
  lastVerified: string,
  frequencyInDays: number,
  now: Date = new Date()
): boolean {
  const next = getDataProximaVisita(lastVerified, frequencyInDays);

  const hoje = new Date(now);
  hoje.setHours(0, 0, 0, 0);

  const limite = new Date(next);
  limite.setHours(0, 0, 0, 0);

  return limite.getTime() === hoje.getTime();
}

// calcula quantos dias a visita esta em atraso
// se nao venceu, retorna 0
export function getDiasAtraso(
  last_verified_date: string,
  verify_frequency_in_days: number,
  now: Date = new Date()
): number {
  // proxima visita esperada
  const nextVisit = getDataProximaVisita(
    last_verified_date,
    verify_frequency_in_days
  );

  // normaliza hoje e data limite para meia-noite
  const hoje = new Date(now);
  hoje.setHours(0, 0, 0, 0);

  const limite = new Date(nextVisit);
  limite.setHours(0, 0, 0, 0);

  // calcula diferenca em milissegundos
  const diffMs = hoje.getTime() - limite.getTime();

  // se nao venceu ainda (hoje <= limite), retorna 0
  if (diffMs <= 0) {
    return 0;
  }

  // converte milissegundos em dias
  const MS_POR_DIA = 1000 * 60 * 60 * 24;
  return Math.round(diffMs / MS_POR_DIA);
}

// calcula em quantos dias a visita vai vencer
// se já venceu ou vence hoje, retorna 0
export function getDiasParaVencer(
  last_verified_date: string,
  verify_frequency_in_days: number,
  now: Date = new Date()
): number {
  // próxima visita esperada
  const nextVisit = getDataProximaVisita(
    last_verified_date,
    verify_frequency_in_days
  );

  // normaliza hoje e a data limite para meia-noite
  const hoje = new Date(now);
  hoje.setHours(0, 0, 0, 0);

  const limite = new Date(nextVisit);
  limite.setHours(0, 0, 0, 0);

  const diffMs = limite.getTime() - hoje.getTime();

  // se já venceu ou vence hoje, consideramos 0
  if (diffMs <= 0) return 0;

  const MS_POR_DIA = 1000 * 60 * 60 * 24;
  return Math.round(diffMs / MS_POR_DIA);
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

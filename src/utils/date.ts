// funcao para converter string "dd/mm/yyyy hh:mm:ss" em objeto Date
export function parseDataVisita(input: string): Date {
    const [datePart, timePart] = input.split("");

    const [day, month, year] = datePart.split("/").map(Number);
    const [hour = 0, minute = 0, second = 0] =
    timePart?.split(":").map(Number) ?? [];

    return new Date(year, month - 1, day, hour, minute, second);
}

// funcao para calcular a próxima data de visita seguindo a regra last_verified_date + verify_frequency_in_days
export function getDataProximaVisita(lastVerified: string, frequencyInDays: number): Date {
    const last = parseDataVisita(lastVerified);
    const next = new Date(last.getTime());
    next.setDate(next.getDate() + frequencyInDays);
    return next;
}

// funcao para verificar se a visita está pendente (data atual > data próxima visita)
export function isVisitaPendente(lastVerified: string, frequencyInDays: number, now: Date = new Date): boolean {
    const next = getDataProximaVisita(lastVerified, frequencyInDays);
    return next.getTime() < now.getTime();
}

export function formatDateTime(date: Date): string {
    return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
// interface que contem informacoes das pessoas a serem visitadas
export interface PessoasParaVisitar {
    id: string;
    name: string;
    cpf: string;
    active: boolean;
    last_verified_date: string;
    verify_frequency_in_days: number;
}
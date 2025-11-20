import type { PessoasParaVisitar } from "../types/visitas";
import { isVisitaPendente, getDataProximaVisita } from "./date";

// funcao para ordenar a lista de visitas
export function ordenarVisitas(visitas: PessoasParaVisitar[]) {
    // cria uma cópia do array para não mutar o original
    return [...visitas].sort((a, b) => {
        // verifica se as visitas estão pendentes
        const aPendente = isVisitaPendente(a.last_verified_date, a.verify_frequency_in_days);
        const bPendente = isVisitaPendente(b.last_verified_date, b.verify_frequency_in_days);

        // usuarios ativos vem antes dos inativos
        if(a.active && !b.active) return -1;
        if(!a.active && b.active) return 1;

        // visitas pendentes vem antes das não pendentes
        if (aPendente && !bPendente) return -1;
        if (!aPendente && bPendente) return 1;

        // ordenar pela proxima data de visita
        const aNextDate = getDataProximaVisita(a.last_verified_date, a.verify_frequency_in_days);
        const bNextDate = getDataProximaVisita(b.last_verified_date, b.verify_frequency_in_days);

        // ordem crescente pela proxima data de visita
        return aNextDate.getTime() - bNextDate.getTime();
    });
}
import type { PessoasParaVisitar } from "../types/visitas";
import { isVisitaPendente, getDataProximaVisita } from "./date";

export function ordenarVisitas(visitas: PessoasParaVisitar[]) {
    return [...visitas].sort((a, b) => {
        const aPendente = isVisitaPendente(a.last_verified_date, a.verify_frequency_in_days);
        const bPendente = isVisitaPendente(b.last_verified_date, b.verify_frequency_in_days);

        if (aPendente && !bPendente) return -1;
        if (!aPendente && bPendente) return 1;

        if(a.active && !b.active) return -1;
        if(!a.active && b.active) return 1;

        const aNextDate = getDataProximaVisita(a.last_verified_date, a.verify_frequency_in_days);
        const bNextDate = getDataProximaVisita(b.last_verified_date, b.verify_frequency_in_days);
        
        return aNextDate.getTime() - bNextDate.getTime();
    });
}
import React, { useEffect, useState } from "react";
import { getVisitas } from "../api/visitas.service";
import type { PessoasParaVisitar } from "../types/visitas";
import { parseDataVisita, getDataProximaVisita, isVisitaPendente, formatDateTime } from "../utils/date";
import { ordenarVisitas } from "../utils/sort";

export const Dashboard: React.FC = () => {
  console.log("=Dashboard exibido");

    const [visitas, setVisitas] = useState<PessoasParaVisitar[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const result = await getVisitas();
                setVisitas(result);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
    <main>
      <h1>Sistema de Visitas</h1>
      <p>Total de usuários: {visitas.length}</p>

      <ul>
        {ordenarVisitas(visitas).map((user) => {
          const lastVisit = parseDataVisita(user.last_verified_date);
          const nextVisit = getDataProximaVisita(
            user.last_verified_date,
            user.verify_frequency_in_days
          );
          const pending = isVisitaPendente(
            user.last_verified_date,
            user.verify_frequency_in_days
          );

          return (
            <li
              key={user.id}
            >
              <strong>{user.name}</strong> - CPF: {user.cpf}
              <br />
              Última visita: {formatDateTime(lastVisit)}
              <br />
              Próxima visita: {formatDateTime(nextVisit)}
              <br />
              Status:{" "}
              {pending
                ? "Pendência de visita"
                : user.active
                ? "Em dia"
                : "Inativo"}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

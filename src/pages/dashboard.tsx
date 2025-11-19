import React, { useEffect, useState } from "react";
import { getVisitas } from "../api/visitas.service";
import type { PessoasParaVisitar } from "../types/visitas";

export const Dashboard: React.FC = () => {
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
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Sistema de Visitas</h1>
      <p>Total de usuários: {visitas.length}</p>

      <ul>
        {visitas.map((visitado) => (
          <li key={visitado.id}>
            <strong>{visitado.name}</strong> - CPF: {visitado.cpf} - Ativo:{" "}
            {visitado.active ? "Sim" : "Não"} - Última visita: {visitado.last_verified_date}
            - Frequência em dias para a próxima visita: {visitado.verify_frequency_in_days}
          </li>
        ))}
      </ul>
    </main>
  );
}

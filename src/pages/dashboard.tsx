import React, { useEffect, useState } from "react";
import { getVisitas } from "../api/visitas.service";
import type { PessoasParaVisitar } from "../types/visitas";
import { ordenarVisitas } from "../utils/sort";
import { UserCard } from "../components/Usercard/UserCard";
import styles from "./Dashboard.module.scss";


// componente Dashboard
export const Dashboard: React.FC = () => {
  console.log("=Dashboard exibido");

    // estados locais
    const [visitas, setVisitas] = useState<PessoasParaVisitar[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // carregar dados ao montar o componente
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

    // renderizar loading enquanto carrega dados
    if (loading) {
        return <div>Loading...</div>;
    }

    // renderizar erro se houver
    if (error) {
        return <div>Error: {error}</div>;
    }

    const visitasOrdenadas = ordenarVisitas(visitas);

    // renderizar lista de visitas
    return (
    <main className={styles.container}>
      <h1 className={styles.title}>Sistema de Visitas</h1>
      <p className={styles.subtitle}>
        Total de usuários: {visitasOrdenadas.length}
      </p>

      <ul className={styles.list}>
        {visitasOrdenadas.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </ul>
    </main>
  );
}

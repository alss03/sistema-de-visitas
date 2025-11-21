import React, { useEffect, useState } from "react";
import { getVisitas } from "../api/visitas.service";
import type { PessoasParaVisitar } from "../types/visitas";
import { ordenarVisitas } from "../utils/sort";
import { UserCard } from "../components/Usercard/UserCard";
import styles from "./Dashboard.module.scss";
import { isVisitaPendente } from "../utils/date";

type FiltroVisitas = "todas" | "pendentes" | "ativas" | "inativas";


// componente Dashboard
export const Dashboard: React.FC = () => {
  console.log("=Dashboard exibido");

  // estados locais
  const [visitas, setVisitas] = useState<PessoasParaVisitar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroVisitas>("todas");

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

  // ordenar e filtrar visitas
  const visitasOrdenadas = ordenarVisitas(visitas);

  // aplicar filtro
  const visitasFiltradas = visitasOrdenadas.filter((user) => {
    // verificar se a visita está pendente
    const pendente = isVisitaPendente(
      user.last_verified_date,
      user.verify_frequency_in_days
    );

    // aplicar filtro selecionado
    switch (filtro) {
      case "pendentes":
        return user.active && pendente;
      case "ativas":
        return user.active && !pendente;
      case "inativas":
        return !user.active;
      case "todas":
      default:
        return true;
    }
  });

    // renderizar lista de visitas
     return (
    <main className={styles.container}>
      <h1 className={styles.title}>Sistema de Visitas</h1>
      <p className={styles.subtitle}>
        Total de usuários: {visitas.length}{" "}
        {filtro !== "todas" && `• exibindo: ${visitasFiltradas.length}`}
      </p>

      {/* botões de filtro */}
      <div className={styles.filters}>
        <button
          type="button"
          className={`${styles.filterButton} ${
            filtro === "todas" ? styles.filterButtonActive : ""
          }`}
          onClick={() => setFiltro("todas")}
        >
          Todas
        </button>

        <button
          type="button"
          className={`${styles.filterButton} ${
            filtro === "pendentes" ? styles.filterButtonActive : ""
          }`}
          onClick={() => setFiltro("pendentes")}
        >
          Pendentes
        </button>

        <button
          type="button"
          className={`${styles.filterButton} ${
            filtro === "ativas" ? styles.filterButtonActive : ""
          }`}
          onClick={() => setFiltro("ativas")}
        >
          Ativas
        </button>

        <button
          type="button"
          className={`${styles.filterButton} ${
            filtro === "inativas" ? styles.filterButtonActive : ""
          }`}
          onClick={() => setFiltro("inativas")}
        >
          Inativas
        </button>
      </div>

      {/* lista de usuários */}
      <ul className={styles.list}>
        {visitasFiltradas.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </ul>
    </main>
  );
}

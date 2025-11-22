import React from "react";
import styles from "./StatsBar.module.scss";

// definir tipos de filtro (mesmos valores usados no Dashboard)
type FiltroVisitas = "todas" | "pendentes" | "emdia" | "ativas" | "inativas";

// props do componente StatsBar
interface StatsBarProps {
  total: number;
  ativos: number;
  pendentes: number;
  inativos: number;
  emDia: number;
  percentualEmDia: number;
  currentFilter: FiltroVisitas;
  onFilterChange: (filtro: FiltroVisitas) => void;
}

// componente StatsBar
export const StatsBar: React.FC<StatsBarProps> = ({
  total,
  ativos,
  pendentes,
  inativos,
  emDia,
  percentualEmDia,
  currentFilter,
  onFilterChange,
}) => {
  // renderizar barra de estatísticas com botoes de filtro
  return (
    <section className={styles.container}>
      {/* total */}
      <button
        type="button"
        className={`${styles.card} ${
          currentFilter === "todas" ? styles.cardActive : ""
        }`}
        onClick={() => onFilterChange("todas")}
      >
        <span className={styles.label}>Total de pessoas</span>
        <span className={styles.value}>{total}</span>
      </button>

      {/* pendentes entre ativas */}
      <button
        type="button"
        className={`${styles.card} ${
          currentFilter === "pendentes" ? styles.cardActive : ""
        }`}
        onClick={() => onFilterChange("pendentes")}
      >
        <span className={styles.label}>Pendentes (entre ativas)</span>
        <span className={`${styles.value} styles.valuePending`}>
          {pendentes}
        </span>
      </button>

      {/* em dia entre ativas */}
      <button
        type="button"
        className={`${styles.card} ${
          currentFilter === "emdia" ? styles.cardActive : ""
        }`}
        onClick={() => onFilterChange("emdia")}
      >
        <span className={styles.label}>Em dia (entre ativas)</span>
        <div className={styles.inlineValues}>
          <span className={styles.value}>{emDia}</span>
          <span className={styles.valuePercent}>({percentualEmDia}%)</span>
        </div>
      </button>

      {/* ativas */}
      <button
        type="button"
        className={`${styles.card} ${
          currentFilter === "ativas" ? styles.cardActive : ""
        }`}
        onClick={() => onFilterChange("ativas")}
      >
        <span className={styles.label}>Ativas</span>
        <span className={styles.value}>{ativos}</span>
      </button>

      {/* inativas */}
      <button
        type="button"
        className={`${styles.card} ${
          currentFilter === "inativas" ? styles.cardActive : ""
        }`}
        onClick={() => onFilterChange("inativas")}
      >
        <span className={styles.label}>Inativas</span>
        <span className={`${styles.value} ${styles.valueInactive}`}>
          {inativos}
        </span>
      </button>
    </section>
  );
};

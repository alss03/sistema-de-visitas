// src/pages/Dashboard.tsx
import React from "react";
import { UserCard } from "../components/UserCard/UserCard";
import styles from "./Dashboard.module.scss";
import { StatsBar } from "../components/StatsBar/StatsBar";
import { StatusPieChart } from "../components/StatusPieChart/StatusPieChart";
import { FrequencyBarChart } from "../components/FrequencyBarChart/FrequencyBarChart";
import { useVisitasDashboard } from "../hooks/useVisitasDashboard";
import Spinner from "../components/Spinner/Spinner";
import { ErrorMessage } from "../components/ErrorMessage/ErrorMessage";

export const Dashboard: React.FC = () => {
  console.log("=Dashboard exibido");

  const {
    loading,
    error,
    flashMessage,
    visitasFiltradas,
    resumo,
    frequenciaData,
    filtro,
    setFiltro,
    busca,
    setBusca,
    reload,
    modoOrdenacao,
    setModoOrdenacao,
  } = useVisitasDashboard();

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <main>
        <ErrorMessage message={error} onRetry={reload} />
      </main>
    );
  }

  const { total, ativos, inativos, pendentes, emDia, percentualEmDia } =
    resumo;

  return (
    <main className={styles.container}>
      {/* toast de feedback */}
      {flashMessage && <div className={styles.toast}>{flashMessage}</div>}

      {/* barra de estatisticas + filtro */}
      <StatsBar
        total={total}
        ativos={ativos}
        pendentes={pendentes}
        inativos={inativos}
        emDia={emDia}
        percentualEmDia={percentualEmDia}
        currentFilter={filtro}
        onFilterChange={setFiltro}
      />

      {/* area principal em 2 colunas */}
      <section className={styles.content}>
        {/* coluna esquerda: busca + cards */}
        <div className={styles.leftColumn}>
          {/* linha com busca + modo de visualizacao */}
          <div className={styles.searchRow}>
            {/* card de busca por nome/CPF */}
            <div className={styles.searchCard}>
              <label className={styles.searchLabel} htmlFor="search">
                Buscar por nome ou CPF
              </label>
              <input
                id="search"
                type="text"
                placeholder="Digite um nome ou CPF..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* seletor de visualizacao/ordenacao */}
            <div className={styles.viewModeCard}>
              <label className={styles.searchLabel} htmlFor="viewMode">
                Visualização
              </label>
              <select
                id="viewMode"
                value={modoOrdenacao}
                onChange={(e) =>
                  setModoOrdenacao(
                    e.target.value as "urgencia" | "alfabetica" | "recentes"
                  )
                }
                className={styles.viewModeSelect}
              >
                <option value="urgencia">Por urgência</option>
                <option value="alfabetica">Ordem alfabética</option>
                <option value="recentes">Visitas mais recentes</option>
              </select>
            </div>
          </div>

          {/* lista ou estado vazio */}
          {visitasFiltradas.length === 0 ? (
            <div className={styles.emptyState}>
              Nenhum usuário encontrado com os filtros e a busca atuais.
            </div>
          ) : (
            <ul className={styles.list}>
              {visitasFiltradas.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </ul>
          )}
        </div>

        {/* coluna direita: progressBar + graficos */}
        <div className={styles.rightColumn}>
          {/* card de porcentagem em dia */}
          <div className={styles.progressCard}>
            <div className={styles.progressTitleRow}>
              <span className={styles.progressTitle}>
                {emDia} de {ativos} ativos em dia
              </span>
            </div>

            <div className={styles.percentageAndProgress}>
              <div className={styles.progressHeader}>
                <span className={styles.progressPercentBig}>
                  {percentualEmDia}%
                </span>
                <span className={styles.progressDescription} />
              </div>

              <div className={styles.progressBarWrapper}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${percentualEmDia}%` }}
                />
              </div>
            </div>
          </div>

          {/* graficos */}
          <StatusPieChart
            emDiaSeguro={resumo.emDiaSeguro}
            venceHoje={resumo.venceHoje}
            atrasoLeve={resumo.atrasoLeve}
            atrasoGrave={resumo.atrasoGrave}
            inativos={resumo.inativos}
          />
          <FrequencyBarChart data={frequenciaData} />
        </div>
      </section>
    </main>
  );
};

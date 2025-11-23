import React from "react";
import type { PessoasParaVisitar } from "../../types/visitas";
import {
  parseDataVisita,
  getDataProximaVisita,
  isVisitaPendente,
  formatDateTime,
  getDiasAtraso,
} from "../../utils/date";
import { registrarVisita } from "../../api/visitas.service";
import styles from "./UserCard.module.scss";

// props do componente UserCard
interface UserCardProps {
  user: PessoasParaVisitar;
}

// componente UserCard
export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  console.log("=UserCard renderizado para:", user.id, user.name);

  // converte ultima data de visita
  const lastVisit = parseDataVisita(user.last_verified_date);
  // calcula próxima data de visita
  const nextVisit = getDataProximaVisita(
    user.last_verified_date,
    user.verify_frequency_in_days
  );
  // verifica se a visita esta pendente
  const pending = isVisitaPendente(
    user.last_verified_date,
    user.verify_frequency_in_days
  );

  // dias de atraso (se estiver pendente e ativo)
  const diasAtraso =
    pending && user.active
      ? getDiasAtraso(
          user.last_verified_date,
          user.verify_frequency_in_days
        )
      : 0;

  // determina status inativo/pendente/em dia
  const statusText = !user.active
    ? "Inativo"
    : pending
    ? "Visita Pendente"
    : "Em dia";

  // determina classe SCSS para o status
  const statusClass = !user.active
    ? styles.statusInactive
    : pending
    ? styles.statusPending
    : styles.statusOk;

  // severidade visual para o badge de atraso
  let badgeSeverityClass = "";
  if (pending && user.active) {
    if (diasAtraso <= 0) {
      // vence hoje
      badgeSeverityClass = styles.badgeLow;
    } else if (diasAtraso <= 3) {
      // pouco atraso
      badgeSeverityClass = styles.badgeMedium;
    } else {
      // muito atraso
      badgeSeverityClass = styles.badgeHigh;
    }
  }

  // texto do badge
  const badgeText =
    !pending || !user.active
      ? ""
      : diasAtraso <= 0
      ? "Vence hoje"
      : `${diasAtraso} dia${diasAtraso > 1 ? "s" : ""} em atraso`;

  // funcao botao registrar visita
  async function handleRegistrarVisita() {
    try {
      const newLastVerified = await registrarVisita(user.id);

      // envia evento global para o Dashboard atualizar o estado
      const event = new CustomEvent("visita-registrada", {
        detail: { id: user.id, lastVerified: newLastVerified, name: user.name },
      });
      window.dispatchEvent(event);

      console.log("Visita registrada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar visita.");
    }
  }

  // renderizar cartao do usuario
  return (
    <li className={styles.card}>
      {/* header com nome + badge de atraso */}
      <div className={styles.headerRow}>
        <div className={styles.name}>{user.name}</div>

        {pending && user.active && (
          <span className={`${styles.badge} ${badgeSeverityClass}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.infoLabel}>CPF: </span>
        <span>{user.cpf}</span>
        </div>
      <div className={styles.info}>
        <span className={styles.infoLabel}>Última visita: </span>
        <span>{formatDateTime(lastVisit)}</span>
      </div>
      <div className={styles.info}>
        <span className={styles.infoLabel}>Próxima visita: </span>
        <span>{formatDateTime(nextVisit)}</span>
      </div>
      <div className={`${styles.status} ${statusClass}`}>{statusText}</div>

      {user.active && (
        <button className={styles.button} onClick={handleRegistrarVisita}>
          Registrar Visita
        </button>
      )}
    </li>
  );
};
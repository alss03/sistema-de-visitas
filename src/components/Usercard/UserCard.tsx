import React from "react";
import type { PessoasParaVisitar } from "../../types/visitas";
import { parseDataVisita, getDataProximaVisita, isVisitaPendente, formatDateTime } from "../../utils/date";
import styles from "./UserCard.module.scss";

// props do componente UserCard
interface UserCardProps {
  user: PessoasParaVisitar;
}

// componente UserCard
export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  console.log("=UserCard renderizado para:", user.id, user.name);

  // converter última data de visita
  const lastVisit = parseDataVisita(user.last_verified_date);
  // calcular próxima data de visita
  const nextVisit = getDataProximaVisita(
    user.last_verified_date,
    user.verify_frequency_in_days
  );
  // verificar se a visita está pendente
  const pending = isVisitaPendente(
    user.last_verified_date,
    user.verify_frequency_in_days
  );

  // determinar status inativo/pendente/em dia
  const statusText = !user.active
    ? "Inativo"
    : pending
    ? "Visita Pendente"
    : "Em dia";

  // determinar classe SCSS para o status
  const statusClass = !user.active
    ? styles.statusInactive
    : pending
    ? styles.statusPending
    : styles.statusOk;

// renderizar cartão do usuário
  return (
    <li className={styles.card}>
      <div className={styles.name}>{user.name}</div>
      <div className={styles.info}>CPF: {user.cpf}</div>
      <div className={styles.info}>Última visita: {formatDateTime(lastVisit)}</div>
      <div className={styles.info}>Próxima visita: {formatDateTime(nextVisit)}</div>
      <div className={`${styles.status} ${statusClass}`}>
        {statusText}
      </div>

      {/* TODO: botao de registrar visita */}
    </li>
  );
};
import React from "react";
import type { PessoasParaVisitar } from "../../types/visitas";
import { parseDataVisita, getDataProximaVisita, isVisitaPendente, formatDateTime } from "../../utils/date";
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

  // renderizar cartão do usuario
  return (
    <li className={styles.card}>
      <div className={styles.name}>{user.name}</div>
      <div className={styles.info}>CPF: {user.cpf}</div>
      <div className={styles.info}>Última visita: {formatDateTime(lastVisit)}</div>
      <div className={styles.info}>Próxima visita: {formatDateTime(nextVisit)}</div>
      <div className={`${styles.status} ${statusClass}`}>
        {statusText}
      </div>
      {user.active && (
        <button className={styles.button} onClick={handleRegistrarVisita}>
          Registrar Visita
        </button>
      )}
    </li>
  );
};
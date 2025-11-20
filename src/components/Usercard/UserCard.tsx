import React from "react";
import type { PessoasParaVisitar } from "../../types/visitas";
import { parseDataVisita, getDataProximaVisita, isVisitaPendente, formatDateTime } from "../../utils/date";

interface UserCardProps {
    user: PessoasParaVisitar;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
    console.log("=UserCard renderizado para:", user.id, user.name);

    const lastVisit = parseDataVisita(user.last_verified_date);
    const nextVisit = getDataProximaVisita(
        user.last_verified_date,
        user.verify_frequency_in_days
    );
    const pending = isVisitaPendente(
        user.last_verified_date,
        user.verify_frequency_in_days
    );

    const statusText = !user.active
        ? "Inativo"
        : pending
        ? "Visita Pendente"
        : "Em dia";

    return (
        <li
      style={{
        marginBottom: "1rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "0.75rem 1rem",
        listStyle: "none",
      }}
    >
      <div style={{ fontWeight: 600 }}>{user.name}</div>
      <div>CPF: {user.cpf}</div>
      <div>Última visita: {formatDateTime(lastVisit)}</div>
      <div>Próxima visita: {formatDateTime(nextVisit)}</div>
      <div>
        Status:{" "}
        <strong
          style={{
            color: !user.active
              ? "#888"
              : pending
              ? "#c53030" // vermelho
              : "#2f855a", // verde
          }}
        >
          {statusText}
        </strong>
      </div>

      {/* aqui depois entra o botão Registrar Visita */}
      {/* <button>Registrar visita</button> */}
    </li>
  );
};
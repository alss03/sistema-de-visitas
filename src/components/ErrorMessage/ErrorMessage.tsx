import styles from "./ErrorMessage.module.scss";
import { FiAlertTriangle } from "react-icons/fi";

export function ErrorMessage({
  message,
  onRetry,
}: {
  // mensagem de erro a ser exibida
  message: string;
  // funcao opcional para tentar novamente
  onRetry?: () => void;
}) {
  return (
    <div className={styles.errorBox}>
      {/* icone de alerta */}
      <FiAlertTriangle className={styles.icon} />
      <p>{message}</p>

      {/* botao de tentar novamente */}
      {onRetry && (
        <button onClick={onRetry} className={styles.retryBtn}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

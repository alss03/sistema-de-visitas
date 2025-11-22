import React from "react";
import styles from "./Header.module.scss";

// componente Header
export const Header: React.FC = () => {
    // renderizar header
    return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Lado esquerdo logo e nome do sistema */}
        <div className={styles.brand}>
          <span className={styles.logo}>bx2</span>
          <span className={styles.product}>Sistema de Visitas</span>
        </div>

        {/* Lado direito ambiente e user */}
        <div className={styles.actions}>
          <span className={styles.envTag}>Ambiente de testes</span>

          <div className={styles.user}>
            <div className={styles.userAvatar}>OP</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Operador</span>
              <span className={styles.userRole}>bx2</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

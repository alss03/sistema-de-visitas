import styles from "./Spinner.module.scss";

// componente Spinner
const Spinner = () => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.loader}></span>
    </div>
  );
};

export default Spinner;

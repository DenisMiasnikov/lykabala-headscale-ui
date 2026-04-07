import styles from "./form.module.css";

export const Form = ({title, subtitle, children}) => {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>

      <form className={styles.form}>
        {children}
      </form>
    </section>
  );
};

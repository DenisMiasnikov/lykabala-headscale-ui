import styles from "./page.module.css";

export const Page = ({title,subtitle, children}) => {
  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      {children}
    </main>
  )
}

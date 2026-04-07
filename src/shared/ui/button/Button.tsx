import styles from './button.module.css'

export const Button = ({onClick, type,  label}) => {
  return (
    <button onClick={onClick} className={styles.button} type={type}>{label}</button>
  )
}

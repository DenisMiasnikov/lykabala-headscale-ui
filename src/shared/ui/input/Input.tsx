import styles from "./input.module.css";

export const Input = ({value, onChange, type, placeholder, disabled = false}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  )
}

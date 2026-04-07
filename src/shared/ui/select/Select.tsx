import styles from "./select.module.css";

export const Select = ({value, onChange, items}) => {
  return (
    <div className={styles.selectWrapper}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.select}
      >
        {items.map(({label, value}) => (
          <option value={value} key={value}>{label}</option>
        ))}
      </select>
    </div>
  )
}

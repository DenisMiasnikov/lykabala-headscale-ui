import styles from "./toggle.module.css";

export const Toggle = ({value, onChange, label}) => {
  return (
    <label className={styles.switchRow}>
      <div
        className={`${styles.switch} ${
          value ? styles.switchActive : ""
        }`}
        onClick={() => onChange(!value)}
      >
        <div
          className={`${styles.knob} ${
            value ? styles.knobActive : ""
          }`}
        />
      </div>
      {label}
    </label>
  )
}

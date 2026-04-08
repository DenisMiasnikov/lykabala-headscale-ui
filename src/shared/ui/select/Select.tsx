import {SelectHTMLAttributes} from "react";
import styles from "./select.module.css";

interface ISelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  onChange: (arg: unknown) => void,
  items: {label: string, value: string}[]
  placeholder?: string;
}

export const Select = ({value, onChange, items, placeholder}: ISelectProps) => {
  return (
    <div className={styles.selectWrapper}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.select}
      >
        {placeholder && <option disabled={true} value={''}>{placeholder}</option>}
        {items.map(({label, value}) => (
          <option value={value} key={value}>{label}</option>
        ))}
      </select>
    </div>
  )
}

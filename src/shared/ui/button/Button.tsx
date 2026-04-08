import {ButtonHTMLAttributes} from "react";
import styles from './button.module.css'

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string,
  mode?: "primary" | "secondary" | "danger" | "default" |'action'
}

export const Button = ({onClick, type,  label,  mode}:IButtonProps) => {
  return (
    <button onClick={onClick} className={styles[mode || 'default']} type={type}>{label}</button>
  )
}

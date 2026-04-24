import styles from "./input.module.css";

interface IInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const Input = ({ value, onChange, onBlur, type, placeholder, disabled = false }: IInputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={styles.input}
      value={value}
      onBlur={onBlur}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
};

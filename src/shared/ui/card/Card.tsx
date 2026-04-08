import {ReactNode, useState} from "react";
import styles from "./card.module.css";

interface ICardProps {
  children: ReactNode,
  title?: string,
  collapsable?: boolean,
}

export const Card = ({title,collapsable, children}:ICardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.card}>
      {title && !collapsable && <h2 className={styles.cardTitle}>{title}</h2>}
      {collapsable && (
        <div
          className={styles.collapsableCardTitle}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{title}</span>
          <span>{isOpen ? "−" : "+"}</span>
        </div>
      )}
      {collapsable
        ? isOpen
          ? children
          : null
        : children}
    </div>
  )
}

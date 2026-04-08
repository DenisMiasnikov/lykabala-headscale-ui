import {ReactNode, useState} from "react";
import styles from "./card.module.css";

interface ICardProps {
  children?: ReactNode,
  title?: string,
  subTitle?: string,
  empty?: boolean,
  collapsable?: boolean,
  rightAction?: ReactNode
}

export const Card = ({title,subTitle,empty, collapsable, children, rightAction}:ICardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if(empty) {
    return (
      <div className={styles.emptyState}>
        <h3>{title}</h3>
        <p>{subTitle}</p>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      {title && !collapsable && (
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <h2 className={styles.cardTitle}>{title}</h2>
          {rightAction}
        </div>
      )}
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

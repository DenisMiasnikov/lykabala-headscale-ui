import React from "react";

import type {Namespace} from "../../types";
import {formatDate} from "../../../../shared/lib/date";

import styles from "./namespaceCard.module.css";

interface MachineCardProps {
  details: Namespace;
  actions?: () => React.ReactNode;
}

export default function NameSpaceCard({ details, actions }: MachineCardProps) {
  return (
    <>
        {details && (
          <div className={styles.card}>
            <div className={styles.header}>
              <img
                src={details.pictureUrl}
                alt="avatar"
                className={styles.avatar}
              />

              <div className={styles.userInfo}>
                <h2 className={styles.title}>{details.name}</h2>
                <p className={styles.subtitle}>{details.displayName}</p>
              </div>
            </div>

            {/* Info */}
            <div className={styles.grid}>
              <Info label="Namespace ID" value={details.id} />
              <Info label="Email" value={details.email} />
              <Info label="Created" value={formatDate(details.createdAt)} />
            </div>

            {/* Actions */}
            {actions && (
              <div className={styles.actions}>
                {actions?.()}
              </div>
            )}
          </div>
        )}
      </>
  );
}

const Info = ({ label, value }) => (
  <div>
    <p className={styles.infoLabel}>{label}</p>
    <p className={styles.infoValue}>{value}</p>
  </div>
);

const KeyItem = ({ label, value }) => (
  <div className={styles.keyItem}>
    <span className={styles.keyLabel}>{label}: </span>
    <span>{value}</span>
  </div>
);

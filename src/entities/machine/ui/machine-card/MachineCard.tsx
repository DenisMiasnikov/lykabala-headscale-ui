import React from "react";

import type {MachineDetails} from "../../types";
import {formatDate} from "../../../../shared/lib/date";

import styles from "./machineCard.module.css";

interface MachineCardProps {
  details: MachineDetails;
  actions?: () => React.ReactNode;
}

export default function MachineCard({ details, actions }: MachineCardProps) {
  return (
    <>
        {details && (
          <div className={styles.card}>
            <div className={styles.header}>
              <img
                src={details.user.profilePicUrl}
                alt="avatar"
                className={styles.avatar}
              />

              <div className={styles.userInfo}>
                <h2 className={styles.title}>{details.givenName}</h2>
                <p className={styles.subtitle}>{details.user.displayName}</p>
              </div>

              <div className={styles.statusWrapper}>
                <span
                  className={`${styles.statusDot} ${
                    details.online ? styles.online : styles.offline
                  }`}
                />
                <span className={styles.statusText}>
                  {details.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* IP Addresses */}
            <div className={styles.section}>
              <p className={styles.label}>IP Addresses</p>
              <div className={styles.ipList}>
                {details.ipAddresses.map((ip) => (
                  <span key={ip} className={styles.ip}>
                    {ip}
                  </span>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className={styles.grid}>
              <Info label="User" value={details.user.name} />
              <Info label="Node ID" value={details.id} />
              <Info label="Last Seen" value={formatDate(details.lastSeen)} />
              <Info label="Created" value={formatDate(details.createdAt)} />
            </div>

            {/* Actions */}
            {actions && (
              <div className={styles.actions}>
                {actions?.()}
              </div>
            )}

            {/* Technical */}
            <details className={styles.details}>
              <summary className={styles.summary}>Technical details</summary>

              <div className={styles.keys}>
                <KeyItem label="Machine Key" value={details.machineKey} />
                <KeyItem label="Node Key" value={details.nodeKey} />
                <KeyItem label="Disco Key" value={details.discoKey} />
              </div>
            </details>
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

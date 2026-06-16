import React from "react";
import {formatDate} from "@/shared/lib";
import {Avatar} from "@/shared/ui";
import type {MachineDetails} from "../../types";

import styles from "./machineCard.module.css";

interface MachineCardProps {
  machine: MachineDetails;
  actions?: () => React.ReactNode;
  details?: boolean;
  full?: boolean;
}

export default function MachineCard({ machine, actions, details, full }: MachineCardProps) {
  const expiryClass = useExpiryStyle(machine.expiry);

  return (
    <>
        {machine && (
          <div className={`${styles.card} ${full && styles.fullCard}`}>
            <div className={styles.header}>
              <Avatar src={machine.user.profilePicUrl}/>

              <div className={styles.userInfo}>
                <h2 className={styles.title}>{machine.givenName}</h2>
                <p className={styles.subtitle}>{machine.user.displayName}</p>
              </div>

              <div className={styles.statusWrapper}>
                <span
                  className={`${styles.statusDot} ${
                    machine.online ? styles.online : styles.offline
                  }`}
                />
                <span className={styles.statusText}>
                  {machine.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* IP Addresses */}
            <div className={styles.section}>
              <p className={styles.label}>IP Addresses</p>
              <div className={styles.ipList}>
                {machine.ipAddresses.map((ip) => (
                  <span key={ip} className={styles.ip}>
                    {ip}
                  </span>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className={styles.grid}>
              <Info label="User" value={machine.user.name} />
              <Info label="Node ID" value={machine.id} />
              <Info label="Last Seen" value={formatDate(machine.lastSeen)} />
              <Info
                label="Expiry"
                value={machine.expiry ? formatDate(machine.expiry) : "No expiration"}
                valueClass={expiryClass}
              />
              <Info label="Created" value={formatDate(machine.createdAt)} />
            </div>

            {/* Actions */}
            {actions && (
              <div className={styles.actions}>
                {actions?.()}
              </div>
            )}

            {/* Technical */}
            {
              details && (
                <details className={styles.details}>
                  <summary className={styles.summary}>Technical details</summary>

                  <div className={styles.keys}>
                    <KeyItem label="Machine Key" value={machine.machineKey} />
                    <KeyItem label="Node Key" value={machine.nodeKey} />
                    <KeyItem label="Disco Key" value={machine.discoKey} />
                  </div>
                </details>
              )
            }
          </div>
        )}
      </>
  );
}

function useExpiryStyle(expiry: string | undefined): string | undefined {
  if (!expiry) return styles.noExpiry;

  const ms = new Date(expiry).getTime() - Date.now();
  const days = ms / (1000 * 60 * 60 * 24);

  if (days < 7) return styles.expiryCritical;
  if (days < 30) return styles.expiryWarning;
  return undefined;
}

const Info = ({ label, value, valueClass = "" }) => (
  <div>
    <p className={styles.infoLabel}>{label}</p>
    <p className={`${styles.infoValue} ${valueClass || ""}`}>{value}</p>
  </div>
);

const KeyItem = ({ label, value }) => (
  <div className={styles.keyItem}>
    <span className={styles.keyLabel}>{label}: </span>
    <span>{value}</span>
  </div>
);

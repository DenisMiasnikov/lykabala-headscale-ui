import React from "react";
import {useRouter} from "next/router";
import {formatDate} from "@/shared/lib";
import {Avatar} from "@/shared/ui";
import type {Namespace} from "../../types";

import styles from "./namespaceCard.module.css";

interface MachineCardProps {
  details: Namespace;
  actions?: () => React.ReactNode;
  rightAction?: () => React.ReactNode;
  full?: boolean;
}

export default function NameSpaceCard({ details, actions,rightAction, full }: MachineCardProps) {
  const route = useRouter();

  const goToMachine = () => {
    route.push(`/namespaces/${details?.id}`)
  }
  return (
    <>
        {details && (
          <div className={`${styles.card} ${full && styles.fullCard}`}>
            <div className={styles.header}>
              <Avatar src={details.profilePicUrl}/>

              <div className={styles.userInfo}>
                <h2 className={styles.title} onClick={goToMachine}>{details.name}</h2>
                <p className={styles.subtitle}>{details.displayName}</p>
              </div>
              {rightAction && (
                <div style={{marginLeft: 'auto'}}>{rightAction()}</div>
              )}
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

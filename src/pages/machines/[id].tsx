import React, { useEffect, useState, useRef } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../../shared/lib/auth/requireAuth";
import styles from "./NodeCard.module.css";
import { formatDate } from "../../shared/lib/date";
import { RenameMachine } from "../../features/machines/ui/renameMachine/RenameMachine";
import { UpdateMachineTags } from "../../features/machines/ui/updateMachineTags/UpdateMachineTags";
import { UpdateMachineRoutes } from "../../features/machines/ui/updateMachineRoutes/UpdateMachineRoutes";
import { ExpireMachine } from "../../features/machines/ui/expireMachine/ExpireMachine";
import { BackFlipIps } from "../../features/machines/ui/backfilips/BackFlipIps";

type MachineDetailsProps = {
  id: string;
};

type MachineDetails = {
  id?: string;
  givenName?: string;
  availableRoutes?: string[];
  approvedRoutes?: string[];
  user?: { name?: string };
  tags?: string[];
};

export default function MachineDetails({ id }: MachineDetailsProps) {
  const [details, setDetails] = useState<MachineDetails | null>(null);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  async function loadDetails() {
    const res = await fetch(`/api/machines/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load machine");
      return;
    }
    setDetails(data);
  }

  useEffect(() => {
    loadDetails();
  }, []);

  return (
    <div className="page">
      <div className="container">
        {details && (
          <div className={styles.card}>
            {error ? <div className="error">{error}</div> : null}
            {actionMessage ? (
              <div className="pill online" style={{ marginTop: 12 }}>
                {actionMessage}
              </div>
            ) : null}
            {/* Header */}
            <div className={styles.header}>
              <img
                src={details.user.profilePicUrl}
                alt="avatar"
                className={styles.avatar}
              />

              <div className={styles.userInfo}>
                <h2 className={styles.title}>
                  {details.givenName || details.name}
                </h2>
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
            <div className={styles.actions}>
              <RenameMachine
                data={details}
                onError={setError}
                onSuccess={(message: string) => {
                  loadDetails();
                  setActionMessage(message);
                }}
              />

              <UpdateMachineTags
                data={details}
                onError={setError}
                onSuccess={(message: string) => {
                  loadDetails();
                  setActionMessage(message);
                }}
              />

              <UpdateMachineRoutes
                data={details}
                onError={setError}
                onSuccess={(message: string) => {
                  loadDetails();
                  setActionMessage(message);
                }}
              />

              <BackFlipIps
                onSuccess={(message: string) => {
                  loadDetails();
                  setActionMessage(message);
                }}
                onError={setError}
              />

              <ExpireMachine
                id={details.id}
                onSuccess={(message: string) => {
                  loadDetails();
                  setActionMessage(message);
                }}
                onError={setError}
              />
            </div>

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
      </div>
    </div>
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

export const getServerSideProps: GetServerSideProps<
  MachineDetailsProps
> = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;

  return {
    props: {
      id: String(context.params?.id || ""),
    },
  };
};

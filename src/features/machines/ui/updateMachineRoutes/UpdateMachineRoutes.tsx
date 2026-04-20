import React, { useState } from "react";

import styles from "./updateMachineRoutes.module.css";
import { Modal2 } from "../../../../shared/ui/modal2/Modal2";
import { MachineDetails } from "../../../../entities/machine/types";
import {Toggle} from "../../../../shared/ui/toggle/Toggle";

interface IUpdateMachineRoutesProps {
  data: MachineDetails;
  onClose?: () => void;
  onSave?: (message?: string) => void;
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

const EXIT_ROUTES = ["0.0.0.0/0", "::/0"]

export const UpdateMachineRoutes = ({
  data,
  onSuccess,
  onError,
}: IUpdateMachineRoutesProps) => {
  const isRequested = EXIT_ROUTES.every((ip) =>
    (data.availableRoutes || []).includes(ip)
  );

  const isApprovedInitial = EXIT_ROUTES.every((ip) =>
    (data.approvedRoutes || []).includes(ip)
  )

  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(data.approvedRoutes || "");
  const [isApproved, setIsApproved] = useState(EXIT_ROUTES.every((ip) =>
    (data.approvedRoutes || []).includes(ip)
  ));

  async function saveApprovedRoutes() {
    onError("");
    onSuccess("");
    const res = await fetch(`/api/internal/machines/${data.id}/approve-routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routes: value }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      onError(data.error || "Failed to approve routes");
      return;
    }
    onSuccess("Routes updated");
  }

  return (
    <>
      <button
        className={`${styles.actionBtn} ${
          (isRequested || isApprovedInitial) 
            ? isApprovedInitial 
              ? styles.tagActive 
              : styles.tagPending 
            : undefined
        }`}
        onClick={() => setIsOpen(true)}
      >
        {(isRequested || isApprovedInitial) && <span className={styles.tagDot} />}
        Routes
      </button>

      <Modal2
        title="Approved Routes"
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
      >
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Tags</span>
          {/*<input*/}
          {/*  className={styles.input}*/}
          {/*  value={value}*/}
          {/*  onChange={(e) => setValue(e.target.value)}*/}
          {/*  placeholder="192.168.1.0/24"*/}
          {/*/>*/}
          {isRequested && <Toggle value={isApproved} onChange={(val) => {
            setIsApproved(val);
            setValue(val ? EXIT_ROUTES : '');
          }} label={'Use as exit node'}/>}
        </label>

        <div className={styles.modalActions}>
          <button
            className={styles.secondaryBtn}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </button>

          <button
            className={styles.primaryBtn}
            onClick={() => {
              saveApprovedRoutes();
              setIsOpen(false);
            }}
          >
            Save
          </button>
        </div>
      </Modal2>
    </>
  );
};

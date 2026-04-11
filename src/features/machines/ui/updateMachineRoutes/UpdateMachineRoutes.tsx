import { useState } from "react";

import styles from "./updateMachineRoutes.module.css";
import { Modal2 } from "../../../../shared/ui/modal2/Modal2";
import { MachineDetails } from "../../../../entities/machine/types";

interface IUpdateMachineRoutesProps {
  data: MachineDetails;
  onClose?: () => void;
  onSave?: (message?: string) => void;
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export const UpdateMachineRoutes = ({
  data,
  onSuccess,
  onError,
}: IUpdateMachineRoutesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(data.approvedRoutes || "");

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
      <button className={styles.actionBtn} onClick={() => setIsOpen(true)}>
        Routes
      </button>

      <Modal2
        title="Approved Routes"
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
      >
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Tags</span>
          <input
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="192.168.1.0/24"
          />
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

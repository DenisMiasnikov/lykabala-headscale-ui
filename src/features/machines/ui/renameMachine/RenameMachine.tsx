import { useState } from "react";

import styles from "./renameMachine.module.css";
import { Modal2 } from "@/shared/ui";
import type { MachineDetails } from "@/entities/machine";

interface IRenameMachineProps {
  data: MachineDetails;
  onClose?: () => void;
  onSave?: (message?: string) => void;
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export const RenameMachine = ({
  data,
  onSuccess,
  onError,
}: IRenameMachineProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(data.givenName);

  async function renameMachine() {
    onError("");
    onSuccess("");
    const trimmed = value.trim();
    if (!trimmed) {
      onError("Name cannot be empty");
      return;
    }
    const res = await fetch(
      `/api/internal/machines/${data.id}/rename?givenName=${encodeURIComponent(trimmed)}`,
      { method: "POST" },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      onError(data.error || "Rename failed");
      return;
    }
    onSuccess("Name updated");
  }

  return (
    <>
      <button className={styles.actionBtn} onClick={() => setIsOpen(true)}>
        Rename
      </button>

      <Modal2
        title="Rename Machine"
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
      >
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Name</span>
          <input
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
              renameMachine();
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

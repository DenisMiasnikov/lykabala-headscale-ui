import { useState } from "react";

import styles from "./renameMachine.module.css";
import { Modal2 } from "../../../../shared/ui/modal2/Modal2";

export const RenameMachine = ({
  data,
  onClose,
  onSave,
  onSuccess,
  onError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(data.givenName || data.name);

  async function renameMachine() {
    onError("");
    onSuccess("");
    const trimmed = value.trim();
    if (!trimmed) {
      onError("Name cannot be empty");
      return;
    }
    const res = await fetch(
      `/api/machines/${data.id}/rename?givenName=${encodeURIComponent(trimmed)}`,
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

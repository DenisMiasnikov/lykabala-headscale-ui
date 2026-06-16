import { useState } from "react";
import { Modal } from "@/shared/ui";
import styles from "./expireMachine.module.css";

function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const ExpireMachine = ({ id, expiry, onSuccess, onError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState(toDatetimeLocal(expiry));

  async function expireMachine() {
    const res = await fetch(`/api/internal/machines/${id}/expire`, { method: "POST" });
    if (!res.ok) {
      onError("Failed Expire machine");
      return;
    }
    onSuccess?.("Machine expired");
  }

  async function prolongMachine() {
    if (!expiryDate) {
      onError("Please select a date");
      return;
    }
    const date = new Date(expiryDate);
    if (isNaN(date.getTime())) {
      onError("Invalid date");
      return;
    }
    const res = await fetch(`/api/internal/machines/${id}/expire?expiry=${encodeURIComponent(date.toISOString())}`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      onError(data.error || "Failed to prolong machine");
      return;
    }
    onSuccess?.("Machine expiration prolonged");
    setIsOpen(false);
  }

  return (
    <>
      <button className={styles.dangerBtn} onClick={() => expireMachine()}>
        Expire
      </button>
      <button className={styles.actionBtn} onClick={() => setIsOpen(true)}>
        Prolong
      </button>

      <Modal
        title="Prolong Machine"
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
      >
        <label className={styles.field}>
          <span className={styles.fieldLabel}>New expiration date</span>
          <input
            className={styles.input}
            type="datetime-local"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </label>

        <div className={styles.modalActions}>
          <button className={styles.secondaryBtn} onClick={() => setIsOpen(false)}>
            Cancel
          </button>
          <button className={styles.primaryBtn} onClick={prolongMachine}>
            Save
          </button>
        </div>
      </Modal>
    </>
  );
};

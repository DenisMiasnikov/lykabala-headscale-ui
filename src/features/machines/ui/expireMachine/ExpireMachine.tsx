import styles from "./expireMachine.module.css";

export const ExpireMachine = ({ id, onSuccess, onError }) => {
  async function expireMachine() {
    const res = await fetch(`/api/internal/machines/${id}/expire`, { method: "POST" });
    if (!res.ok) {
      onError("Failed Expire machine");
      return;
    }
    onSuccess?.("Machine expired");
  }

  return (
    <button className={styles.dangerBtn} onClick={() => expireMachine()}>
      Expire
    </button>
  );
};

import styles from "./backFlipIps.module.css";

export const BackFlipIps = ({ onSuccess, onError }) => {
  const handleBackFlipIps = async () => {
    if (!confirm("Backfill IPs for all nodes? This may update IP addresses."))
      return;
    const res = await fetch(`/api/internal/machines/backfill-ips?confirmed=true`, {
      method: "POST",
    });
    if (res.ok) {
      onSuccess("Backfill completed");
    } else {
      onError("Backfill failed");
    }
  };
  return (
    <button className={styles.actionBtn} onClick={handleBackFlipIps}>
      Backfill IPs
    </button>
  );
};

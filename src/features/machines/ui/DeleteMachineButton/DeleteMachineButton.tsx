import { useState } from "react";
import { TrashIcon, XIcon } from "../../../../shared/ui/icons/Icons";

interface IDeleteMachineButtonProps {
  machineId: string;
  onSuccess?: () => void;
  onError?: (message?: string) => void;
  confirmTitle?: string;
  cancelTitle?: string;
}

export const DeleteMachineButton: React.FC<IDeleteMachineButtonProps> = ({
  machineId,
  onSuccess,
  onError,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/machines/${machineId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        onError?.(data.error || "Failed to delete machine");
        return;
      }
      setShowConfirmation(false);
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete machine";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }

  if (showConfirmation) {
    return (
      <div className="action-buttons-group">
        <button
          className="button action-button delete-button"
          onClick={confirmDelete}
          disabled={loading}
          title="Confirm delete"
        >
          <TrashIcon />
        </button>
        <button
          className="button secondary action-button"
          onClick={() => setShowConfirmation(false)}
          disabled={loading}
          title="Cancel"
        >
          <XIcon />
        </button>
      </div>
    );
  }

  return (
    <button
      className="button secondary action-button"
      onClick={() => setShowConfirmation(true)}
      title="Delete"
    >
      <TrashIcon />
    </button>
  );
};

export default DeleteMachineButton;

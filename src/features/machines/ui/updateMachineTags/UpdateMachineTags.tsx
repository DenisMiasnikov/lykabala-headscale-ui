import { useState } from "react";

import styles from "./updateMachineTags.module.css";
import { Modal2 } from "../../../../shared/ui/modal2/Modal2";
import { MachineDetails } from "../../../../entities/machine/types";

interface IUpdateMachineTagsProps {
  data: MachineDetails;
  onClose?: () => void;
  onSave?: (message?: string) => void;
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export const UpdateMachineTags = ({
  data,
  onError,
  onSuccess,
}: IUpdateMachineTagsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(data.tags.join(",") || "");

  async function addTag() {
    const trimmed = value.trim();
    if (!trimmed || data?.tags.includes(trimmed)) return;
    const newTags = [...data?.tags, trimmed];
    setValue("");
    await saveTags(newTags);
  }

  async function removeTag(tagToRemove: string) {
    const newTags = data?.tags.filter((t) => t !== tagToRemove);
    await saveTags(newTags);
  }

  async function saveTags(newTags: string[]) {
    onError("");
    onSuccess("");
    try {
      const res = await fetch(`/api/machines/${data?.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        onError(data.error || "Failed to save tags");
        return;
      }
      setValue(newTags.join(","));
      onSuccess("Tags updated");
    } catch (err) {
      onError("Network error");
    }
  }

  return (
    <>
      <button className={styles.actionBtn} onClick={() => setIsOpen(true)}>
        Tags
      </button>

      <Modal2
        title="Edit Tags"
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
      >
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Tags</span>
          <input
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="tag:exit, tag:server"
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
              void addTag();
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

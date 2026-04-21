import { useState } from "react";
import { Modal, Button, Card, Input, Avatar } from "@/shared";
import { useFileUpload } from "@/shared/lib/hooks/useFileUpload";

interface ICreateNamespaceProps {
  onClose?: () => void;
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export const CreateNamespace: React.FC<ICreateNamespaceProps> = ({
  onClose,
  onSuccess,
  onError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNamespace, setNewNamespace] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPictureUrl, setNewPictureUrl] = useState("");
  const { uploading, fileInputRef, handleFileUpload, triggerUpload } = useFileUpload({
    onSuccess: setNewPictureUrl,
    onError: onError,
  });

  async function createNamespace() {
    if (!newNamespace.trim()) return;
    const res = await fetch("/api/internal/namespaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newNamespace.trim(),
        displayName: newDisplayName.trim() || undefined,
        email: newEmail.trim() || undefined,
        pictureUrl: newPictureUrl.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      onError(data.error || "Failed to create namespace");
      return;
    }

    setNewNamespace("");
    setNewDisplayName("");
    setNewEmail("");
    setNewPictureUrl("");
    onSuccess("Namespace created");
    setIsOpen(false);
  }

  return (
    <>
      <Button
        label={'Create Namespace'}
        type={'button'}
        onClick={() => setIsOpen(true)}
        mode={'action'}
      />
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose?.();
          setIsOpen(false);
        }}
        title="Create Namespace"
      >
        <Card>
          <Input
            value={newNamespace}
            onChange={setNewNamespace}
            type="text"
            placeholder="e.g. personal"
          />
          <Input
            value={newDisplayName}
            onChange={setNewDisplayName}
            type="text"
            placeholder="e.g. Personal Space"
          />
          <Input
            value={newEmail}
            onChange={setNewEmail}
            type="email"
            placeholder="user@example.com"
          />

          <div style={{ marginBottom: "1rem" }}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <Button
              label={uploading ? "Uploading..." : "Upload Image"}
              type="button"
              onClick={triggerUpload}
              disabled={uploading}
            />
            {newPictureUrl && (
              <div style={{ marginTop: "0.5rem" }}>
                <Avatar src={newPictureUrl}/>
              </div>
            )}
          </div>

          <Input
            value={newPictureUrl}
            onChange={setNewPictureUrl}
            type="text"
            placeholder="Or paste image URL"
          />

          <Button label={'Add Namespace'} mode={'primary'} onClick={createNamespace}/>
        </Card>
      </Modal>
    </>
  );
};

export default CreateNamespace;

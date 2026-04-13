import { useState, useRef } from "react";
import Modal from "../../../../shared/ui/modal/Modal";
import {Button} from "../../../../shared/ui/button/Button";
import {Card} from "../../../../shared/ui/card/Card";
import {Input} from "../../../../shared/ui/input/Input";
import {Avatar} from "../../../../shared/ui/avatar/Avatar";

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/internal/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            base64Data: base64,
          }),
        });
        const data = await res.json();
        if (data.key) {
          setNewPictureUrl(data.key);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      onError?.("Upload failed");
      setUploading(false);
    }
  }

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

            // onKeyDown={(e) => {
            //   if (e.key === "Enter") createNamespace();
            // }}
          />
          <Input
            value={newDisplayName}
            onChange={setNewDisplayName}
            type="text"
            placeholder="e.g. Personal Space"

            // onKeyDown={(e) => {
            //   if (e.key === "Enter") createNamespace();
            // }}
          />
          <Input
            value={newEmail}
            onChange={setNewEmail}
            type="email"
            placeholder="user@example.com"

            // onKeyDown={(e) => {
            //   if (e.key === "Enter") createNamespace();
            // }}
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
              onClick={() => fileInputRef.current?.click()}
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

            // onKeyDown={(e) => {
            //   if (e.key === "Enter") createNamespace();
            // }}
          />

          <Button label={'Add Namespace'} mode={'primary'} onClick={createNamespace}/>
        </Card>
      </Modal>
    </>
  );
};

export default CreateNamespace;

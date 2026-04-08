import { useState } from "react";
import Modal from "../../../../shared/ui/modal/Modal";
import {Button} from "../../../../shared/ui/button/Button";
import {Card} from "../../../../shared/ui/card/Card";
import {Input} from "../../../../shared/ui/input/Input";

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

  async function createNamespace() {
    if (!newNamespace.trim()) return;
    const res = await fetch("/api/namespaces", {
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

          <Input
            value={newPictureUrl}
            onChange={setNewPictureUrl}
            type="text"
            placeholder="https://..."

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

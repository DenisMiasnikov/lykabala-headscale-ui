import {useState} from "react";
import type { Namespace } from "@/entities";
import {Modal, Button, Card, Input, Avatar} from "@/shared";
import {useFileUpload} from "@/shared/lib/hooks/useFileUpload";

interface IUpdateNamespaceProps {
  namespace: Namespace;
  onClose?: () => void;
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export const UpdateNamespace: React.FC<IUpdateNamespaceProps> = ({
                                                                   namespace,
                                                                             onClose,
                                                                             onError,
                                                                           }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNamespace, setNewNamespace] = useState(namespace?.name || '');
  const [newPictureUrl, setNewPictureUrl] = useState("");
  const { uploading, fileInputRef, handleFileUpload, triggerUpload } = useFileUpload({
    onSuccess: setNewPictureUrl,
    onError: onError,
  });

  async function updateUserImage() {
    const res = await fetch("/api/internal/update-image", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({userId: namespace?.id, imageUrl: newPictureUrl.trim() || undefined}),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update image");
    return data.user;
  }

  return (
    <>
      <Button
        label={'Update Namespace'}
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
        title="Update Namespace"
      >
        <Card>
          <Input
            value={newNamespace}
            onChange={setNewNamespace}
            type="text"
            placeholder="e.g. personal"
          />
          <div style={{marginBottom: "1rem"}}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{display: "none"}}
            />
            <Button
              label={uploading ? "Uploading..." : "Upload Image"}
              type="button"
              onClick={triggerUpload}
              disabled={uploading}
            />
            {newPictureUrl && (
              <div style={{marginTop: "0.5rem"}}>
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

          <Button label={'Update Namespace'} mode={'primary'} onClick={updateUserImage}/>
        </Card>
      </Modal>
    </>
  );
};

export default UpdateNamespace;

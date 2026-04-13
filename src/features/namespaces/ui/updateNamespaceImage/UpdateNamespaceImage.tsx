import { useState, useRef } from "react";
import Modal from "../../../../shared/ui/modal/Modal";
import {Button} from "../../../../shared/ui/button/Button";
import {Card} from "../../../../shared/ui/card/Card";
import {Input} from "../../../../shared/ui/input/Input";
import {Avatar} from "../../../../shared/ui/avatar/Avatar";

interface IUpdateNamespaceImageProps {
  id: string;
  onClose?: () => void;
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export const UpdateNamespaceImage: React.FC<IUpdateNamespaceImageProps> = ({
                                                                             id,
                                                                             onClose,
                                                                             onError,
                                                                           }) => {
  const [isOpen, setIsOpen] = useState(false);
  // const [newNamespace, setNewNamespace] = useState("");
  // const [newDisplayName, setNewDisplayName] = useState("");
  // const [newEmail, setNewEmail] = useState("");
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
          headers: {"Content-Type": "application/json"},
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

  async function updateUserImage() {
    const res = await fetch("/api/internal/update-image", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({userId: id, imageUrl: newPictureUrl.trim() || undefined}),
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
          {/*<Input*/}
          {/*  value={newNamespace}*/}
          {/*  onChange={setNewNamespace}*/}
          {/*  type="text"*/}
          {/*  placeholder="e.g. personal"*/}

          {/*  // onKeyDown={(e) => {*/}
          {/*  //   if (e.key === "Enter") createNamespace();*/}
          {/*  // }}*/}
          {/*/>*/}
          {/*<Input*/}
          {/*  value={newDisplayName}*/}
          {/*  onChange={setNewDisplayName}*/}
          {/*  type="text"*/}
          {/*  placeholder="e.g. Personal Space"*/}

          {/*  // onKeyDown={(e) => {*/}
          {/*  //   if (e.key === "Enter") createNamespace();*/}
          {/*  // }}*/}
          {/*/>*/}
          {/*<Input*/}
          {/*  value={newEmail}*/}
          {/*  onChange={setNewEmail}*/}
          {/*  type="email"*/}
          {/*  placeholder="user@example.com"*/}

          {/*  // onKeyDown={(e) => {*/}
          {/*  //   if (e.key === "Enter") createNamespace();*/}
          {/*  // }}*/}
          {/*/>*/}

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
              onClick={() => fileInputRef.current?.click()}
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

            // onKeyDown={(e) => {
            //   if (e.key === "Enter") createNamespace();
            // }}
          />

          <Button label={'Update Image'} mode={'primary'} onClick={updateUserImage}/>
        </Card>
      </Modal>
    </>
  );
};

export default UpdateNamespaceImage;

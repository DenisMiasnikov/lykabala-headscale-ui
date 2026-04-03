import { useState } from "react";

interface ICreateNameSpaceProps {
  onError: (message?: string) => void;
  onSuccess: (message?: string) => void;
}

export const CreateNameSpace = ({
  onError,
  onSuccess,
}: ICreateNameSpaceProps) => {
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
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h2 className="title" style={{ fontSize: 22 }}>
        Create Namespace
      </h2>
      <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label>Name *</label>
          <input
            className="input"
            value={newNamespace}
            onChange={(e) => setNewNamespace(e.target.value)}
            placeholder="e.g. personal"
            onKeyDown={(e) => {
              if (e.key === "Enter") createNamespace();
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label>Display Name</label>
          <input
            className="input"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            placeholder="e.g. Personal Space"
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
      </div>
      <div className="row" style={{ marginTop: 16, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label>Picture URL</label>
          <input
            className="input"
            value={newPictureUrl}
            onChange={(e) => setNewPictureUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="button secondary" onClick={createNamespace}>
          Add Namespace
        </button>
      </div>
    </div>
  );
};

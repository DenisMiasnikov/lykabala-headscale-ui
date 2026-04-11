import { useState, useEffect } from "react";
import { getServers, removeServer, setActiveServerId } from "../../lib/storage";
import { Button } from "../button/Button";

interface ServerSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (serverId: string) => void;
}

export function ServerSelect({ isOpen, onClose, onSelect }: ServerSelectProps) {
  const [servers, setServers] = useState<{ id: string; name: string; url: string; lastUsed: number }[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setServers(getServers());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSelect(id: string) {
    setActiveServerId(id);
    onSelect(id);
    onClose();
  }

  function handleDelete(id: string) {
    removeServer(id);
    setServers(getServers());
    setDeleteId(null);
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }} onClick={onClose}>
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: 24,
        width: "90%",
        maxWidth: 400,
        maxHeight: "80vh",
        overflow: "auto",
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: 16, fontSize: 20, fontWeight: 600 }}>Select Server</h2>
        
        {servers.length === 0 ? (
          <p style={{ color: "#666" }}>No servers configured</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {servers.map(server => (
              <div
                key={server.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                }}
              >
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => handleSelect(server.id)}>
                  <div style={{ fontWeight: 500 }}>{server.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{server.url}</div>
                </div>
                {deleteId === server.id ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button label="Yes" mode="danger" onClick={() => handleDelete(server.id)} type="button" />
                    <Button label="No" onClick={() => setDeleteId(null)} />
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteId(server.id)}
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <Button label="Close" onClick={onClose} style={{ marginTop: 16, width: "100%" }} />
      </div>
    </div>
  );
}
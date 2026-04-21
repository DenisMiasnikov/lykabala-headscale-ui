import React, {useEffect, useState} from "react";

import styles from "./changeServer.module.css";
import {Modal2, Button} from "@/shared/ui";
import {getActiveServerId, getServers, removeServer, setActiveServerId} from "@/shared/lib/storage";


export const ChangeServer = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [servers, setServers] = useState<{ id: string; name: string; url: string; lastUsed: number }[]>([]);
  const [activeId, setActiveId] = useState(null);
  const [activeServer, setActServer] = useState(null);

  useEffect(() => {
      setServers(getServers());
      setActiveId(getActiveServerId())
      setActServer(getServers().find(s => s.id === getActiveServerId()) || servers[0])
  }, []);

  const [deleteId, setDeleteId] = useState<string | null>(null);


  function handleSelect(id: string) {
    setActiveServerId(id);
    setActiveId(id);
    setIsOpen(false);
  }

  function handleDelete(id: string) {
    removeServer(id);
    setServers(getServers());
    setDeleteId(null);
  }

  return (
    <div style={{fontSize: 12, color: "#666", marginBottom: 8}}>
      Connected to: {activeServer?.name}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{background: "none", border: "none", color: "#007aff", cursor: "pointer", marginLeft: 8}}
      >
        (Change)
      </button>
      <Modal2
        title="Approved Routes"
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
      >
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

        <Button label="Close" onClick={() => setIsOpen(false)} style={{ marginTop: 16, width: "100%" }} />
      </Modal2>
    </div>
  );
};

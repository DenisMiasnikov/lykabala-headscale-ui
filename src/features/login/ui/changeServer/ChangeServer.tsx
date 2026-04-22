import React, {useEffect, useState} from "react";

import {Modal2, Button} from "@/shared/ui";
import {getActiveServerId, getServers, removeServer, setActiveServerId} from "@/shared/lib/storage";

interface ServerInfo {
  id: string;
  name: string;
  url: string;
  lastUsed: number;
  isEnv?: boolean;
}

export const ChangeServer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeServer, setActServer] = useState<ServerInfo | null>(null);

  useEffect(() => {
    const fetchEnvConfig = async () => {
      try {
        const res = await fetch("/api/internal/env-config");
        const data = await res.json();
        if (data.available) {
          const newEnv = { id: "env", name: "Environment", url: data?.url, lastUsed: 0, isEnv: true };
          const storedServers = getServers();
          const allServers = [...storedServers, newEnv];
          setServers(allServers);

          const id = getActiveServerId();
          setActiveId(id);
          if (id === "env") {
            setActServer(newEnv);
            setActiveServerId("env");
          } else {
            const actServer = allServers.find(s => s.id === id) || allServers[0] || null;
            setActServer(actServer);
            setActiveServerId(actServer?.id);
          }
        } else {
          const storedServers = getServers();
          const allServers = [...storedServers];
          setServers(allServers);

          const id = getActiveServerId();
          setActiveId(id);
          if (id === "env" || !allServers.find(s => s.id === id)) {
            const actServer = allServers[0] || null;
            setActServer(actServer);
            setActiveServerId(actServer?.id || "");
          } else {
            const actServer = allServers.find(s => s.id === id) || allServers[0] || null;
            setActServer(actServer);
            setActiveServerId(actServer?.id || "");
          }
        }
      } catch {}
    };

    fetchEnvConfig()
  }, []);

  const [deleteId, setDeleteId] = useState<string | null>(null);


  function handleSelect(id: string) {
    const server = servers.find(s => s.id === id);
    if (!server) return;

    if (!server.isEnv) {
      setActiveServerId(id);
    } else {
      setActiveServerId("env");
    }
    setActiveId(id);
    setActServer(server);
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
        title="Connected servers"
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
                  background: activeId === server?.id ? "#f0f8ff" : "transparent",
                }}
              >
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => handleSelect(server.id)}>
                  <div style={{ fontWeight: 500 }}>{server.name} {server.isEnv && "(Environment)"}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{server.url}</div>
                </div>
                {!server.isEnv && (
                  deleteId === server.id ? (
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
                  )
                )}
              </div>
            ))}
            <Button label="Close" onClick={() => setIsOpen(false)} style={{ marginTop: 16, width: "100%" }} />
          </div>
        )}
      </Modal2>
    </div>
  );
};

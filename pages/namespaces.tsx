import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../utils/requireAuth";
import { EditIcon, KeyIcon, TrashIcon, CheckIcon, XIcon } from "../components/Icons";

type Namespace = {
  id: string;
  name: string;
  createdAt?: string;
  displayName?: string;
  email?: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;
  return { props: {} };
};

export default function NamespacesPage() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [newNamespace, setNewNamespace] = useState("");
  const [preauthKey, setPreauthKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isExitNode, setIsExitNode] = useState(false);

  const command = `tailscale up --reset \\
  --login-server https://muxtadir-homelab.fun \\
  --authkey "${preauthKey}"${
    isExitNode ? " \\\n  --advertise-exit-node" : ""
  }`;


  async function loadData() {
    setError("");
    try {
      const res = await fetch("/api/namespaces");
      const data = await res.json();
      if (!res.ok) {
        new Error(data.error || "Failed to load namespaces");
      }
      const nsList = Array.isArray(data.namespaces) ? data.namespaces : [];
      setNamespaces(nsList);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      setError(msg);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createNamespace() {
    if (!newNamespace.trim()) return;
    const res = await fetch("/api/namespaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newNamespace.trim() })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create namespace");
      return;
    }

    setNewNamespace("");
    await loadData();
  }

  async function generateKey(name: string) {
    setPreauthKey("");
    setMessage("");
    const res = await fetch("/api/preauthkeys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ namespace: name })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to generate key");
      return;
    }

    setPreauthKey(data.key || "");
    setMessage(`Key generated for ${name}`);
  }

  function startRename(ns: Namespace) {
    setEditingId(ns.id);
    setEditName(ns.name);
    setError("");
    setMessage("");
  }

  async function saveRename(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }

    const res = await fetch(`/api/namespaces/${id}/rename`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to rename namespace");
      return;
    }

    setEditingId(null);
    setEditName("");
    setMessage("Namespace renamed");
    await loadData();
  }

  async function deleteNamespace(id: string, name: string) {
    const ok = window.confirm(`Delete namespace "${name}"? This cannot be undone.`);
    if (!ok) return;

    const res = await fetch(`/api/namespaces/${id}`, {
      method: "DELETE"
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to delete namespace");
      return;
    }

    setMessage("Namespace deleted");
    await loadData();
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Headscale Control</h1>
        <p className="subtitle">Manage namespaces.</p>

        {error && <div className="error">{error}</div>}
        {message && (
          <div className="pill online" style={{ marginBottom: 16 }}>
            {message}
          </div>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <h2 className="title" style={{ fontSize: 22 }}>
            Create Namespace
          </h2>
          <div className="row" style={{ alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label>Name</label>
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
            <div style={{ alignSelf: "flex-end" }}>
              <button className="button secondary" onClick={createNamespace}>
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="title" style={{ fontSize: 22 }}>
            Namespaces
          </h2>
          {namespaces.length === 0 ? (
            <div className="subtitle">No namespaces yet.</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>Name</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {namespaces.map((ns) => (
                    <tr key={ns.id}>
                      <td>
                        {editingId === ns.id ? (
                          <input
                            className="input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(ns.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <a href={`/namespaces/${ns.id}`}>{ns.name}</a>
                        )}
                      </td>
                      <td className="actions-cell">
                        {editingId === ns.id ? (
                          <div className="action-buttons-group">
                            <button
                              className="button action-button"
                              onClick={() => saveRename(ns.id)}
                              title="Save"
                            >
                              <CheckIcon />
                              <span className="button-label">Save</span>
                            </button>
                            <button
                              className="button secondary action-button"
                              onClick={() => setEditingId(null)}
                              title="Cancel"
                            >
                              <XIcon />
                              <span className="button-label">Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons-group">
                            <button
                              className="button action-button"
                              onClick={() => startRename(ns)}
                              title="Rename"
                            >
                              <EditIcon />
                              <span className="button-label">Rename</span>
                            </button>
                            <button
                              className="button secondary action-button"
                              onClick={() => generateKey(ns.name)}
                              title="Generate Key"
                            >
                              <KeyIcon />
                              <span className="button-label">Generate Key</span>
                            </button>
                            <button
                              className="button action-button delete-button"
                              onClick={() => deleteNamespace(ns.id, ns.name)}
                              title="Delete"
                            >
                              <TrashIcon />
                              <span className="button-label">Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {preauthKey ? (
          <div className="card" style={{marginTop: 24}}>
            <h2 className="title" style={{fontSize: 22}}>
              Generated Key
            </h2>
            <div className="keybox">{preauthKey}</div>
            <p className="subtitle" style={{marginTop: 8}}>
              Use this key to register a node:{" "}
              <pre>
                <code style={{background: "#eee", padding: "2px 6px", borderRadius: 4}}>
                   {command}
                </code>
              </pre>
            </p>
            <label key={'isExitNode'} style={{ display: "flex", alignItems: "center", gap:'8px' }}>
              <input
                type="checkbox"
                checked={isExitNode}
                onChange={(event) => {
                  setIsExitNode(event.target.checked)
                }}
              />
              {'Use as an exit node'}
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}

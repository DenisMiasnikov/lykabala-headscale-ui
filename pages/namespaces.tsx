import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../utils/requireAuth";
import {
  EditIcon,
  KeyIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
} from "../components/Icons";
import Table from "../shared/ui/table/Table";

type Namespace = {
  id: string;
  name: string;
  createdAt?: string;
  displayName?: string;
  email?: string;
  pictureUrl?: string;
};

type PreAuthKey = {
  id: string;
  key: string;
  reusable: boolean;
  ephemeral: boolean;
  used: boolean;
  createdAt: string;
  expiration?: string;
  aclTags?: string[];
  user: { name: string };
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;
  return { props: {} };
};

export default function NamespacesPage() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [preauthKeys, setPreauthKeys] = useState<PreAuthKey[]>([]);
  const [newNamespace, setNewNamespace] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPictureUrl, setNewPictureUrl] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPictureUrl, setEditPictureUrl] = useState("");
  const [isExitNode, setIsExitNode] = useState(false);

  // Key generation options
  const [keyReusable, setKeyReusable] = useState(true);
  const [keyEphemeral, setKeyEphemeral] = useState(false);
  const [keyExpiration, setKeyExpiration] = useState("");
  const [keyAclTags, setKeyAclTags] = useState("");
  const [selectedNamespace, setSelectedNamespace] = useState("");

  const command = generatedKey
    ? `tailscale up --reset \\
  --login-server https://muxtadir-homelab.fun \\
  --authkey "${generatedKey}"${
    isExitNode ? " \\\n  --advertise-exit-node" : ""
  }`
    : "";

  async function loadData() {
    setError("");
    try {
      const res = await fetch("/api/namespaces");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load namespaces");
      }
      const nsList = Array.isArray(data.namespaces) ? data.namespaces : [];
      setNamespaces(nsList);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load data";
      setError(msg);
    }
  }

  async function loadPreAuthKeys() {
    try {
      const res = await fetch("/api/preauthkey/list");
      const data = await res.json();
      if (res.ok) {
        setPreauthKeys(data.preAuthKeys || []);
      }
    } catch (err) {
      console.error("Failed to load preauth keys:", err);
    }
  }

  useEffect(() => {
    loadData();
    loadPreAuthKeys();
  }, []);

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
      setError(data.error || "Failed to create namespace");
      return;
    }

    setNewNamespace("");
    setNewDisplayName("");
    setNewEmail("");
    setNewPictureUrl("");
    await loadData();
  }

  async function generateKey() {
    setGeneratedKey("");
    setKeyError("");
    setMessage("");
    if (!selectedNamespace) {
      setKeyError("Select a namespace");
      return;
    }

    const ns = namespaces.find((n) => n.name === selectedNamespace);
    if (!ns?.id) {
      setKeyError("Invalid namespace");
      return;
    }

    const body: any = {
      user: parseInt(ns.id),
      reusable: keyReusable,
    };
    if (keyExpiration) {
      body.expiration = keyExpiration;
    }
    if (keyEphemeral) {
      body.ephemeral = true;
    }
    if (keyAclTags.trim()) {
      body.aclTags = keyAclTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
    }

    const res = await fetch("/api/preauthkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setKeyError(data.error || "Failed to generate key");
      return;
    }

    setGeneratedKey(data.preAuthKey?.key || data.key || "");
    setMessage(`Key generated for ${selectedNamespace}`);
    await loadPreAuthKeys();
  }

  async function deletePreAuthKey(id: string) {
    if (!confirm(`Delete pre-auth key?`)) return;
    try {
      const res = await fetch(`/api/preauthkey/delete?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setKeyError(data.error || "Failed to delete key");
        return;
      }
      await loadPreAuthKeys();
    } catch (err) {
      setKeyError("Network error");
    }
  }

  function startEdit(ns: Namespace, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(ns.id);
    setEditName(ns.name);
    setEditDisplayName(ns.displayName || "");
    setEditEmail(ns.email || "");
    setEditPictureUrl(ns.pictureUrl || "");
    setError("");
    setMessage("");
  }

  async function saveEdit(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }

    const res = await fetch(`/api/namespaces/${id}/rename`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmed,
        displayName: editDisplayName.trim() || undefined,
        email: editEmail.trim() || undefined,
        pictureUrl: editPictureUrl.trim() || undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to update namespace");
      return;
    }

    setEditingId(null);
    setMessage("Namespace updated");
    await loadData();
  }

  async function deleteNamespace(id: string, name: string) {
    const ok = window.confirm(
      `Delete namespace "${name}"? This cannot be undone.`,
    );
    if (!ok) return;

    const res = await fetch(`/api/namespaces/${id}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to delete namespace");
      return;
    }

    setMessage("Namespace deleted");
    await loadData();
  }

  const commandString = generatedKey
    ? `tailscale up --reset \\
  --login-server https://muxtadir-homelab.fun \\
  --authkey "${generatedKey}"${
    isExitNode ? " \\\n  --advertise-exit-node" : ""
  }`
    : "";

  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "displayName",
      label: "Display Name",
      // sorter: (a, b) => a.age - b.age,
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "createdAt",
      label: "Created",
    },
    {
      key: "actions",
      label: "Actions",
    },
  ];

  const data = [
    { id: 1, name: "Denis", age: 25, status: "active" },
    { id: 2, name: "Alex", age: 30, status: "inactive" },
    { id: 3, name: "Kate", age: 22, status: "active" },
    { id: 4, name: "John", age: 28, status: "inactive" },
  ];

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Headscale Control</h1>
        <p className="subtitle">Manage namespaces and pre-auth keys.</p>

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
          <div
            className="row"
            style={{ marginTop: 16, alignItems: "flex-start" }}
          >
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

        <div className="card">
          <h2 className="title" style={{ fontSize: 22 }}>
            Namespaces
          </h2>
          {namespaces.length === 0 ? (
            <div className="subtitle">No namespaces yet.</div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Display Name</th>
                      <th>Email</th>
                      <th>Created</th>
                      <th>Actions</th>
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
                                if (e.key === "Enter") saveEdit(ns.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                            />
                          ) : (
                            <a href={`/namespaces/${ns.id}`}>{ns.name}</a>
                          )}
                        </td>
                        <td>
                          {editingId === ns.id ? (
                            <input
                              className="input"
                              value={editDisplayName}
                              onChange={(e) =>
                                setEditDisplayName(e.target.value)
                              }
                            />
                          ) : (
                            ns.displayName || "-"
                          )}
                        </td>
                        <td>
                          {editingId === ns.id ? (
                            <input
                              className="input"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                            />
                          ) : (
                            ns.email || "-"
                          )}
                        </td>
                        <td>
                          {ns.createdAt
                            ? new Date(ns.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="actions-cell">
                          {editingId === ns.id ? (
                            <div className="action-buttons-group">
                              <button
                                className="button action-button"
                                onClick={() => saveEdit(ns.id)}
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
                                onClick={(e) => startEdit(ns, e)}
                                title="Edit"
                              >
                                <EditIcon />
                                <span className="button-label">Edit</span>
                              </button>
                              <button
                                className="button secondary action-button"
                                onClick={() => {
                                  setSelectedNamespace(ns.name);
                                  setKeyError("");
                                  setGeneratedKey("");
                                }}
                                title="Generate Key"
                              >
                                <KeyIcon />
                                <span className="button-label">Key</span>
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
              <Table columns={columns} data={namespaces} rowKey="id" />
            </>
          )}
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2 className="title" style={{ fontSize: 22 }}>
            Generate Pre-Auth Key
          </h2>
          <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label>Namespace</label>
              <select
                className="input"
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
              >
                <option value="">Select a namespace...</option>
                {namespaces.map((ns) => (
                  <option key={ns.id} value={ns.name}>
                    {ns.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label>Expiration (optional)</label>
              <input
                type="datetime-local"
                className="input"
                value={keyExpiration}
                onChange={(e) => setKeyExpiration(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label>ACL Tags (comma-separated)</label>
              <input
                className="input"
                value={keyAclTags}
                onChange={(e) => setKeyAclTags(e.target.value)}
                placeholder="tag:admin, tag:server"
              />
            </div>
          </div>
          <div className="row" style={{ marginTop: 16, alignItems: "center" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginRight: 24,
              }}
            >
              <input
                type="checkbox"
                checked={keyReusable}
                onChange={(e) => setKeyReusable(e.target.checked)}
              />
              Reusable (key can be used multiple times)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={keyEphemeral}
                onChange={(e) => setKeyEphemeral(e.target.checked)}
              />
              Ephemeral (expires after first use)
            </label>
          </div>
          {keyError && (
            <div className="error" style={{ marginTop: 8 }}>
              {keyError}
            </div>
          )}
          <button
            className="button"
            onClick={generateKey}
            style={{ marginTop: 16 }}
          >
            Generate Key
          </button>
        </div>

        {generatedKey ? (
          <div className="card" style={{ marginTop: 24 }}>
            <h2 className="title" style={{ fontSize: 22 }}>
              Generated Key
            </h2>
            <div className="keybox">{generatedKey}</div>
            <p className="subtitle" style={{ marginTop: 8 }}>
              Use this key to register a node:
              <pre style={{ marginTop: 8 }}>
                <code
                  style={{
                    background: "#eee",
                    padding: "8px",
                    borderRadius: 4,
                    display: "block",
                    whiteSpace: "pre",
                  }}
                >
                  {commandString}
                </code>
              </pre>
            </p>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={isExitNode}
                onChange={(event) => setIsExitNode(event.target.checked)}
              />
              Use as an exit node
            </label>
          </div>
        ) : null}

        <div className="card" style={{ marginTop: 24 }}>
          <h2 className="title" style={{ fontSize: 22 }}>
            Pre-Auth Keys
          </h2>
          {preauthKeys.length === 0 ? (
            <div className="subtitle">No pre-auth keys generated yet.</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Prefix</th>
                    <th>Namespace</th>
                    <th>Reusable</th>
                    <th>Ephemeral</th>
                    <th>ACL Tags</th>
                    <th>Created</th>
                    <th>Expires</th>
                    <th>Used</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {preauthKeys.map((k) => (
                    <tr key={k.id}>
                      <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                        {k.key.substring(0, 8)}...
                      </td>
                      <td>{k.user?.name || "-"}</td>
                      <td>{k.reusable ? "Yes" : "No"}</td>
                      <td>{k.ephemeral ? "Yes" : "No"}</td>
                      <td>{k.aclTags?.join(", ") || "-"}</td>
                      <td>{new Date(k.createdAt).toLocaleString()}</td>
                      <td>
                        {k.expiration
                          ? new Date(k.expiration).toLocaleString()
                          : "-"}
                      </td>
                      <td>{k.used ? "Yes" : "No"}</td>
                      <td>
                        <button
                          className="button delete-button"
                          onClick={() => deletePreAuthKey(k.id)}
                          title="Revoke"
                        >
                          <TrashIcon /> Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

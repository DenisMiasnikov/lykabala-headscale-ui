import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../../shared/lib/auth/requireAuth";
import type {
  Namespace,
  NamespaceDetailsProps,
  NamespaceDetails,
} from "../../entities/namespace/types";
import type { PreAuthKey } from "../../entities/authKey/types";

import { TrashIcon } from "../../shared/ui/icons/Icons";

export default function NamespaceDetails({ id }: NamespaceDetailsProps) {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);

  const [details, setDetails] = useState<NamespaceDetails | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [preauthKeys, setPreauthKeys] = useState<PreAuthKey[]>([]);

  const [isExitNode, setIsExitNode] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [keyError, setKeyError] = useState("");

  // Key generation options
  const [keyReusable, setKeyReusable] = useState(true);
  const [keyEphemeral, setKeyEphemeral] = useState(false);
  const [keyExpiration, setKeyExpiration] = useState("");
  const [keyAclTags, setKeyAclTags] = useState("");
  const [selectedNamespace, setSelectedNamespace] = useState("");

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

  async function loadDetails() {
    setError("");
    try {
      // Fetch all namespaces and find the one with matching ID
      const res = await fetch("/api/namespaces");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load namespaces");
        return;
      }
      const namespace = data.namespaces?.find(
        (ns: { id: string }) => ns.id === id,
      );
      if (!namespace) {
        setError("Namespace not found");
        return;
      }
      setDetails(namespace);
    } catch (err) {
      setError("Failed to load namespace");
    }
  }

  useEffect(() => {
    loadDetails();
    loadPreAuthKeys();
  }, [id]);

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

  useEffect(() => {
    loadData();
  }, []);

  async function deleteNamespace() {
    if (!details) return;
    const ok = window.confirm(
      `Delete namespace "${details.name}"? This cannot be undone.`,
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
    setTimeout(() => {
      window.location.href = "/namespaces";
    }, 1000);
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

  const commandString = generatedKey
    ? `tailscale up --reset \\
  --login-server https://muxtadir-homelab.fun \\
  --authkey "${generatedKey}"${
    isExitNode ? " \\\n  --advertise-exit-node" : ""
  }`
    : "";

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="title">Namespace Details</h1>

          {error ? <div className="error">{error}</div> : null}
          {message ? (
            <div className="pill online" style={{ marginBottom: 16 }}>
              {message}
            </div>
          ) : null}

          {details ? (
            <>
              <div style={{ marginTop: 16, marginBottom: 24 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Name:</strong> {details.name}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>ID:</strong> {details.id}
                </div>
                {details.createdAt && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Created:</strong>{" "}
                    {new Date(details.createdAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 24 }}>
                <button
                  className="button"
                  onClick={deleteNamespace}
                  style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
                >
                  Delete Namespace
                </button>
              </div>

              <div className="card" style={{ marginTop: 24 }}>
                <h2 className="title" style={{ fontSize: 22 }}>
                  Generate Pre-Auth Key
                </h2>
                <div
                  className="row"
                  style={{ alignItems: "flex-start", gap: 16 }}
                >
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
                <div
                  className="row"
                  style={{ marginTop: 16, alignItems: "center" }}
                >
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
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
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
                  // onClick={generateKey}
                  style={{ marginTop: 16 }}
                >
                  Generate Key
                </button>
              </div>

              <div className="card" style={{ marginTop: 24 }}>
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
                    <label
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="checkbox"
                        checked={isExitNode}
                        onChange={(event) =>
                          setIsExitNode(event.target.checked)
                        }
                      />
                      Use as an exit node
                    </label>
                  </div>
                ) : null}

                <h2 className="title" style={{ fontSize: 22 }}>
                  Pre-Auth Keys
                </h2>
                {preauthKeys.length === 0 ? (
                  <div className="subtitle">
                    No pre-auth keys generated yet.
                  </div>
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
                            <td
                              style={{
                                fontFamily: "monospace",
                                fontSize: "12px",
                              }}
                            >
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
            </>
          ) : (
            <div className="subtitle">Loading...</div>
          )}

          <div className="row" style={{ marginTop: 24 }}>
            <a className="button" href="/namespaces">
              Back
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  NamespaceDetailsProps
> = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;

  return {
    props: {
      id: String(context.params?.id || ""),
    },
  };
};

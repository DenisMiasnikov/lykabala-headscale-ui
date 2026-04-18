import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../shared/lib/auth/requireAuth";
import type { ApiKey, ApiKeysPageProps } from "../entities/apiKey/types";

export default function ApiKeysPage({}: ApiKeysPageProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newExpiration, setNewExpiration] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadKeys() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/internal/apikey");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load API keys");
        setKeys([]);
      } else {
        setKeys(data.apiKeys || []);
      }
    } catch (err) {
      setError("Network error");
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const body: any = {};
      if (newExpiration) {
        body.expiration = newExpiration;
      }
      const res = await fetch("/api/internal/apikey/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create API key");
      } else {
        setMessage(´API key created ${data?.apikey}´);
        setNewExpiration("");
        await loadKeys();
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function deleteKey(prefix: string) {
    if (!confirm(`Delete API key ${prefix}?`)) return;
    try {
      const res = await fetch(`/api/apikey/${prefix}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete API key");
      } else {
        setMessage("API key deleted");
        await loadKeys();
      }
    } catch (err) {
      setError("Network error");
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="title">API Keys</h1>
          {error && <div className="error">{error}</div>}
          {message && (
            <div className="pill online" style={{ marginTop: 12 }}>
              {message}
            </div>
          )}

          <div
            style={{
              marginBottom: 24,
              padding: 16,
              background: "#222121",
              borderRadius: 8,
            }}
          >
            <h3>Create New API Key</h3>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <input
                type="datetime-local"
                className="input"
                value={newExpiration}
                onChange={(e) => setNewExpiration(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="button"
                onClick={createKey}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Key"}
              </button>
            </div>
            <p className="subtitle" style={{ marginTop: 8 }}>
              Leave expiration empty for a key that never expires.
            </p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : keys.length === 0 ? (
            <p>No API keys.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>Prefix</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Created</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Expires</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Last Seen</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.prefix}>
                    <td style={{ padding: 8, fontFamily: "monospace" }}>
                      {k.prefix}
                    </td>
                    <td style={{ padding: 8 }}>
                      {new Date(k.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: 8 }}>
                      {k.expiration
                        ? new Date(k.expiration).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: 8 }}>
                      {k.lastSeen ? new Date(k.lastSeen).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: 8 }}>
                      <button
                        className="button secondary"
                        onClick={() => deleteKey(k.prefix)}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<ApiKeysPageProps> = async (
  context,
) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;

  return {
    props: {},
  };
};

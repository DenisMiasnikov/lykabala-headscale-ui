import { useEffect, useState } from "react";

interface INamespace {
  id?: string;
  name: string;
}

interface IRegisterNodeKeyFormProps {
  namespaces: INamespace[];
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export const RegisterNodeKeyForm: React.FC<IRegisterNodeKeyFormProps> = ({
  namespaces,
  onSuccess,
  onError,
}) => {
  const [registerUser, setRegisterUser] = useState("");
  const [nodeKey, setNodeKey] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function registerNode() {
    setError("");
    setResult("");
    const trimmedKey = nodeKey.trim();
    if (!registerUser || !trimmedKey) {
      setError("Provide a user and node key");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/nodes/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: registerUser, key: trimmedKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to register node");
        return;
      }

      const label = data.givenName || data.name || data.id || "node";
      setResult(`Registered ${label}`);
      setNodeKey("");
      onSuccess?.(`Registered ${label}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to register node";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!registerUser && namespaces.length > 0) {
      setRegisterUser(namespaces[0].name);
    }
  }, [namespaces, registerUser]);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h2 className="title" style={{ fontSize: 22 }}>Register Node Key</h2>
      <div className="row" style={{ alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label>User</label>
          <select
            className="input"
            value={registerUser}
            onChange={(event) => setRegisterUser(event.target.value)}
            disabled={loading}
          >
            <option value="">Select a user</option>
            {namespaces.map((ns) => (
              <option key={ns.id || ns.name} value={ns.name}>
                {ns.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 2, minWidth: 260 }}>
          <label>Node Key</label>
          <input
            className="input"
            value={nodeKey}
            onChange={(event) => setNodeKey(event.target.value)}
            placeholder="Paste node key from Tailscale app"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") registerNode();
            }}
          />
        </div>
        <div style={{ alignSelf: "flex-end" }}>
          <button
            className="button"
            onClick={registerNode}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {result && (
        <div className="pill online" style={{ marginTop: 12 }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default RegisterNodeKeyForm;

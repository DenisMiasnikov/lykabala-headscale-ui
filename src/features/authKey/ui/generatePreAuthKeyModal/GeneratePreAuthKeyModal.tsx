import { useState } from "react";
import Modal from "../../../../shared/ui/modal/Modal";
import type { PreAuthKey } from "../../../../entities/authKey/types";
import { KeyIcon } from "../../../../shared/ui/icons/Icons";

interface IGeneratePreAuthKeyProps {
  onClose?: () => void;
  onSuccess?: (key: PreAuthKey) => void;
  onError?: (message?: string) => void;
  namespaces: Array<{ id: string; name: string }>;
}

const GeneratePreAuthKey: React.FC<IGeneratePreAuthKeyProps> = ({
  onClose,
  onSuccess,
  onError,
  namespaces,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState("");
  const [keyReusable, setKeyReusable] = useState(true);
  const [keyEphemeral, setKeyEphemeral] = useState(false);
  const [keyExpiration, setKeyExpiration] = useState("");
  const [keyAclTags, setKeyAclTags] = useState("");
  const [generatedKey, setGeneratedKey] = useState<PreAuthKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExitNode, setIsExitNode] = useState(false);
  const [localError, setLocalError] = useState("");

  async function generateKey() {
    if (!selectedNamespace.trim()) {
      setLocalError("Please select a namespace");
      return;
    }

    setLoading(true);
    setLocalError("");
    try {
      const expiration = keyExpiration
        ? new Date(keyExpiration).toISOString()
        : undefined;
      const aclTags = keyAclTags
        ? keyAclTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined;

      const res = await fetch("/api/preauthkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespace: selectedNamespace,
          reusable: keyReusable,
          ephemeral: keyEphemeral,
          expiration,
          aclTags,
          exitNode: isExitNode,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLocalError(data.error || "Failed to generate key");
        return;
      }

      const data = await res.json();
      setGeneratedKey(data.preAuthKey);
      onSuccess(data.preAuthKey);
    } catch (err) {
      setLocalError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const commandString = generatedKey
    ? `headscale node register -k ${generatedKey.key} -u ${generatedKey.user.name}`
    : "";

  const resetForm = () => {
    setGeneratedKey(null);
    setSelectedNamespace("");
    setKeyExpiration("");
    setKeyAclTags("");
    setLocalError("");
  };

  return (
    <>
      <button
        className="button secondary action-button"
        onClick={() => setIsOpen(true)}
        title="Generate Pre-Auth Key"
      >
        <KeyIcon />
        <span className="button-label">Key</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose?.();
          setIsOpen(false);
        }}
        title="Generate Pre-Auth Key"
      >
        {generatedKey ? (
          <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>
              Generated Key
            </h3>
            <div
              className="keybox"
              style={{
                background: "#f5f5f5",
                padding: 12,
                borderRadius: 4,
                fontFamily: "monospace",
                wordBreak: "break-all",
                marginBottom: 12,
              }}
            >
              {generatedKey.key}
            </div>
            <p style={{ marginTop: 8, color: "#666" }}>
              Use this key to register a node:
            </p>
            <pre
              style={{
                marginTop: 8,
                background: "#eee",
                padding: "8px",
                borderRadius: 4,
                overflowX: "auto",
              }}
            >
              <code>{commandString}</code>
            </pre>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={isExitNode}
                  onChange={(e) => setIsExitNode(e.target.checked)}
                />
                Use as an exit node
              </label>
            </div>
            <button
              className="button secondary"
              style={{ marginTop: 16 }}
              onClick={resetForm}
            >
              Generate Another
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                Namespace
              </label>
              <select
                className="input"
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ddd",
                }}
              >
                <option value="">Select a namespace...</option>
                {namespaces.map((ns) => (
                  <option key={ns.id} value={ns.name}>
                    {ns.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                Expiration (optional)
              </label>
              <input
                type="datetime-local"
                className="input"
                value={keyExpiration}
                onChange={(e) => setKeyExpiration(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                ACL Tags (comma-separated)
              </label>
              <input
                className="input"
                value={keyAclTags}
                onChange={(e) => setKeyAclTags(e.target.value)}
                placeholder="tag:admin, tag:server"
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <div style={{ marginBottom: 16, display: "flex", gap: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            {localError && (
              <div className="error" style={{ color: "red", marginTop: 8 }}>
                {localError}
              </div>
            )}
            <button
              className="button"
              onClick={generateKey}
              disabled={loading}
              style={{
                marginTop: 16,
                padding: "8px 16px",
                borderRadius: 4,
                background: loading ? "#ccc" : "#0070f3",
                color: "white",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Generating..." : "Generate Key"}
            </button>
          </>
        )}
      </Modal>
    </>
  );
};

export default GeneratePreAuthKey;

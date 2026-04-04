import { useState } from "react";
import Modal from "../../../../shared/ui/modal/Modal";
import type { AuthKey } from "../../../../entities/authKey/types";
import { KeyIcon } from "../../../../shared/ui/icons/Icons";
import { useCreateAuthKey } from "../../model/hooks/useCreateAuthKey";

interface ICreateAuthKeyProps {
  onClose?: () => void;
  onSuccess?: (key: AuthKey) => void;
  onError?: (message?: string) => void;
  namespaces: Array<{ id: string; name: string }>;
}

const CreateAuthKey: React.FC<ICreateAuthKeyProps> = ({
  onClose,
  onSuccess,
  onError,
  namespaces,
}) => {
  const {
    isOpen,
    setIsOpen,
    generatedKey,
    commandString,
    isExitNode,
    setIsExitNode,
    resetForm,
    loading,
    generateKey,
    localError,
    keyReusable,
    setKeyReusable,
    keyEphemeral,
    setKeyEphemeral,
    selectedNamespace,
    setSelectedNamespace,
    keyExpiration,
    setKeyExpiration,
    keyAclTags,
    setKeyAclTags,
  } = useCreateAuthKey({ onSuccess });

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
                  <option key={ns.id} value={ns.id}>
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

export default CreateAuthKey;

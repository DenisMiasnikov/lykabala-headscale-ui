import {Fragment} from "react";
import type { AuthKey } from "@/entities/authKey";
import {NamespaceSelect} from "@/entities/namespace/ui/namespace-select/NamespaceSelect";
import {Button, Input, Toggle, Modal} from "@/shared/ui";

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
    <Fragment>
      <Button
        label={'Key'}
        mode={'action'}
        type={'button'}
        onClick={() => setIsOpen(true)}
      />

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
              <NamespaceSelect value={selectedNamespace} onChange={setSelectedNamespace}/>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                Expiration (optional)
              </label>
              <Input
                type="datetime-local"
                value={keyExpiration}
                onChange={setKeyExpiration}
                placeholder={'Pick a date'}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                ACL Tags (comma-separated)
              </label>
              <Input
                type="text"
                value={keyAclTags}
                onChange={setKeyAclTags}
                placeholder={'tag:admin, tag:server'}
              />
            </div>
            <div style={{display: 'flex', flexDirection:'column', gap:'16px', marginBottom:'16px'}}>
              <Toggle
                value={keyReusable}
                onChange={(val) => {
                  setKeyReusable(val)
                  setKeyEphemeral(!val)
                }}
                label={'Reusable (key can be used multiple times)'}
              />
              <Toggle
                value={keyEphemeral}
                onChange={(val) => {
                  setKeyReusable(!val)
                  setKeyEphemeral(val)
                }}
                label={'Ephemeral (expires after first use)'}
              />
            </div>
            {localError && (
              <div className="error" style={{ color: "red", marginTop: 8 }}>
                {localError}
              </div>
            )}
            <Button
              onClick={generateKey}
              disabled={loading}
              label={loading ? "Generating..." : "Generate Key"}
              mode={'default'}
            />
          </>
        )}
      </Modal>
    </Fragment>
  );
};

export default CreateAuthKey;

import { useState } from "react";
import type { AuthKey } from "../../../../entities/authKey/types";

export const useCreateAuthKey = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState("");
  const [keyReusable, setKeyReusable] = useState(true);
  const [keyEphemeral, setKeyEphemeral] = useState(false);
  const [keyExpiration, setKeyExpiration] = useState("");
  const [keyAclTags, setKeyAclTags] = useState("");
  const [generatedKey, setGeneratedKey] = useState<AuthKey | null>(null);
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

      const res = await fetch("/api/internal/preauthkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: selectedNamespace,
          reusable: keyReusable,
          ephemeral: keyEphemeral,
          expiration,
          // aclTags: ["string"],
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
    ? `tailscale up --reset \\
  --login-server https://test.muxtadir-homelab.fun \\
  --authkey "${generatedKey.key}"${
    isExitNode ? " \\\n  --advertise-exit-node" : ""
  }`
    : "";

  const resetForm = () => {
    setGeneratedKey(null);
    setSelectedNamespace("");
    setKeyExpiration("");
    setKeyAclTags("");
    setLocalError("");
  };

  return {
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
  };
};

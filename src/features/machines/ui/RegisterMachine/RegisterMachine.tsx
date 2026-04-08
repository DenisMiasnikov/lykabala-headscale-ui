import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { Namespace } from "../../../../entities/namespace/types";
import {Input} from "../../../../shared/ui/input/Input";
import {Button} from "../../../../shared/ui/button/Button";
import {Select} from "../../../../shared/ui/select/Select";
import {Card} from "../../../../shared/ui/card/Card";

import styles from './index.module.css'

interface IRegisterMachineProps {
  onSuccess?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export const RegisterMachine: React.FC<IRegisterMachineProps> = ({
  onSuccess,
  onError,
}) => {
  const router = useRouter();
  const [registerUser, setRegisterUser] = useState("");
  const [nodeKey, setNodeKey] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [namespacesLoading, setNamespacesLoading] = useState(true);
  const [namespacesError, setNamespacesError] = useState<string | null>(null);

  // Auto-fill node key from URL query parameter (only if no success message shown)
  useEffect(() => {
    if (router.query.key && typeof router.query.key === "string" && !nodeKey && !result) {
      setNodeKey(router.query.key);
    }
  }, [router.query, nodeKey, result]);

  // Auto-select first namespace after namespaces load
  useEffect(() => {
    if (!registerUser && namespaces.length > 0) {
      setRegisterUser(namespaces[0].name);
    }
  }, [namespaces, registerUser]);

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
      // Clear ?key from URL
      if (router.query.key) {
        const { key, ...rest } = router.query;
        router.replace(
          {
            pathname: router.pathname,
            query: rest,
          },
          undefined,
          { shallow: true }
        );
      }
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to register node";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadNamespaces() {
    setNamespacesError(null);
    setNamespacesLoading(true);
    try {
      const res = await fetch("/api/namespaces");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load namespaces");
      }
      const list = Array.isArray(data.namespaces) ? data.namespaces : [];
      setNamespaces(list);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load namespaces";
      setNamespacesError(message);
    } finally {
      setNamespacesLoading(false);
    }
  }

  useEffect(() => {
    loadNamespaces();
  }, []);

  return (
    <Card title="Register Node Key">
      <div className={styles.form}>
        <Select
          value={registerUser}
          onChange={setRegisterUser}
          items={namespaces.map(({id, name}) => ({label: name, value: id}))}
          placeholder="Select user"
        />

        <Input
          value={nodeKey}
          onChange={setNodeKey}
          type="text"
          placeholder="Paste node key from Tailscale app"
        />

        <Button
          type="button"
          label={loading ? "Registering..." : "Register"}
          onClick={registerNode}
        />
      </div>
    </Card>
  )
};

export default RegisterMachine;

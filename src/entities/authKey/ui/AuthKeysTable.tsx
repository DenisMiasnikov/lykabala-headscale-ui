import { useEffect, useState } from "react";
import {useParams} from "next/navigation";
import {Button, Table} from "@/shared";
import type { AuthKey } from "../types";

export const AuthKeysTable = () => {
  const [preauthKeys, setPreauthKeys] = useState<AuthKey[]>([]);
  const [keyError, setKeyError] = useState("");
  const {id:userId} = useParams();

  async function loadPreAuthKeys() {
    try {
      const res = await fetch("/api/internal/preauthkey/list");
      const data = await res.json();
      if (res.ok) {
        setPreauthKeys((data.preAuthKeys || []).filter(({user:{id}}) => id === userId));
      }
    } catch (err) {
      console.error("Failed to load preauth keys:", err);
    }
  }

  async function deletePreAuthKey(id: string) {
    if (!confirm(`Delete pre-auth key?`)) return;
    try {
      const res = await fetch(`/api/internal/preauthkey/delete?id=${id}`, {
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

  const columns = [
    {
      key: "key",
      label: "Prefix",
      render: (value) => `${value.substring(0, 8)}...`,
    },
    userId ? undefined : {
      key: "user",
      label: "Namespace",
      render: (value) => value?.name || "-",
    },
    {
      key: "reusable",
      label: "Reusable",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      key: "ephemeral",
      label: "Ephemeral",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      key: "aclTags",
      label: "ACL Tags",
      render: (value) => value?.join(", ") || "-",
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      key: "expiration",
      label: "Expires",
      render: (value) => (value ? new Date(value).toLocaleString() : "-"),
    },
    {
      key: "used",
      label: "Used",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      key: "actions",
      className: "actions-cell",
      render: (_, row) => (
        <Button
          mode={'action'}
          label={'Revoke'}
          onClick={() => deletePreAuthKey(row.id)}
        />
      ),
    },
  ].filter(Boolean);

  useEffect(() => {
    loadPreAuthKeys();
  }, []);

  return (
    <>
      {keyError && (
        <div className="error" style={{ marginTop: 8 }}>
          {keyError}
        </div>
      )}
      {preauthKeys.length === 0 ? (
        <div className="subtitle">No pre-auth keys generated yet.</div>
      ) : (
        <Table columns={columns} data={preauthKeys} />
      )}
    </>
  );
};

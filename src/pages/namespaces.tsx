import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import CreateNamespace from "../features/namespaces/ui/createNamespace/CreateNameSpace";
import GeneratePreAuthKey from "../features/authKey/ui/generatePreAuthKeyModal/GeneratePreAuthKeyModal";
import type { Namespace } from "../entities/namespace/types";
import { getAuthRedirect } from "../shared/lib/auth/requireAuth";
import {
  EditIcon,
  KeyIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
} from "../shared/ui/icons/Icons";
import Table from "../shared/ui/table/Table";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;
  return { props: {} };
};

export default function NamespacesPage() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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

  function startEdit(ns: Namespace, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(ns.id);
    setEditName(ns.name);
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

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <>
          {editingId === row.id ? (
            <input
              className="input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(row.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              autoFocus
            />
          ) : (
            <a href={`/namespaces/${row.id}`}>{value}</a>
          )}
        </>
      ),
    },
    {
      key: "displayName",
      label: "Display Name",
      render: (value) => value || "-",
    },
    {
      key: "email",
      label: "Email",
      render: (value) => value || "-",
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
    {
      key: "actions",
      className: "actions-cell",
      render: (_, row) => (
        <>
          {editingId === row.id ? (
            <div className="action-buttons-group">
              <button
                className="button action-button"
                onClick={() => saveEdit(row.id)}
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
                onClick={(e) => startEdit(row, e)}
                title="Edit"
              >
                <EditIcon />
                <span className="button-label">Edit</span>
              </button>

              <GeneratePreAuthKey
                onSuccess={(key) => {
                  setMessage(
                    `Key generated for ${key.user?.name || "namespace"}`,
                  );
                }}
                namespaces={namespaces}
              />
              <button
                className="button action-button delete-button"
                // onClick={() => deleteNamespace(row.id, row.name)}
                title="Delete"
              >
                <TrashIcon />
                <span className="button-label">Delete</span>
              </button>
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Headscale Control</h1>
        <p className="subtitle">Manage namespaces</p>

        {error && <div className="error">{error}</div>}
        {message && (
          <div className="pill online" style={{ marginBottom: 16 }}>
            {message}
          </div>
        )}

        <CreateNamespace
          onSuccess={(msg) => {
            setMessage(msg);
            loadData();
          }}
          onError={setError}
        />

        <div className="card">
          <h2 className="title" style={{ fontSize: 22 }}>
            Namespaces
          </h2>
          {namespaces.length === 0 ? (
            <div className="subtitle">No namespaces yet.</div>
          ) : (
            <Table columns={columns} data={namespaces} />
          )}
        </div>
      </div>
    </div>
  );
}

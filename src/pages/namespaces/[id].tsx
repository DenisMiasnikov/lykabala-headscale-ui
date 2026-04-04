import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../../shared/lib/auth/requireAuth";
import type {
  Namespace,
  NamespaceDetailsProps,
  NamespaceDetails,
} from "../../entities/namespace/types";
import GeneratePreAuthKey from "../../features/authKey/ui/createAuthKey/CreateAuthKey";
import { AuthKeysTable } from "../../entities/authKey/ui/AuthKeysTable";

export default function NamespaceDetails({ id }: NamespaceDetailsProps) {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);

  const [details, setDetails] = useState<NamespaceDetails | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

              <GeneratePreAuthKey
                onSuccess={(key) => {
                  setMessage(
                    `Key generated for ${key.user?.name || "namespace"}`,
                  );
                }}
                namespaces={namespaces}
              />

              <div className="card" style={{ marginTop: 24 }}>
                <h2 className="title" style={{ fontSize: 22 }}>
                  Pre-Auth Keys
                </h2>
                <AuthKeysTable />
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

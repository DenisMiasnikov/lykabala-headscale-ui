import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../../utils/requireAuth";

type MachineDetailsProps = {
  id: string;
};

type MachineDetails = {
  id?: string;
  givenName?: string;
  availableRoutes?: string[];
  approvedRoutes?: string[];
};

export default function MachineDetails({ id }: MachineDetailsProps) {
  const [details, setDetails] = useState<MachineDetails | null>(null);
  const [error, setError] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [routeSelections, setRouteSelections] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState("");

  async function loadDetails() {
    const res = await fetch(`/api/machines/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load machine");
      return;
    }
    setDetails(data);
    if (data?.givenName && !nameInput) {
      setNameInput(data.givenName);
    }
    if (Array.isArray(data?.approvedRoutes)) {
      setRouteSelections(data.approvedRoutes);
    }
  }

  async function expireMachine() {
    await fetch(`/api/machines/${id}/expire`, { method: "POST" });
    await loadDetails();
  }

  async function renameMachine() {
    setError("");
    setActionMessage("");
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    const res = await fetch(
      `/api/machines/${id}/rename?givenName=${encodeURIComponent(trimmed)}`,
      { method: "POST" }
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Rename failed");
      return;
    }
    setActionMessage("Name updated");
    await loadDetails();
  }

  async function saveApprovedRoutes() {
    setError("");
    setActionMessage("");
    const res = await fetch(`/api/machines/${id}/approve-routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routes: routeSelections })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to approve routes");
      return;
    }
    setActionMessage("Routes updated");
    await loadDetails();
  }

  useEffect(() => {
    loadDetails();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="title">Machine Details</h1>
          <p className="subtitle">ID: {id}</p>
          {error ? <div className="error">{error}</div> : null}
          {actionMessage ? (
            <div className="pill online" style={{ marginTop: 12 }}>
              {actionMessage}
            </div>
          ) : null}
          <div className="row" style={{ marginTop: 16, alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label>Machine Name</label>
              <input
                className="input"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
              />
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button className="button" onClick={renameMachine}>
                Rename
              </button>
            </div>
          </div>
          <div className="row" style={{ marginTop: 16, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <label>Approved Routes</label>
              {details?.availableRoutes?.length ? (
                <div style={{ marginTop: 8 }}>
                  {details.availableRoutes.map((route) => (
                    <label key={route} style={{ display: "block" }}>
                      <input
                        type="checkbox"
                        checked={routeSelections.includes(route)}
                        onChange={(event) => {
                          setRouteSelections((prev) =>
                            event.target.checked
                              ? [...prev, route]
                              : prev.filter((item) => item !== route)
                          );
                        }}
                      />{" "}
                      {route}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="subtitle" style={{ marginTop: 8 }}>
                  No available routes.
                </div>
              )}
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button className="button" onClick={saveApprovedRoutes}>
                Save Routes
              </button>
            </div>
          </div>
          {details ? (
            <pre
              className="keybox"
              style={{
                whiteSpace: 'pre-wrap',
                overflow: 'scroll',
              }}
            >
              <code>
                {JSON.stringify(details, null, 2)}
              </code>
            </pre>
          ) : null}
          <div className="row" style={{ marginTop: 16 }}>
            <button className="button secondary" onClick={expireMachine}>
              Expire
            </button>
            <a className="button" href="/machines">
              Back
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<MachineDetailsProps> =
  async (context) => {
    const redirect = await getAuthRedirect(context);
    if (redirect) return redirect;

    return {
      props: {
        id: String(context.params?.id || "")
      }
    };
  };

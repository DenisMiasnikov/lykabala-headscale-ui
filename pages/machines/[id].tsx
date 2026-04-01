import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../../utils/requireAuth";
import { MoveIcon } from "../../components/Icons";

type MachineDetailsProps = {
  id: string;
};

type MachineDetails = {
  id?: string;
  givenName?: string;
  availableRoutes?: string[];
  approvedRoutes?: string[];
  user?: { name?: string };
};

type Namespace = {
  id?: string;
  name: string;
};

export default function MachineDetails({ id }: MachineDetailsProps) {
  const [details, setDetails] = useState<MachineDetails | null>(null);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState("");
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

  async function loadNamespaces() {
    try {
      const res = await fetch("/api/namespaces");
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to load namespaces:", data.error);
        return;
      }
      const list = Array.isArray(data.namespaces) ? data.namespaces : [];
      setNamespaces(list);
    } catch (err) {
      console.error("Failed to load namespaces:", err);
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

  async function moveMachine() {
    setError("");
    setActionMessage("");
    if (!selectedNamespace) {
      setError("Select a namespace");
      return;
    }

    const targetNamespace = namespaces.find(ns => ns.name === selectedNamespace);
    if (!targetNamespace?.id) {
      setError("Invalid namespace");
      return;
    }

    const res = await fetch(`/api/machines/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ namespaceId: targetNamespace.id })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to move machine");
      return;
    }

    setActionMessage("Machine moved to namespace");
    await loadDetails();
  }

  useEffect(() => {
    loadDetails();
    loadNamespaces();
  }, []);

  // Set selected namespace when details and namespaces are loaded
  useEffect(() => {
    if (details?.user?.name && namespaces.length > 0) {
      // Check if current namespace exists in the list
      const exists = namespaces.find(ns => ns.name === details.user?.name);
      if (exists) {
        setSelectedNamespace(details.user.name);
      } else {
        // If not found (e.g., deleted), set to first namespace or empty
        setSelectedNamespace(namespaces[0]?.name || "");
      }
    }
  }, [details, namespaces]);

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
             <div style={{ flex: 1, minWidth: 220 }}>
               <label>Namespace</label>
               <select
                 className="input"
                 value={selectedNamespace}
                 onChange={(event) => setSelectedNamespace(event.target.value)}
               >
                 {namespaces.map((ns) => (
                   <option key={ns.id || ns.name} value={ns.name}>
                     {ns.name}
                   </option>
                 ))}
               </select>
             </div>
             <div style={{ alignSelf: "flex-end" }}>
               <button className="button" onClick={moveMachine}>
                 <MoveIcon /> Move
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

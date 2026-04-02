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
  user?: { name?: string };
  tags?: string[];
};

export default function MachineDetails({ id }: MachineDetailsProps) {
  const [details, setDetails] = useState<MachineDetails | null>(null);
  const [error, setError] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [routeSelections, setRouteSelections] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

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
    if (Array.isArray(data?.tags)) {
      setTags(data.tags);
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

  async function addTag() {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const newTags = [...tags, trimmed];
    setTagInput("");
    await saveTags(newTags);
  }

  async function removeTag(tagToRemove: string) {
    const newTags = tags.filter(t => t !== tagToRemove);
    await saveTags(newTags);
  }

  async function saveTags(newTags: string[]) {
    setError("");
    setActionMessage("");
    try {
      const res = await fetch(`/api/machines/${id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save tags");
        return;
      }
      setTags(newTags);
      setActionMessage("Tags updated");
    } catch (err) {
      setError("Network error");
    }
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
          <div className="row" style={{ marginTop: 16 }}>
            <div style={{ flex: 1 }}>
              <label>Namespace</label>
              <div className="subtitle" style={{ marginTop: 4 }}>
                {details?.user?.name || "Unknown"}
              </div>
            </div>
          </div>
          <div className="row" style={{ marginTop: 16, alignItems: "flex-start" }}>
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
            <div style={{ alignSelf: "flex-end", marginLeft: 16 }}>
              <button className="button" onClick={saveApprovedRoutes}>
                Save Routes
              </button>
            </div>
          </div>
          <div className="row" style={{ marginTop: 16, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <label>Tags</label>
              <div style={{ marginTop: 4 }}>
                {tags.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "#e0e0e0",
                          padding: "4px 8px",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            color: "#666"
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="subtitle">No tags.</div>
                )}
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <input
                  className="input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag..."
                  style={{ flex: 1 }}
                />
                <button className="button" onClick={addTag}>
                  Add
                </button>
              </div>
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
            <button
              className="button secondary"
              onClick={async () => {
                if (!confirm("Backfill IPs for all nodes? This may update IP addresses.")) return;
                const res = await fetch(`/api/machines/backfill-ips?confirmed=true`, { method: "POST" });
                if (res.ok) {
                  alert("Backfill completed");
                  await loadDetails();
                } else {
                  alert("Backfill failed");
                }
              }}
            >
              Backfill IPs
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

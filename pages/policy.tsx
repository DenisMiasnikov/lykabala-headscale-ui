import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../utils/requireAuth";

type PolicyPageProps = {};

type PolicyData = {
  policy: string;
  updatedAt?: string;
};

export default function PolicyPage({}: PolicyPageProps) {
  const [policy, setPolicy] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadPolicy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/policy");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load policy");
        setPolicy("");
        setUpdatedAt("");
      } else {
        setPolicy(data.policy || "");
        setUpdatedAt(data.updatedAt || "");
      }
    } catch (err) {
      setError("Network error");
      setPolicy("");
      setUpdatedAt("");
    } finally {
      setLoading(false);
    }
  }

  async function savePolicy() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save policy");
      } else {
        setMessage("Policy saved successfully");
        setUpdatedAt(data.updatedAt || new Date().toISOString());
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadPolicy();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h1 className="title">Policy Configuration</h1>
          {error && <div className="error">{error}</div>}
          {message && <div className="pill online" style={{ marginTop: 12 }}>{message}</div>}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
                  Policy (HCL/JSON)
                </label>
                <textarea
                  className="input"
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  style={{ width: "100%", minHeight: "400px", fontFamily: "monospace", fontSize: "14px" }}
                />
              </div>
              {updatedAt && (
                <p className="subtitle">
                  Last updated: {new Date(updatedAt).toLocaleString()}
                </p>
              )}
              <div style={{ marginTop: 16 }}>
                <button className="button" onClick={savePolicy} disabled={saving}>
                  {saving ? "Saving..." : "Save Policy"}
                </button>
                <button className="button secondary" onClick={loadPolicy} style={{ marginLeft: 8 }}>
                  Reload
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PolicyPageProps> =
  async (context) => {
    const redirect = await getAuthRedirect(context);
    if (redirect) return redirect;

    return {
      props: {}
    };
  };

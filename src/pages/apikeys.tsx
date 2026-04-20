import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuthRedirect } from "../shared/lib/auth/requireAuth";
import type { ApiKey, ApiKeysPageProps } from "../entities/apiKey/types";
import {Button} from "../shared/ui/button/Button";
import {Input} from "../shared/ui/input/Input";
import {Card} from "../shared/ui/card/Card";
import {Page} from "../shared/ui/page/Page";
import {formatDate} from "../shared/lib/date";

export default function ApiKeysPage({}: ApiKeysPageProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newExpiration, setNewExpiration] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState();

  async function loadKeys() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/internal/apikey");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load API keys");
        setKeys([]);
      } else {
        setKeys(data.apiKeys || []);
      }
    } catch (err) {
      setError("Network error");
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const body: any = {};
      if (newExpiration) {
        body.expiration = newExpiration;
      }
      const res = await fetch("/api/internal/apikey/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create API key");
      } else {
        setMessage('API key created');
        setNewKey(data?.apiKey);
        setNewExpiration("");
        await loadKeys();
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function deleteKey(prefix: string) {
    try {
      const res = await fetch(`/api/internal/apikey/${prefix}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete API key");
      } else {
        setMessage("API key deleted");
        setNewKey(undefined);
        await loadKeys();
      }
    } catch (err) {
      setError("Network error");
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  return (
    <Page title={'API Keys'} subtitle={undefined}>
      {error && <div className="error">{error}</div>}
      {message && (
        <div className="pill online" style={{ marginTop: 12 }}>
          {message}
          {newKey && <Input
            type={'text'}
            value={newKey}
            onChange={undefined}
            placeholder={undefined}
          />}
        </div>
      )}

      <Card title="Create New API Key">
        <Input
          type="datetime-local"
          value={newExpiration}
          onChange={setNewExpiration}
          placeholder={undefined}
        />
        <Button
          onClick={createKey}
          disabled={creating}
          label={creating ? "Creating..." : "Create Key"}
          mode={'action'}
        />
      </Card>

      {loading ? (
        <p>Loading...</p>
      ) : keys.length === 0 ? (
        <p>No API keys.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              <th style={{ textAlign: "left", padding: 8 }}>Prefix</th>
              <th style={{ textAlign: "left", padding: 8 }}>Created</th>
              <th style={{ textAlign: "left", padding: 8 }}>Expires</th>
              <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.prefix}>
                <td style={{ padding: 8, fontFamily: "monospace" }}>
                  {k.prefix}
                </td>
                <td style={{ padding: 8 }}>
                  {formatDate(k.createdAt)}
                </td>
                <td style={{ padding: 8 }}>
                  {formatDate(k.expiration)}
                </td>
                <td style={{ padding: 8 }}>
                  <Button
                    onClick={() => deleteKey(k.prefix)}
                    mode={'primary'}
                    label={'Revoke'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Page>
  );
}

export const getServerSideProps: GetServerSideProps<ApiKeysPageProps> = async (
  context,
) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;

  return {
    props: {},
  };
};

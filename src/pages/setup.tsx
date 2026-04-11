import { useState } from "react";
import Image from "next/image";
import { Input } from "../shared/ui/input/Input";
import { Form } from "../shared/ui/form/Form";
import { Button } from "../shared/ui/button/Button";
import { addServer, hasServers } from "../shared/lib/storage";
import { encrypt } from "../shared/lib/crypto";

export default function SetupPage() {
  const [serverName, setServerName] = useState("");
  const [headscaleUrl, setHeadscaleUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function testConnection() {
    try {
      const res = await fetch("/api/internal/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: headscaleUrl, apiKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && data.error) {
        setError(data.error);
      }
      return res.ok;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setError("");

    if (!serverName.trim()) {
      setError("Server name is required");
      return;
    }
    if (!headscaleUrl.trim()) {
      setError("Headscale URL is required");
      return;
    }
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }
    if (!adminUsername.trim()) {
      setError("Admin username is required");
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(adminUsername)) {
      setError("Admin username can only contain letters, numbers, underscores, dots, and hyphens");
      return;
    }
    if (!adminPassword || adminPassword.length < 8) {
      setError("Admin password must be at least 8 characters");
      return;
    }
    if (adminPassword !== confirmPassword) {
      setError("Admin passwords do not match");
      return;
    }

    setLoading(true);

    const connected = await testConnection();
    if (!connected) {
      setError("Cannot connect to Headscale server. Check URL and API key.");
      setLoading(false);
      return;
    }

    try {
      const encryptedKey = await encrypt(apiKey.trim(), adminPassword);

      await addServer(
        serverName.trim(),
        headscaleUrl.trim(),
        encryptedKey,
        adminUsername.trim()
      );

      const res = await fetch("/api/internal/setup-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword,
          isAdmin: true,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        window.location.href = "/login";
        return;
      }

      if (data.error === "Admin user already exists") {
        window.location.href = "/login";
        return;
      }

      setError(data.error || "Failed to create admin user");
      setLoading(false);
      return;
    } catch (err) {
      setError("Failed to save configuration");
      setLoading(false);
    }
  }

  return (
    <Form
      title={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Image src="/logo.png" alt="Logo" width={56} height={56} />
          {"Connect to Headscale"}
        </div>
      }
      subtitle="Configure your Headscale server to get started"
    >
      <Input value={serverName} onChange={setServerName} type="text" placeholder="Server Name (e.g., Production)" />
      <Input value={headscaleUrl} onChange={setHeadscaleUrl} type="text" placeholder="Headscale URL (e.g., https://headscale.example.com)" />
      <Input value={apiKey} onChange={setApiKey} type="password" placeholder="Headscale API Key" />

      <div style={{ borderTop: "1px solid #e5e5e5", margin: "8px 0" }} />

      <Input value={adminUsername} onChange={setAdminUsername} type="text" placeholder="Admin Username" />
      <Input value={adminPassword} onChange={setAdminPassword} type="password" placeholder="Admin Password (also encrypts API key)" />
      <Input value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Confirm Admin Password" />

      <Button type="submit" label={loading ? "Connecting..." : "Connect"} onClick={handleSubmit} disabled={loading} />

      {error ? <div className="error">{error}</div> : null}
    </Form>
  );
}

export async function getServerSideProps() {
  if (hasServers()) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  if ((process.env.HEADSCALE_URL && process.env.HEADSCALE_API_KEY) || process.env.HEADSCALE_API_KEY_FILE) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
}

import Image from "next/image";
import { useState, MouseEvent } from "react";
import { Input } from "../shared/ui/input/Input";
import { Form } from "../shared/ui/form/Form";
import { Button } from "../shared/ui/button/Button";
import { ServerSelect } from "../shared/ui/server-select/ServerSelect";
import { getActiveServerId, getServers } from "../shared/lib/storage";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showServerSelect, setShowServerSelect] = useState(false);

  const servers = getServers();
  const activeId = getActiveServerId();
  const activeServer = servers.find(s => s.id === activeId) || servers[0];

  async function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setError("");

    const loginData: Record<string, string> = { username, password };
    if (activeServer) {
      loginData.headscaleUrl = activeServer.url;
      loginData.encryptedApiKey = activeServer.encryptedKey;
    }

    const res = await fetch("/api/internal/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData)
    });

    if (res.ok) {
      window.location.href = "/machines";
      return;
    }

    const data = await res.json().catch(() => ({}));
    setError(data.error || "Login failed");
  }

  return (
    <Form title={
      <div style={{ display: "flex", flexDirection: 'column', alignItems: "center", gap: 8 }}>
        <Image
          src="/logo.png"
          alt="My photo"
          width={56}
          height={56}
        />
        {'Welcome Back'}
      </div>
    } subtitle="Sign in to continue manage your private tailnet">
      {activeServer && (
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
          Connected to: {activeServer.name}
          <button
            onClick={() => setShowServerSelect(true)}
            style={{ background: "none", border: "none", color: "#007aff", cursor: "pointer", marginLeft: 8 }}
          >
            (Change)
          </button>
        </div>
      )}

      <Input
        value={username}
        onChange={setUsername}
        type="text"
        placeholder="Username"
      />

      <Input
        value={password}
        onChange={setPassword}
        type="password"
        placeholder="Password"
      />

      <Button
        type="submit"
        label={'Sign In'}
        onClick={handleSubmit}
      />

      {error ? <div className="error">{error}</div> : null}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <button
          onClick={() => window.location.href = "/setup"}
          style={{ background: "none", border: "none", color: "#007aff", cursor: "pointer" }}
        >
          + Add Server
        </button>
      </div>

      <ServerSelect
        isOpen={showServerSelect}
        onClose={() => setShowServerSelect(false)}
        onSelect={() => {}}
      />
    </Form>
  );
}

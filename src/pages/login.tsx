import Image from "next/image";
import {useRouter} from "next/router";
import { useState, MouseEvent, useEffect } from "react";
import {ChangeServer} from "../features/login";
import { Input } from "../shared/ui/input/Input";
import { Form } from "../shared/ui/form/Form";
import { Button } from "../shared/ui/button/Button";
import {getActiveServerId, getServers, ServerConfig} from "../shared/lib/storage";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeServer, setActiveServer] = useState<ServerConfig>(null);

  useEffect(() => {
    const servers = getServers().find(s => s.id === getActiveServerId()) || getServers()[0]
    setActiveServer(servers);
  }, []);

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
      router.push('/machines');
      return;
    }

    const data = await res.json().catch(() => ({}));
    setError(data.error || "Login failed");
  }

  const goToSetup = () => {
    router.push('/setup');
  };

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
      <ChangeServer />

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
          type={'button'}
          onClick={goToSetup}
          style={{ background: "none", border: "none", color: "#007aff", cursor: "pointer" }}
        >
          + Add Server
        </button>
      </div>
    </Form>
  );
}

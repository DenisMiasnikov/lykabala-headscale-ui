import Image from "next/image";
import {useRouter} from "next/router";
import { useState, MouseEvent, useEffect } from "react";
import {ChangeServer} from "@/features/login";
import { Input, Form, Button } from "@/shared/ui";
import {getActiveServerId, getServers, ServerConfig} from "@/shared/lib/storage";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeServer, setActiveServer] = useState<ServerConfig | null>(null);
  const [isEnvServer, setIsEnvServer] = useState(false);
  const [envUrl, setEnvUrl] = useState("");

  useEffect(() => {
    const servers = getServers();
    const activeId = getActiveServerId();

    const fetchEnvConfig = async () => {
      try {
        const res = await fetch("/api/internal/env-config");
        const data = await res.json();
        if (data.available && data.url) {
          setEnvUrl(data.url);
          if (activeId === "env") {
            setIsEnvServer(true);
            return;
          }
        }
      } catch {}
      setIsEnvServer(false);
      const server = servers.find(s => s.id === activeId) || servers[0] || null;
      setActiveServer(server);
    };

    if (activeId === "env") {
      fetchEnvConfig();
    } else {
      const server = servers.find(s => s.id === activeId) || servers[0] || null;
      setActiveServer(server);
      setIsEnvServer(false);
    }
  }, []);

  async function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setError("");

    if (!isEnvServer && !activeServer) {
      setError("Headscale server not configured. Click '+ Add Server' to configure one.");
      return;
    }

    const loginData: Record<string, string> = { username, password };

    if (isEnvServer && envUrl) {
      loginData.headscaleUrl = envUrl;
      loginData.useEnvKey = "true";
    } else if (activeServer) {
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

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      window.location.href = "/machines";
      return;
    }

    const data = await res.json().catch(() => ({}));
    setError(data.error || "Login failed");
  }

  return (
    <div className="page">
      <div className="container">
        <div className="card" style={{ maxWidth: 480, margin: "80px auto" }}>
          <h1 className="title">Headscale Login</h1>
          <p className="subtitle">Sign in to manage your private tailnet.</p>
          <form onSubmit={handleSubmit}>
            <div className="row" style={{ flexDirection: "column" }}>
              <input
                className="input"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button className="button" type="submit">
                Sign In
              </button>
              {error ? <div className="error">{error}</div> : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

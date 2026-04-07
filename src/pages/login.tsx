import { useState } from "react";
import {Input} from "../shared/ui/input/Input";
import {Form} from "../shared/ui/form/Form";
import {Button} from "../shared/ui/button/Button";

import styles from "../shared/ui/toolbar/toolbar.module.css";

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
    <Form title="Welcome Back" subtitle="Sign in to continue manage your private tailnet">
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

      {/*<div className={styles.links}>*/}
      {/*  <a href="#">Forgot password?</a>*/}
      {/*  <a href="#">Create account</a>*/}
      {/*</div>*/}
    </Form>
  );
}

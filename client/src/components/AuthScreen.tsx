import { FormEvent, useState } from "react";
import { api, setToken } from "../api";

export default function AuthScreen({
  onAuthenticated
}: {
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("Kevin Jordan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const result =
        mode === "register"
          ? await api.register(name, email, password)
          : await api.login(email, password);

      setToken(result.token);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-copy">
        <p className="eyebrow">FULL-STACK PORTFOLIO STARTER</p>
        <h1>Turn your job search into a project employers can explore.</h1>
        <p>
          Demonstrate React, TypeScript, REST APIs, authentication, PostgreSQL,
          Prisma, AI integration, responsive design, and deployment.
        </p>
      </section>

      <form className="auth-card" onSubmit={submit}>
        <h2>
          {mode === "register" ? "Create your account" : "Welcome back"}
        </h2>

        {error && <div className="alert">{error}</div>}

        {mode === "register" && (
          <label>
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}

        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="submit">
          {mode === "register" ? "Register" : "Log in"}
        </button>

        <button
          className="text-button"
          type="button"
          onClick={() =>
            setMode(mode === "register" ? "login" : "register")
          }
        >
          {mode === "register"
            ? "Already registered? Log in"
            : "Need an account? Register"}
        </button>
      </form>
    </main>
  );
}
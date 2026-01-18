"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Authentication failed");
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="stack">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="stack">
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          className="input"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error ? <div className="notice">{error}</div> : null}
      <div className="toolbar">
        <button className="button" type="submit" disabled={loading}>
          {mode === "login" ? "Connexion" : "Creer un compte"}
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Pas de compte ?" : "Deja inscrit ?"}
        </button>
      </div>
      <div className="subtle">Mot de passe: 8 caracteres minimum.</div>
    </form>
  );
}

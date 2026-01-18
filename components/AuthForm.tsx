"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register" | "forgot";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();
  const isForgot = mode === "forgot";

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (mode === "forgot") {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Password reset failed");
        setLoading(false);
        return;
      }
      setNotice(data.message ?? "Demande envoyee.");
      setLoading(false);
      return;
    }

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
      {isForgot ? null : (
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
      )}
      {mode === "login" ? (
        <button className="button ghost" type="button" onClick={() => switchMode("forgot")}>
          Mot de passe oublie ?
        </button>
      ) : null}
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice">{error}</div> : null}
      <div className="toolbar">
        <button className="button" type="submit" disabled={loading}>
          {mode === "login" ? "Connexion" : mode === "register" ? "Creer un compte" : "Envoyer le lien"}
        </button>
        {mode === "forgot" ? (
          <button className="button secondary" type="button" onClick={() => switchMode("login")}>
            Retour connexion
          </button>
        ) : (
          <button
            className="button secondary"
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Pas de compte ?" : "Deja inscrit ?"}
          </button>
        )}
      </div>
      {mode === "register" ? <div className="subtle">Mot de passe: 8 caracteres minimum.</div> : null}
    </form>
  );
}

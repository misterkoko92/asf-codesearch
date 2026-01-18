"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  token: string;
};

export default function ResetPasswordForm({ token }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!token) {
    return <div className="notice">Lien invalide ou expire.</div>;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Reset failed");
      setLoading(false);
      return;
    }

    setNotice("Mot de passe mis a jour. Vous pouvez vous connecter.");
    setLoading(false);
  }

  if (notice) {
    return (
      <div className="stack">
        <div className="notice">{notice}</div>
        <button className="button" type="button" onClick={() => router.push("/login")}>
          Aller a la connexion
        </button>
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="stack">
        <label className="label" htmlFor="password">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          className="input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <div className="stack">
        <label className="label" htmlFor="confirmPassword">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          className="input"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />
      </div>
      {error ? <div className="notice">{error}</div> : null}
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Mise a jour..." : "Mettre a jour"}
      </button>
      <div className="subtle">Mot de passe: 8 caracteres minimum.</div>
    </form>
  );
}

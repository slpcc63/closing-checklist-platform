"use client";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const name = String(data.get("name") || "").trim();
    const result = mode === "sign-up"
      ? await authClient.signUp.email({ email, password, name, callbackURL: "/admin" })
      : await authClient.signIn.email({ email, password, callbackURL: "/admin" });
    if (result.error) { setError(result.error.message || "Sign-in failed."); setBusy(false); return; }
    router.push("/admin");
    router.refresh();
  }

  return <div>
    <div className="auth-toggle">
      <button className={mode === "sign-in" ? "active" : ""} onClick={() => setMode("sign-in")} type="button">Sign in</button>
      <button className={mode === "sign-up" ? "active" : ""} onClick={() => setMode("sign-up")} type="button">Create account</button>
    </div>
    <form className="auth-form" onSubmit={submit}>
      {mode === "sign-up" && <label><span>Your name</span><input name="name" autoComplete="name" required placeholder="Alex Morgan" /></label>}
      <label><span>Work email</span><input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
      <label><span>Password</span><input name="password" type="password" minLength={8} autoComplete={mode === "sign-up" ? "new-password" : "current-password"} required placeholder="At least 8 characters" /></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="primary-button auth-submit" disabled={busy} type="submit">{busy ? "Working…" : mode === "sign-up" ? "Create workspace" : "Continue"}</button>
    </form>
  </div>;
}

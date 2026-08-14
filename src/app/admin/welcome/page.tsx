"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/browser";
import { isStrongPassword, PASSWORD_RULES_TEXT } from "@/lib/password";
import { PasswordRuleChecklist } from "../PasswordChecklist";

type State = "checking" | "ready" | "invalid" | "done";

// Landing page for BOTH invite and password-reset emails: the link carries
// session tokens in the URL fragment, the person sets a password here and
// goes straight into the panel.
export default function WelcomePage() {
  const [state, setState] = useState<State>("checking");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setState((prev) => (prev === "done" ? prev : "ready"));
    });
    supabase.auth.getSession().then(({ data }) => {
      setState((prev) => {
        if (prev !== "checking") return prev;
        return data.session ? "ready" : prev;
      });
    });
    // If no session materialises, the link was already used or expired.
    const timer = setTimeout(
      () => setState((prev) => (prev === "checking" ? "invalid" : prev)),
      4000,
    );
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!isStrongPassword(password)) {
      setError(PASSWORD_RULES_TEXT);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setState("done");
    window.location.assign("/admin");
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Mug.Up Admin — set your password</h1>
      {state === "checking" && <p className="mt-4 text-neutral-600">Checking your link…</p>}
      {state === "invalid" && (
        <p className="mt-4 border border-red-400 bg-red-50 p-3 text-sm text-red-800">
          This link is invalid or has expired. Ask an administrator to send a new one.
        </p>
      )}
      {state === "done" && <p className="mt-4 text-neutral-600">Password set — signing you in…</p>}
      {state === "ready" && (
        <>
          <p className="mt-2 text-sm text-neutral-600">
            Choose a new password for your account to continue.
          </p>
          {error && (
            <p className="mt-3 border border-red-400 bg-red-50 p-3 text-sm text-red-800">{error}</p>
          )}
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full border border-neutral-400 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium">
                Repeat password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full border border-neutral-400 px-3 py-2"
              />
            </div>
            <PasswordRuleChecklist password={password} confirm={confirm} />
            <button type="submit" className="border border-neutral-900 px-4 py-2 font-medium">
              Set password & enter
            </button>
          </form>
        </>
      )}
    </div>
  );
}

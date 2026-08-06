"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/data/supabase/browser";

type State = "checking" | "ready" | "invalid" | "done";

// Landing page for the invite email: the link carries session tokens, the
// invitee sets their password here and goes straight into the panel.
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
    if (password.length < 6) {
      setError("The password must be at least 6 characters.");
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
      <h1 className="text-2xl font-bold">Welcome to Mug.Up Admin</h1>
      {state === "checking" && <p className="mt-4 text-neutral-600">Checking your invite…</p>}
      {state === "invalid" && (
        <p className="mt-4 border border-red-400 bg-red-50 p-3 text-sm text-red-800">
          This invite link is invalid or has expired. Ask an administrator to send a new one.
        </p>
      )}
      {state === "done" && <p className="mt-4 text-neutral-600">Password set — signing you in…</p>}
      {state === "ready" && (
        <>
          <p className="mt-2 text-sm text-neutral-600">
            Set a password for your account to finish signing up.
          </p>
          {error && (
            <p className="mt-3 border border-red-400 bg-red-50 p-3 text-sm text-red-800">{error}</p>
          )}
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password (6+ characters)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
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
                minLength={6}
                autoComplete="new-password"
                className="mt-1 w-full border border-neutral-400 px-3 py-2"
              />
            </div>
            <button type="submit" className="border border-neutral-900 px-4 py-2 font-medium">
              Set password & enter
            </button>
          </form>
        </>
      )}
    </div>
  );
}

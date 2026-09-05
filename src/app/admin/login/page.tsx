import { signIn } from "../actions";
import { BTN_PRIMARY, H1, INPUT, Notice } from "../ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className={H1}>Sign in</h1>
      {error && (
        <Notice tone="error">
          {error === "invalid"
            ? "Wrong email or password."
            : error === "expired"
              ? "You were signed out after a period of inactivity — sign in again."
              : error === "no-profile"
                ? "Your account has no team profile yet — ask an administrator to set it up."
                : "Enter email and password."}
        </Notice>
      )}
      <form action={signIn} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={INPUT}
          />
        </div>
        <button type="submit" className={BTN_PRIMARY}>
          Sign in
        </button>
      </form>
    </div>
  );
}

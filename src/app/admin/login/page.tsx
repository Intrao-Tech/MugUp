import { signIn } from "../actions";
import { Notice } from "../ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Sign in</h1>
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
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full border border-neutral-400 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full border border-neutral-400 px-3 py-2"
          />
        </div>
        <button type="submit" className="border border-neutral-900 px-5 py-2 font-medium">
          Sign in
        </button>
      </form>
    </div>
  );
}

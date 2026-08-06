import { requireProfile } from "@/lib/auth-guard";
import { changeOwnPassword } from "../actions";
import { Notice } from "../ui";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  short: "The password must be at least 6 characters.",
  mismatch: "The two passwords do not match.",
  save: "Could not change the password — try again.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const profile = await requireProfile();
  const { saved, error } = await searchParams;
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">My account</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {profile.full_name || profile.email} · role: {profile.role}
      </p>
      {saved && (
        <Notice tone="success">
          Password changed. Use it the next time you sign in.
        </Notice>
      )}
      {error && (
        <Notice tone="error">
          {ERRORS[error] ?? "Something went wrong."}
        </Notice>
      )}
      <h2 className="mt-8 text-xl font-semibold">Change my password</h2>
      <form action={changeOwnPassword} className="mt-3 space-y-3">
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            New password (6+ characters)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full border border-neutral-400 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium">
            Repeat new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full border border-neutral-400 px-3 py-2"
          />
        </div>
        <button type="submit" className="border border-neutral-900 px-4 py-2 font-medium">
          Change password
        </button>
      </form>
    </div>
  );
}

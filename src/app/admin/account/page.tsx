import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { PASSWORD_RULES_TEXT } from "@/lib/password";
import { changeOwnPassword, updateSessionTimeout } from "../actions";
import { NewPasswordFields } from "../PasswordChecklist";
import { Notice } from "../ui";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  weak: `The new password is too weak. ${PASSWORD_RULES_TEXT}`,
  mismatch: "The two new passwords do not match.",
  "wrong-current": "The current password is not correct.",
  timeout: "The timeout must be a whole number between 5 and 480 minutes.",
  save: "Could not save — try again.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; "saved-timeout"?: string; error?: string }>;
}) {
  const profile = await requireProfile();
  const params = await searchParams;
  const { saved, error } = params;
  const canManage = hasPerm(profile, "users.manage");
  const timeoutMinutes = canManage
    ? Number((await (await getData()).settings.get("session_timeout_minutes")) ?? "15") || 15
    : null;
  const inputCls = "mt-1 w-full border border-neutral-400 px-3 py-2";

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">Settings</h1>
      {saved && <Notice tone="success">Password changed. Use it the next time you sign in.</Notice>}
      {params["saved-timeout"] && <Notice tone="success">Session timeout updated.</Notice>}
      {error && <Notice tone="error">{ERRORS[error] ?? "Something went wrong."}</Notice>}

      <section className="mt-6 border border-neutral-300 bg-white p-4">
        <h2 className="text-lg font-semibold">My account</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="w-16 text-neutral-500">Name</dt>
            <dd>{profile.full_name || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 text-neutral-500">Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 text-neutral-500">Role</dt>
            <dd className="capitalize">{profile.role}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 border border-neutral-300 bg-white p-4">
        <h2 className="text-lg font-semibold">Set a new password</h2>
        <form action={changeOwnPassword} className="mt-3 space-y-3">
          <div>
            <label htmlFor="current" className="block text-sm font-medium">
              Current password *
            </label>
            <input
              id="current"
              name="current"
              type="password"
              required
              autoComplete="current-password"
              className={inputCls}
            />
          </div>
          <NewPasswordFields />
          <button type="submit" className="border border-neutral-900 px-4 py-2 font-medium">
            Change password
          </button>
        </form>
      </section>

      {canManage && (
        <section className="mt-4 border border-neutral-300 bg-white p-4">
          <h2 className="text-lg font-semibold">Security</h2>
          <form action={updateSessionTimeout} className="mt-3 space-y-3">
            <div>
              <label htmlFor="minutes" className="block text-sm font-medium">
                Sign out after inactivity (minutes)
              </label>
              <p className="text-xs text-neutral-500">
                Applies to the whole team. Anyone idle in the admin panel for longer is signed
                out and has to log in again. 5–480 minutes.
              </p>
              <input
                id="minutes"
                name="minutes"
                type="number"
                min={5}
                max={480}
                required
                defaultValue={timeoutMinutes ?? 15}
                className="mt-1 w-32 border border-neutral-400 px-3 py-2"
              />
            </div>
            <button type="submit" className="border border-neutral-900 px-4 py-2 font-medium">
              Save
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

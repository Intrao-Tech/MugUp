import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { PASSWORD_RULES_TEXT } from "@/lib/password";
import { changeOwnPassword, updateSessionTimeout } from "../actions";
import { NewPasswordFields } from "../PasswordChecklist";
import { BTN_PRIMARY, CARD, H1, H2, INPUT, Notice } from "../ui";

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
  const inputCls = INPUT;

  return (
    <div className="max-w-md">
      <h1 className={H1}>Settings</h1>
      {profile.must_change_password && !saved && (
        <Notice tone="error">
          Your password is temporary — set your own below to start using the panel. (The
          temporary one stays valid for signing in until you do.)
        </Notice>
      )}
      {saved && <Notice tone="success">Password changed. Use it the next time you sign in.</Notice>}
      {params["saved-timeout"] && <Notice tone="success">Session timeout updated.</Notice>}
      {error && <Notice tone="error">{ERRORS[error] ?? "Something went wrong."}</Notice>}

      <section className={`${CARD} mt-6 p-4`}>
        <h2 className={H2}>My account</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="w-16 text-muted">Name</dt>
            <dd>{profile.full_name || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 text-muted">Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 text-muted">Role</dt>
            <dd className="capitalize">{profile.role}</dd>
          </div>
        </dl>
      </section>

      <section className={`${CARD} mt-4 p-4`}>
        <h2 className={H2}>Set a new password</h2>
        <form action={changeOwnPassword} className="mt-3 space-y-3">
          {/* First-login accounts just typed their temporary password to get
              here — asking for it again is pure friction. */}
          {!profile.must_change_password && (
            <div>
              <label htmlFor="current" className="block text-sm font-bold text-ink">
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
          )}
          <NewPasswordFields />
          <button type="submit" className={BTN_PRIMARY}>
            Change password
          </button>
        </form>
      </section>

      {canManage && (
        <section className={`${CARD} mt-4 p-4`}>
          <h2 className={H2}>Security</h2>
          <form action={updateSessionTimeout} className="mt-3 space-y-3">
            <div>
              <label htmlFor="minutes" className="block text-sm font-bold text-ink">
                Sign out after inactivity (minutes)
              </label>
              <p className="text-xs text-muted">
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
                className={`${INPUT} max-w-32`}
              />
            </div>
            <button type="submit" className={BTN_PRIMARY}>
              Save
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

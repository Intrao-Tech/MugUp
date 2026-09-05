import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { MFA_REQUIRED_SETTING, SESSION_TIMEOUT_SETTING } from "@/lib/admin-session";
import { getData } from "@/lib/data";
import { PASSWORD_RULES_TEXT } from "@/lib/password";
import {
  changeOwnPassword,
  disableTotp,
  updateMfaRequired,
  updateSessionTimeout,
} from "../actions";
import { NewPasswordFields } from "../PasswordChecklist";
import { BTN_PRIMARY, BTN_SECONDARY, CARD, H1, H2, INPUT, Notice } from "../ui";
import { TotpSetup } from "./TotpSetup";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  weak: `The new password is too weak. ${PASSWORD_RULES_TEXT}`,
  mismatch: "The two new passwords do not match.",
  "wrong-current": "The current password is not correct.",
  timeout: "The timeout must be a whole number between 5 and 480 minutes.",
  "mfa-code": "That code is not valid — codes change every 30 seconds, enter the current one.",
  "mfa-required":
    "Two-factor authentication is required for everyone on this team — it cannot be turned off for your account.",
  save: "Could not save — try again.",
};

const GROUP_LABEL = "text-eyebrow uppercase tracking-wide text-muted";
// Cards in one grid row stretch to the same height, so the edges line up.
const GRID = "mt-3 grid gap-4 lg:grid-cols-2";
const CARD_COL = `${CARD} flex flex-col p-5`;

// Layout, on wide screens:
//   Your account   [ Profile            ] [ Password ]
//                  [ Two-factor auth    ] [          ]   (left cell = two stacked cards)
//   Team security  [ Two-factor policy  ] [ Inactivity sign-out ]
// Team security shows only the cards the member may use; a lone card takes
// the full width, so no half-empty rows whatever the permissions are.
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    "saved-timeout"?: string;
    "saved-mfa"?: string;
    error?: string;
    mfa?: string;
  }>;
}) {
  const profile = await requireProfile();
  const params = await searchParams;
  const { saved, error } = params;
  const canManageUsers = hasPerm(profile, "users.manage");
  const canSetPolicy = hasPerm(profile, "security.policy");
  const data = await getData();
  const [mfa, mfaRequiredSetting, timeoutSetting] = await Promise.all([
    data.auth.getMfaState(),
    data.settings.get(MFA_REQUIRED_SETTING),
    canManageUsers ? data.settings.get(SESSION_TIMEOUT_SETTING) : Promise.resolve(null),
  ]);
  const mfaIsRequired = mfaRequiredSetting === "1";
  const timeoutMinutes = Number(timeoutSetting ?? "15") || 15;
  const teamCards = Number(canSetPolicy) + Number(canManageUsers);
  const fullWidthWhenAlone = teamCards === 1 ? "lg:col-span-2" : "";

  return (
    <div>
      <h1 className={H1}>Settings</h1>
      <div className="max-w-2xl">
        {profile.must_change_password && !saved && (
          <Notice tone="error">
            Your password is temporary — set your own below to start using the panel. (The
            temporary one stays valid for signing in until you do.)
          </Notice>
        )}
        {saved && (
          <Notice tone="success">Password changed. Use it the next time you sign in.</Notice>
        )}
        {params["saved-timeout"] && <Notice tone="success">Session timeout updated.</Notice>}
        {params["saved-mfa"] && <Notice tone="success">Two-factor policy updated.</Notice>}
        {params.mfa === "on" && (
          <Notice tone="success">
            Two-factor authentication is on. From now on, signing in also asks for a code from
            your app.
          </Notice>
        )}
        {params.mfa === "off" && (
          <Notice tone="success">Two-factor authentication turned off.</Notice>
        )}
        {mfaIsRequired && !mfa?.factor && (
          <Notice tone="error">
            Your administrator requires two-factor authentication for everyone — set it up below
            to continue using the panel.
          </Notice>
        )}
        {error && <Notice tone="error">{ERRORS[error] ?? "Something went wrong."}</Notice>}
      </div>

      {/* ---------- Your account ---------- */}
      <div className="mt-6">
        <p className={GROUP_LABEL}>Your account</p>
        <div className={GRID}>
          <div className="flex flex-col gap-4">
            <section className={CARD_COL}>
              <h2 className={H2}>Profile</h2>
              <dl className="mt-3 grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
                <dt className="text-muted">Name</dt>
                <dd className="font-semibold text-ink">{profile.full_name || "—"}</dd>
                <dt className="text-muted">Email</dt>
                <dd className="text-ink">{profile.email}</dd>
                <dt className="text-muted">Role</dt>
                <dd className="capitalize text-ink">{profile.role}</dd>
              </dl>
              <p className="mt-3 text-xs text-muted">
                Name, email and role are managed by an administrator in Team.
              </p>
            </section>

            <section className={`${CARD_COL} flex-1`}>
              <h2 className={H2}>Two-factor authentication</h2>
              {mfa?.factor ? (
                <>
                  <p className="mt-2 text-sm text-body">
                    <span className="font-bold text-ink">On</span> since{" "}
                    {new Date(mfa.factor.enrolledAt).toLocaleDateString("en-GB")}. Every sign-in
                    asks for a code from your authenticator app, so a stolen password alone
                    cannot get in.
                  </p>
                  {mfaIsRequired ? (
                    <p className="mt-2 text-xs text-muted">
                      Required for everyone on this team — it cannot be turned off here.
                    </p>
                  ) : (
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer text-primary underline underline-offset-4 hover:text-primary-hover">
                        Turn off…
                      </summary>
                      <form action={disableTotp} className="mt-2 space-y-2">
                        <p className="text-xs text-muted">
                          Enter the current code from your authenticator app — only the person
                          holding the phone can switch this off.
                        </p>
                        <div className="flex flex-wrap items-end gap-2">
                          <div>
                            <label
                              htmlFor="mfa-off-code"
                              className="block text-sm font-bold text-ink"
                            >
                              Code from the app *
                            </label>
                            <input
                              id="mfa-off-code"
                              name="code"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              pattern="[0-9]{6}"
                              maxLength={6}
                              required
                              className={`${INPUT} max-w-40`}
                            />
                          </div>
                          <button type="submit" className={BTN_SECONDARY}>
                            Turn off two-factor
                          </button>
                        </div>
                      </form>
                    </details>
                  )}
                </>
              ) : (
                // "Required for everyone" sends members without a factor here and
                // nowhere else — start the setup for them straight away.
                <TotpSetup autoStart={mfaIsRequired || params.mfa === "setup"} />
              )}
            </section>
          </div>

          <section className={CARD_COL}>
            <h2 className={H2}>Password</h2>
            <p className="mt-1 text-sm text-body">
              Choose a new password for signing in. It takes effect immediately.
            </p>
            <form action={changeOwnPassword} className="mt-4 space-y-3">
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
                    className={INPUT}
                  />
                </div>
              )}
              <NewPasswordFields />
              <button type="submit" className={BTN_PRIMARY}>
                Change password
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* ---------- Team security (managers) ---------- */}
      {teamCards > 0 && (
        <div className="mt-8">
          <p className={GROUP_LABEL}>Team security</p>
          <div className={GRID}>
            {canSetPolicy && (
              <section className={`${CARD_COL} ${fullWidthWhenAlone}`}>
                <h2 className={H2}>Two-factor policy</h2>
                <p className="mt-1 text-sm text-body">
                  <span className="font-bold text-ink">Off:</span> each member decides for
                  themselves whether to use an authenticator app.{" "}
                  <span className="font-bold text-ink">On:</span> everyone must — a member
                  without one is taken to this page at their next visit and can use nothing
                  else until it is set up. Applies straight away, also to people already signed
                  in.
                </p>
                <form action={updateMfaRequired} className="mt-auto space-y-3 pt-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-ink">
                    <input type="checkbox" name="required" defaultChecked={mfaIsRequired} />
                    Require two-factor authentication for everyone
                  </label>
                  <button type="submit" className={BTN_SECONDARY}>
                    Save policy
                  </button>
                </form>
              </section>
            )}

            {canManageUsers && (
              <section className={`${CARD_COL} ${fullWidthWhenAlone}`}>
                <h2 className={H2}>Inactivity sign-out</h2>
                <p className="mt-1 text-sm text-body">
                  Team-wide. Anyone who has not touched the panel for this long is signed out
                  and has to log in again; working in the panel keeps the session alive.
                </p>
                <form
                  action={updateSessionTimeout}
                  className="mt-auto flex flex-wrap items-end gap-3 pt-4"
                >
                  <div>
                    <label htmlFor="minutes" className="block text-sm font-bold text-ink">
                      Minutes (5–480)
                    </label>
                    <input
                      id="minutes"
                      name="minutes"
                      type="number"
                      min={5}
                      max={480}
                      required
                      defaultValue={timeoutMinutes}
                      className={`${INPUT} max-w-32`}
                    />
                  </div>
                  <button type="submit" className={BTN_SECONDARY}>
                    Save
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { signOut, verifyMfaCode } from "../actions";
import { BTN_PRIMARY, H1, INPUT, Notice } from "../ui";

export const dynamic = "force-dynamic";

// Second step of sign-in for members with an authenticator app. The session
// already exists (password accepted) but counts as signed out for every
// page and action until the code is right — see AuthPort.getUserId.
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm">
      <h1 className={H1}>Two-factor check</h1>
      <p className="mt-2 text-sm text-body">
        Open your authenticator app and enter the 6-digit code shown for Mug.Up Admin.
      </p>
      {error && (
        <Notice tone="error">
          {error === "code"
            ? "That code is not valid — codes change every 30 seconds, enter the current one."
            : "Something went wrong — try again."}
        </Notice>
      )}
      <form action={verifyMfaCode} className="mt-6 space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-bold text-ink">
            Code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoFocus
            className={INPUT}
          />
        </div>
        <button type="submit" className={BTN_PRIMARY}>
          Continue
        </button>
      </form>
      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="text-sm text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          Sign out
        </button>
      </form>
      <p className="mt-4 text-xs text-muted">
        Lost your phone? An administrator can reset your two-factor authentication in Team —
        you then sign in with your password and set it up again.
      </p>
    </div>
  );
}

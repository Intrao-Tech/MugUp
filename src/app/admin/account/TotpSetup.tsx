"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { activateTotp, startTotpEnrollment, type TotpEnrolment } from "../actions";
import { BTN_PRIMARY, INPUT, Notice } from "../ui";

// Enrolment of the authenticator app. The QR code and key are handed out
// ONCE by the auth provider, so they live in this component's state — a
// wrong code keeps the same QR on screen (the page re-rendering after the
// action must not start a new enrolment).
export function TotpSetup({ autoStart }: { autoStart: boolean }) {
  const [enrolment, setEnrolment] = useState<TotpEnrolment | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, startTransition] = useTransition();
  const [state, action, pending] = useActionState(activateTotp, null);

  function start() {
    setStartError(null);
    startTransition(async () => {
      const result = await startTotpEnrollment();
      if ("error" in result) setStartError(result.error);
      else setEnrolment(result);
    });
  }

  // "Required for everyone": the member landed here to enrol — skip the button.
  useEffect(() => {
    if (autoStart && !enrolment && !starting && !startError) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [autoStart]);

  if (!enrolment) {
    return (
      <div className="mt-2">
        <p className="text-sm text-body">
          <span className="font-bold text-ink">Off.</span> Recommended: signing in then also asks
          for a 6-digit code from an authenticator app on your phone, so a leaked password alone
          cannot get in.
        </p>
        {startError && <Notice tone="error">{startError}</Notice>}
        <button type="button" onClick={start} disabled={starting} className={`${BTN_PRIMARY} mt-3`}>
          {starting ? "Preparing…" : "Set up authenticator app"}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-4">
      <input type="hidden" name="factor_id" value={enrolment.factorId} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL from the auth provider */}
        <img
          src={enrolment.qrCode}
          alt="QR code for the authenticator app"
          width={176}
          height={176}
          className="shrink-0 rounded-card border border-line bg-surface p-2"
        />
        <div className="min-w-0 space-y-2">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-body">
            <li>
              Install an authenticator app if you do not have one — Google Authenticator,
              Microsoft Authenticator or 1Password all work.
            </li>
            <li>Scan this QR code with the app (or type the key by hand).</li>
            <li>Enter the 6-digit code the app shows to finish.</li>
          </ol>
          <p className="text-xs text-muted">
            Key for manual entry:{" "}
            <code className="select-all break-all font-mono text-ink">{enrolment.secret}</code>
          </p>
        </div>
      </div>
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="totp-code" className="block text-sm font-bold text-ink">
            Code from the app *
          </label>
          <input
            id="totp-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            className={`${INPUT} max-w-40`}
          />
        </div>
        <button type="submit" disabled={pending} className={BTN_PRIMARY}>
          {pending ? "Checking…" : "Turn on two-factor authentication"}
        </button>
      </div>
    </form>
  );
}

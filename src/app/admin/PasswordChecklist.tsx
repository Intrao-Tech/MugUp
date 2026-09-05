"use client";

import { useEffect, useRef, useState } from "react";
import { PASSWORD_MIN_LENGTH, PASSWORD_RULES_TEXT } from "@/lib/password";
import { INPUT } from "./ui";

// Live per-rule feedback while typing a new password. The checklist is
// advisory UI — the server actions re-validate with isStrongPassword().

const RULES: { label: string; test: (password: string) => boolean }[] = [
  {
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  { label: "An uppercase letter (A–Z)", test: (password) => /[A-Z]/.test(password) },
  { label: "A lowercase letter (a–z)", test: (password) => /[a-z]/.test(password) },
  { label: "A number (0–9)", test: (password) => /\d/.test(password) },
];

export function PasswordRuleChecklist({
  password,
  confirm,
}: {
  password: string;
  /** Pass to also show the "passwords match" line. */
  confirm?: string;
}) {
  return (
    <ul className="space-y-0.5 text-sm">
      {RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.label} className={ok ? "text-green-700" : "text-muted"}>
            <span aria-hidden="true" className="mr-1.5 inline-block w-3">{ok ? "✓" : "○"}</span>
            {rule.label}
          </li>
        );
      })}
      {confirm !== undefined && (
        <li
          className={
            confirm && confirm === password ? "text-green-700" : "text-muted"
          }
        >
          <span aria-hidden="true" className="mr-1.5 inline-block w-3">
            {confirm && confirm === password ? "✓" : "○"}
          </span>
          Both passwords match
        </li>
      )}
    </ul>
  );
}

/** New + repeat password inputs (names: password / confirm) with the live
 *  checklist — drop into any server-action form. */
export function NewPasswordFields() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const confirmInput = useRef<HTMLInputElement>(null);
  const inputCls = INPUT;
  // Native constraint validation: the browser refuses to submit and marks the
  // field, so a weak or mismatched password never costs a round trip.
  useEffect(() => {
    confirmInput.current?.setCustomValidity(
      confirm && confirm !== password ? "The two passwords do not match." : "",
    );
  }, [password, confirm]);
  return (
    <>
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-ink">
          New password *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={PASSWORD_MIN_LENGTH}
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
          title={PASSWORD_RULES_TEXT}
          autoComplete="new-password"
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-bold text-ink">
          Repeat new password *
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          ref={confirmInput}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          className={inputCls}
        />
      </div>
      <PasswordRuleChecklist password={password} confirm={confirm} />
    </>
  );
}

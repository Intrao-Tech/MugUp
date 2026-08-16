// One password policy for every place a password is set: self-change
// (Settings), generated temporary passwords and the fallback welcome page.
// The live PasswordRuleChecklist gives instant feedback while typing; the
// server actions re-check with isStrongPassword (the real gate).

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULES_TEXT =
  "At least 8 characters, including an uppercase letter, a lowercase letter and a number.";

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

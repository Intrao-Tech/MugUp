// One password policy for every place a password is set: self-change
// (Settings), admin-issued, temporary-password account creation and the
// invite welcome page. Client `pattern` attributes give instant feedback;
// the server actions re-check with isStrongPassword (the real gate).

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULES_TEXT =
  "At least 8 characters, including an uppercase letter, a lowercase letter and a number.";

/** For <input pattern=…> — HTML anchors it to the whole value. */
export const PASSWORD_PATTERN = "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}";

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

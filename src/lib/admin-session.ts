// Idle-timeout bookkeeping shared by the middleware (edge runtime) and the
// server actions that start a session. Vendor-neutral: only a cookie name
// and the limits the Settings → Security form allows.
//
// How the timeout works: every admin request refreshes a cookie holding the
// last-activity timestamp, and the cookie's OWN lifetime equals the timeout.
// So after a long absence the cookie is simply gone — and a signed-in
// request WITHOUT it is treated as timed out. (A session cookie would vanish
// on browser close and let a days-old Supabase session walk straight back
// in, which is exactly the bug this replaced.)

export const ADMIN_ACTIVITY_COOKIE = "mugup-admin-last-active";

/** admin_settings keys the middleware reads on every admin request. */
export const SESSION_TIMEOUT_SETTING = "session_timeout_minutes";
/** "1" = every member must have an authenticator app (forced enrolment). */
export const MFA_REQUIRED_SETTING = "mfa_required";

/** Bounds of the admin-configurable idle timeout (minutes). */
export const IDLE_TIMEOUT_MIN_MINUTES = 5;
export const IDLE_TIMEOUT_MAX_MINUTES = 480;
export const IDLE_TIMEOUT_DEFAULT_MINUTES = 15;

/** Cookie attributes for the activity stamp; maxAge is the timeout itself. */
export function activityCookieOptions(timeoutMinutes: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: timeoutMinutes * 60,
  };
}

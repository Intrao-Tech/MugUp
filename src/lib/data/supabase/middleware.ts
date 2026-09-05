import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  ADMIN_ACTIVITY_COOKIE,
  activityCookieOptions,
  IDLE_TIMEOUT_DEFAULT_MINUTES,
  IDLE_TIMEOUT_MIN_MINUTES,
  MFA_REQUIRED_SETTING,
  SESSION_TIMEOUT_SETTING,
} from "@/lib/admin-session";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import { readAal } from "./jwt";

/**
 * Edge-compatible session refresh for admin requests. This is the only
 * vendor-specific piece the root middleware touches — an alternative auth
 * backend replaces this one function.
 *
 * Also enforces the idle timeout (see src/lib/admin-session.ts): a signed-in
 * admin whose activity cookie is stale OR missing is signed out and told
 * why. The cookie's lifetime is the timeout itself, so "missing" covers both
 * a long absence and a closed browser. Sign-in stamps the cookie, so a fresh
 * login is never mistaken for a timeout.
 *
 * Reports the second-factor situation too: `mfaPending` = the member has an
 * authenticator app but this session has not passed the code yet (only the
 * verify page may be served); `mfaRequired` + `hasMfa` let the root
 * middleware force enrolment when the administrator demands it for everyone.
 */
export async function refreshAdminSession(
  request: NextRequest,
  { enforceIdle }: { enforceIdle: boolean },
): Promise<{
  response: NextResponse;
  isAuthenticated: boolean;
  timedOut: boolean;
  /** Invited/reset account still on its temporary password. */
  mustChangePassword: boolean;
  mfaPending: boolean;
  mfaRequired: boolean;
  hasMfa: boolean;
}> {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const signedOut = {
    response,
    isAuthenticated: false,
    timedOut: false,
    mustChangePassword: false,
    mfaPending: false,
    mfaRequired: false,
    hasMfa: false,
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return signedOut;

  let timeoutMinutes = IDLE_TIMEOUT_DEFAULT_MINUTES;
  let mfaRequired = false;
  if (enforceIdle) {
    try {
      const { data } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", [SESSION_TIMEOUT_SETTING, MFA_REQUIRED_SETTING]);
      for (const row of (data ?? []) as { key: string; value: string }[]) {
        if (row.key === SESSION_TIMEOUT_SETTING) {
          const configured = Number(row.value);
          if (Number.isFinite(configured) && configured >= IDLE_TIMEOUT_MIN_MINUTES) {
            timeoutMinutes = configured;
          }
        } else if (row.key === MFA_REQUIRED_SETTING) {
          mfaRequired = row.value === "1";
        }
      }
    } catch {
      // unreadable settings -> keep the defaults
    }

    const lastActive = Number(request.cookies.get(ADMIN_ACTIVITY_COOKIE)?.value ?? 0);
    const stale = !lastActive || Date.now() - lastActive > timeoutMinutes * 60_000;
    if (stale) {
      // Revoke only THIS session (scope local) — other devices stay signed in.
      await supabase.auth.signOut({ scope: "local" });
      response.cookies.delete(ADMIN_ACTIVITY_COOKIE);
      return { ...signedOut, response, timedOut: true };
    }
    response.cookies.set(
      ADMIN_ACTIVITY_COOKIE,
      String(Date.now()),
      activityCookieOptions(timeoutMinutes),
    );
  }

  // `user.factors` comes from the auth server on every request (never from
  // the cookie), so a factor enrolled a second ago already counts.
  const hasMfa = (user.factors ?? []).some(
    (factor) => factor.factor_type === "totp" && factor.status === "verified",
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const mfaPending = hasMfa && readAal(session?.access_token) !== "aal2";

  let mustChangePassword = false;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", user.id)
      .maybeSingle();
    mustChangePassword = Boolean(data?.must_change_password);
  } catch {
    // unreadable profile -> no gate
  }

  return {
    response,
    isAuthenticated: true,
    timedOut: false,
    mustChangePassword,
    mfaPending,
    mfaRequired,
    hasMfa,
  };
}

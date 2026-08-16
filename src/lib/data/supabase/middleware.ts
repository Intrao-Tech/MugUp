import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Edge-compatible session refresh for admin requests. This is the only
 * vendor-specific piece the root middleware touches — an alternative auth
 * backend replaces this one function.
 *
 * Also enforces the idle timeout: a signed-in admin inactive for longer than
 * the `session_timeout_minutes` setting (admin panel → Settings → Security,
 * default 15) is signed out and told why. Activity = any admin request.
 */

const IDLE_COOKIE = "mugup-admin-last-active";
const DEFAULT_TIMEOUT_MINUTES = 15;

export async function refreshAdminSession(
  request: NextRequest,
): Promise<{
  response: NextResponse;
  isAuthenticated: boolean;
  timedOut: boolean;
  /** Invited/reset account still on its temporary password. */
  mustChangePassword: boolean;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { response, isAuthenticated: false, timedOut: false, mustChangePassword: false };
  }

  const lastActive = Number(request.cookies.get(IDLE_COOKIE)?.value ?? 0);
  if (lastActive) {
    let timeoutMinutes = DEFAULT_TIMEOUT_MINUTES;
    try {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "session_timeout_minutes")
        .maybeSingle();
      const configured = Number(data?.value);
      if (Number.isFinite(configured) && configured >= 5) timeoutMinutes = configured;
    } catch {
      // unreadable setting -> keep the default
    }
    if (Date.now() - lastActive > timeoutMinutes * 60_000) {
      // Revoke only THIS session (scope local) — other devices stay signed in.
      await supabase.auth.signOut({ scope: "local" });
      response.cookies.delete(IDLE_COOKIE);
      return { response, isAuthenticated: false, timedOut: true, mustChangePassword: false };
    }
  }
  response.cookies.set(IDLE_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

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

  return { response, isAuthenticated: true, timedOut: false, mustChangePassword };
}

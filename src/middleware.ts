import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/data/supabase/config";
import { refreshAdminSession } from "@/lib/data/supabase/middleware";

// Host model — each app answers on exactly one host:
//  * PUBLIC_HOST set: the public site exists ONLY on that host; any other
//    host (except ADMIN_HOST) is a hard 404. Unset: the site answers on any
//    host (needed for Vercel preview URLs).
//  * ADMIN_HOST set: the admin panel exists ONLY on that host (a
//    non-advertised subdomain) and that host serves nothing but the panel.
//    Unset: /admin works on localhost in development; in production the
//    panel is fail-closed (404 everywhere).
//  * ADMIN_IP_ALLOWLIST (optional): extra app-level gate for VPN/office IPs.
//    Real network-level protection (VPN / Cloudflare Access) sits in front.

const ADMIN_PATH = /^\/admin(\/|$)/;

function notFound(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}

function withNoindex(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function ipv4ToInt(ip: string): number | null {
  const match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  if (parts.some((part) => part > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/** Allowlist entries: exact IPv4 or CIDR ("203.0.113.7, 10.8.0.0/24"). */
function ipAllowed(request: NextRequest): boolean {
  const raw = process.env.ADMIN_IP_ALLOWLIST?.trim();
  if (!raw) return true;
  const ip = (
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    request.headers.get("x-real-ip") ??
    ""
  ).trim();
  const ipInt = ipv4ToInt(ip);
  if (ipInt === null) return false; // fail closed when the IP is unknown
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .some((entry) => {
      const [base, prefixStr] = entry.split("/");
      const baseInt = ipv4ToInt(base);
      if (baseInt === null) return false;
      const prefix = prefixStr === undefined ? 32 : Number(prefixStr);
      if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
      const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
      return ((ipInt & mask) >>> 0) === ((baseInt & mask) >>> 0);
    });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = ADMIN_PATH.test(pathname);
  const adminHost = process.env.ADMIN_HOST?.toLowerCase();
  const publicHost = process.env.PUBLIC_HOST?.toLowerCase();
  const host = (request.headers.get("host") ?? "").toLowerCase();

  if (adminHost && host === adminHost) {
    if (!isAdminPath) {
      // The admin host serves nothing but the admin panel.
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else {
    // Everything that is not the admin host is (at most) the public site.
    if (isAdminPath) {
      // Fail closed in prod / when a dedicated admin host is configured.
      if (adminHost || process.env.NODE_ENV === "production") return notFound();
    } else {
      // The public site answers on exactly one host when PUBLIC_HOST is set.
      if (publicHost && host !== publicHost) return notFound();
      return NextResponse.next();
    }
  }

  // Admin request on the right host (or local development) from here on.
  if (!ipAllowed(request)) return notFound();

  if (!isSupabaseConfigured()) {
    return pathname === "/admin/setup"
      ? withNoindex(NextResponse.next())
      : NextResponse.redirect(new URL("/admin/setup", request.url));
  }
  if (pathname === "/admin/setup") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // /admin/welcome completes email invites client-side (tokens arrive in the
  // URL fragment, invisible to the server) — it must stay reachable signed out.
  const openPaths = ["/admin/login", "/admin/welcome"];
  const { response, isAuthenticated, timedOut, mustChangePassword } =
    await refreshAdminSession(request);
  if (timedOut) {
    // The redirect must carry the sign-out cookie deletions, or the login
    // page would still see a session and bounce straight back.
    const redirect = NextResponse.redirect(new URL("/admin/login?error=expired", request.url));
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }
  if (!isAuthenticated && !openPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (isAuthenticated && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  // Temporary-password accounts must set their own password before anything else.
  if (
    isAuthenticated &&
    mustChangePassword &&
    !["/admin/account", ...openPaths].includes(pathname)
  ) {
    return NextResponse.redirect(new URL("/admin/account?must-change=1", request.url));
  }
  return withNoindex(response);
}

export const config = {
  // All page routes (host gating needs to see them); skip static assets.
  matcher: ["/((?!_next/|.*\\..*).*)"],
};

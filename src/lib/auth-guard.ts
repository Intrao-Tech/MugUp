import { redirect } from "next/navigation";
import { getData, isBackendConfigured } from "@/lib/data";
import type { Permission } from "@/lib/permissions";
import type { ProfileRow } from "@/lib/db-types";

/** Signed-in user's profile, or null when signed out / backend unconfigured. */
export async function getCurrentProfile(): Promise<ProfileRow | null> {
  if (!isBackendConfigured()) return null;
  const data = await getData();
  const userId = await data.auth.getUserId();
  if (!userId) return null;
  return data.team.getProfile(userId);
}

/**
 * Page/action guard. The middleware already gates the admin host and
 * anonymous visitors, but every entry point re-checks — never trust the
 * middleware alone.
 */
export async function requireProfile(perm?: Permission): Promise<ProfileRow> {
  if (!isBackendConfigured()) redirect("/admin/setup");
  const data = await getData();
  const userId = await data.auth.getUserId();
  if (!userId) redirect("/admin/login");
  const profile = await data.team.getProfile(userId);
  if (!profile) {
    // A session without a profile row would bounce between middleware and
    // this guard forever — drop the session so the login page is reachable.
    await data.auth.signOut();
    redirect("/admin/login?error=no-profile");
  }
  if (perm && !profile.permissions.includes(perm)) redirect("/admin?denied=1");
  return profile;
}

export function hasPerm(profile: ProfileRow, perm: Permission): boolean {
  return profile.permissions.includes(perm);
}

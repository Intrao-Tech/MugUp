import type { MfaLevel } from "../ports";

/**
 * Assurance level claimed by a Supabase access token: "aal2" once the
 * session has passed the second factor, "aal1" otherwise. Only ever read
 * AFTER the auth server has validated the same token (getUser) — this is a
 * decode, not a verification. Edge-safe (atob, no Node APIs).
 */
export function readAal(accessToken: string | undefined | null): MfaLevel {
  if (!accessToken) return "aal1";
  try {
    const payload = accessToken.split(".")[1] ?? "";
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const claims = JSON.parse(atob(padded)) as { aal?: string };
    return claims.aal === "aal2" ? "aal2" : "aal1";
  } catch {
    return "aal1";
  }
}

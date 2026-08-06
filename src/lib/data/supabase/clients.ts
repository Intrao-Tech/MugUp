import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Request-scoped client for Server Components and Server Actions.
 * Runs with the signed-in user's rights — RLS applies.
 */
export async function createUserClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies; the middleware refreshes
          // sessions, so ignoring here is safe.
        }
      },
    },
  });
}

/**
 * Cookie-less anonymous client for PUBLIC content reads (published posts).
 * Never touches next/headers cookies, so ISR/static pages stay static.
 */
export function createAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Privileged client (bypasses RLS). Used only inside the Supabase backend for
 * operations the anonymous/user clients must never perform directly.
 */
export function createServiceClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error("Supabase service role is not configured");
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Browser-side client, used ONLY by the invite-welcome page to pick up the
// session tokens from the invite link and let the new team member set a
// password. Everything else goes through the server.
let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
  return client;
}

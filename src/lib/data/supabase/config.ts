// Env plumbing only — safe to import from the edge middleware.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const LEAD_FILES_BUCKET = "lead-files";
export const POST_IMAGES_BUCKET = "post-images";

/** Anon-level access: admin sign-in and RLS-scoped reads work. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Service-level access: public form inserts, uploads, account creation. */
export function isSupabaseServiceConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

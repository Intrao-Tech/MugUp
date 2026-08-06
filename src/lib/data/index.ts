// Backend registry — the single place that knows which vendor is active.
// Select with DATA_BACKEND (default "supabase"). Adding a backend:
//   1. implement DataBackend (see ports.ts) in src/lib/data/<name>/backend.ts
//   2. add a case below and to the two capability checks
// Nothing outside src/lib/data imports a vendor SDK.

import type { DataBackend } from "./ports";
import { createSupabaseBackend } from "./supabase/backend";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "./supabase/config";

export type { DataBackend } from "./ports";

const BACKEND = (process.env.DATA_BACKEND ?? "supabase").toLowerCase();

/** Request-scoped backend — call inside Server Components / Server Actions. */
export async function getData(): Promise<DataBackend> {
  switch (BACKEND) {
    case "supabase":
      return createSupabaseBackend();
    default:
      throw new Error(
        `Unknown DATA_BACKEND "${BACKEND}". Implement src/lib/data/${BACKEND}/backend.ts ` +
          "against src/lib/data/ports.ts and register it in src/lib/data/index.ts.",
      );
  }
}

/** Admin panel usable (auth + RLS-scoped reads). */
export function isBackendConfigured(): boolean {
  switch (BACKEND) {
    case "supabase":
      return isSupabaseConfigured();
    default:
      return false;
  }
}

/** Public forms can accept submissions (privileged writes available). */
export function canAcceptSubmissions(): boolean {
  switch (BACKEND) {
    case "supabase":
      return isSupabaseServiceConfigured();
    default:
      return false;
  }
}

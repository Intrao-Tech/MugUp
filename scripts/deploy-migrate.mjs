// One-switch schema migrations during a deployment build.
//
//   SUPABASE_DB_URL      Postgres connection string of this deployment's
//                        database (Supabase dashboard → Connect → Session
//                        pooler URI with the password filled in, special
//                        characters percent-encoded). Mark it Sensitive.
//   (absent)             do nothing — the normal state until it is set
//
// With the variable present, a PRODUCTION build (VERCEL_ENV=production — or
// MIGRATE_ON_DEPLOY=true to force it elsewhere) applies the pending files
// from supabase/migrations via `supabase db push` before `next build`.
// Preview builds never touch the database.
//
// Unlike seeding (deploy-seed.mjs), a migration failure FAILS the build on
// purpose: new code must not go live against an old schema, and a failed
// build keeps the previous deployment serving.
//
// First-time caveat: `db push` relies on the migration history table. If the
// database was originally set up by pasting SQL into the dashboard editor,
// mark those files as applied once:
//   npx supabase migration list --db-url "$SUPABASE_DB_URL"
//   npx supabase migration repair --status applied <versions…> --db-url "…"
import { spawnSync } from "node:child_process";

const log = (line) => console.log(`[deploy-migrate] ${line}`);

const dbUrl = (process.env.SUPABASE_DB_URL ?? "").trim();
if (!dbUrl) {
  process.exit(0);
}

const forced = ["1", "true", "yes", "on"].includes(
  (process.env.MIGRATE_ON_DEPLOY ?? "").trim().toLowerCase(),
);
if (process.env.VERCEL_ENV !== "production" && !forced) {
  log("not a production build — skipping migrations.");
  process.exit(0);
}

log("applying pending supabase/migrations to this deployment's database…");
// npx --no-install pins the run to the supabase devDependency — also outside
// npm scripts, where node_modules/.bin is not on PATH.
const result = spawnSync("npx", ["--no-install", "supabase", "db", "push", "--db-url", dbUrl, "--yes"], {
  stdio: "inherit",
  // Windows resolves npx to npx.cmd, which node can only spawn through a
  // shell; Vercel (Linux) execs it directly.
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  log("MIGRATION FAILED — failing the build so the old deployment keeps serving.");
  process.exit(result.status ?? 1);
}
log("database schema is up to date.");

// One-switch seeding during a deployment build.
//
//   SEED_ON_DEPLOY=true    seed this deployment's database, then turn it off
//   (absent / false)       do nothing — the normal state
//
// Everything else is optional and has a default, so the flag alone is enough:
//   SEED_ADMIN_EMAIL     administrator login   (default: LEADS_NOTIFY_EMAIL,
//                                               else admin@mugupstudio.com)
//   SEED_ADMIN_PASSWORD  its password          (default: generated and PRINTED
//                                               in the build log — change it
//                                               in the panel afterwards)
//   SEED_ADMIN_NAME      display name          (default: "Administrator")
//   SEED_DEMO_DATA=0     administrator only, no demo enquiries/reviews/posts
//
// Runs before `next build` (see package.json). It never fails the build: a
// seeding problem is logged and the build carries on, because a broken seed
// must not take the site down. Seeding is idempotent — accounts get their
// access refreshed, demo rows go in only while the tables are still empty.
import { randomBytes } from "node:crypto";

const flag = (process.env.SEED_ON_DEPLOY ?? "").trim().toLowerCase();
if (!["1", "true", "yes", "on"].includes(flag)) {
  process.exit(0);
}

const log = (line) => console.log(`[deploy-seed] ${line}`);
log("SEED_ON_DEPLOY is on — seeding this deployment's database…");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  log("Supabase env vars are missing — nothing to seed, skipping.");
  process.exit(0);
}

/** Readable password that always satisfies the panel's policy. */
function generatePassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  for (;;) {
    const candidate = [...randomBytes(14)].map((b) => alphabet[b % alphabet.length]).join("");
    if (/[a-z]/.test(candidate) && /[A-Z]/.test(candidate) && /\d/.test(candidate)) {
      return candidate;
    }
  }
}

// Defaults, so a single flag is genuinely enough.
process.env.SEED_ALLOW_REMOTE = "1";
process.env.SEED_ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL?.trim() ||
  process.env.LEADS_NOTIFY_EMAIL?.trim() ||
  "admin@mugupstudio.com";
const generated = !process.env.SEED_ADMIN_PASSWORD;
if (generated) process.env.SEED_ADMIN_PASSWORD = generatePassword();

try {
  await import("./dev-seed.mjs");
  log("");
  log("=== SIGN IN TO THE ADMIN PANEL ===");
  log(`  login:    ${process.env.SEED_ADMIN_EMAIL}`);
  log(
    generated
      ? `  password: ${process.env.SEED_ADMIN_PASSWORD}   (generated — change it in Settings)`
      : "  password: the one you set in SEED_ADMIN_PASSWORD",
  );
  log("Remove SEED_ON_DEPLOY now so later builds stop seeding.");
} catch (error) {
  log(`failed (the build continues): ${error?.message ?? error}`);
}

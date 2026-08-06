// Verifies the permission model end-to-end against the local stack:
// signs in as each seeded role and asserts what RLS lets it see/do.
// Run with: node --env-file=.env.local scripts/dev-verify.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error("Missing Supabase env (.env.local).");
  process.exit(1);
}

const PASSWORD = "admin123";
let failures = 0;

function check(label, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failures += 1;
}

async function asUser(email, fn) {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) {
    check(`${email}: sign-in`, false);
    return;
  }
  check(`${email}: sign-in`, true);
  await fn(client);
  await client.auth.signOut();
}

// Anonymous: no table is readable or writable.
{
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: leads } = await anon.from("leads").select("id");
  check("anonymous: leads invisible", (leads ?? []).length === 0);
  const { error: insertError } = await anon
    .from("leads")
    .insert({ form: "contact", locale: "en", full_name: "x", email: "x@x.x" });
  check("anonymous: leads insert rejected", Boolean(insertError));
}

await asUser("admin@mugup.local", async (db) => {
  const { data: leads } = await db.from("leads").select("id");
  check("admin: sees leads", (leads ?? []).length >= 3);
  const { data: profiles } = await db.from("profiles").select("id");
  check("admin: sees all profiles", (profiles ?? []).length >= 3);
  const { data: posts } = await db.from("posts").select("id");
  check("admin: sees posts", (posts ?? []).length >= 1);
});

await asUser("manager@mugup.local", async (db) => {
  const { data: leads } = await db.from("leads").select("id, status");
  check("manager: sees leads", (leads ?? []).length >= 3);
  if (leads?.length) {
    const { error } = await db.from("leads").update({ status: "contacted" }).eq("id", leads[0].id);
    check("manager: can update lead status", !error);
  }
  const { data: posts } = await db.from("posts").select("id");
  check("manager: posts invisible", (posts ?? []).length === 0);
  const { data: profiles } = await db.from("profiles").select("id");
  check("manager: sees only own profile", (profiles ?? []).length === 1);
});

await asUser("editor@mugup.local", async (db) => {
  const { data: leads } = await db.from("leads").select("id");
  check("editor: leads invisible (GDPR)", (leads ?? []).length === 0);
  const { data: reviews } = await db.from("reviews").select("id, status");
  check("editor: sees reviews", (reviews ?? []).length >= 1);
  const { data: posts } = await db.from("posts").select("id");
  check("editor: sees posts", (posts ?? []).length >= 1);
  if (posts?.length) {
    const { error } = await db
      .from("posts")
      .update({ description: "edited by editor in verify script" })
      .eq("id", posts[0].id);
    check("editor: can edit post", !error);
  }
});

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);

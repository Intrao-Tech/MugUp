// Applies pending SQL migrations at deploy time.
//
// Runs at the start of `npm run build` (see package.json) and does nothing
// unless SUPABASE_DB_URL is set in the environment — locally the Supabase CLI
// already handles migrations, so this is a hosting-only concern. Get the
// value from the Supabase dashboard: Connect -> Direct connection.
//
// Applied versions are recorded in supabase_migrations.schema_migrations —
// the very table the Supabase CLI uses — so `supabase db push` and this
// runner stay interchangeable and nothing is ever applied twice.
//
// Failures DO fail the build: deploying an app against a schema it does not
// have is worse than not deploying at all.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.SUPABASE_DB_URL?.trim();
if (!url) process.exit(0);

const log = (line) => console.log(`[deploy-migrate] ${line}`);
const dir = path.join(process.cwd(), "supabase", "migrations");

const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
if (!files.length) {
  log("no migration files found — nothing to do.");
  process.exit(0);
}

// Hosted Supabase requires SSL (its certificate chain is its own, so chain
// verification is off, same as the CLI does for --db-url); the local Docker
// Postgres speaks plaintext only.
const local = /(localhost|127\.0\.0\.1)/.test(url);
const client = new pg.Client({
  connectionString: url,
  ssl: local ? false : { rejectUnauthorized: false },
});
await client.connect();

try {
  await client.query("create schema if not exists supabase_migrations");
  await client.query(
    "create table if not exists supabase_migrations.schema_migrations (version text primary key, name text, statements text[])",
  );
  const { rows } = await client.query("select version from supabase_migrations.schema_migrations");
  const applied = new Set(rows.map((row) => row.version));

  let count = 0;
  for (const file of files) {
    // 0001_init.sql -> version "0001", name "init"
    const [version, ...rest] = file.replace(/\.sql$/, "").split("_");
    if (applied.has(version)) continue;
    const sql = await readFile(path.join(dir, file), "utf8");
    log(`applying ${file}`);
    // One transaction per migration: a failure leaves no half-applied schema.
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into supabase_migrations.schema_migrations (version, name, statements) values ($1, $2, $3)",
        [version, rest.join("_"), [sql]],
      );
      await client.query("commit");
      count += 1;
    } catch (error) {
      await client.query("rollback");
      throw new Error(`${file}: ${error.message}`);
    }
  }
  log(count ? `applied ${count} migration(s).` : "database already up to date.");
} finally {
  await client.end();
}

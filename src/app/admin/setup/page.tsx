// Shown (via middleware rewrite) whenever Supabase env vars are missing.
export default function SetupPage() {
  return (
    <div className="prose max-w-2xl">
      <h1 className="text-2xl font-bold">Admin setup required</h1>
      <p className="mt-4 text-neutral-700">
        The admin panel needs a Supabase project. Once configured, this page
        disappears automatically.
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-neutral-700">
        <li>
          Create a Supabase project (region: <strong>London, eu-west-2</strong>).
        </li>
        <li>
          Run <code>supabase/migrations/0001_init.sql</code> in the SQL editor.
        </li>
        <li>
          Copy <code>.env.example</code> to <code>.env.local</code> and fill in the URL,
          anon key and service-role key (Settings → API).
        </li>
        <li>
          Create the first user (Authentication → Add user, auto-confirm) and promote it
          with <code>supabase/seed_admin.sql</code>.
        </li>
        <li>Restart the dev server and open /admin again.</li>
      </ol>
    </div>
  );
}

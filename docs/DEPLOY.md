# Deploying MugUp to Vercel

Three stages, each independently safe to stop at:

1. **Stage A — content-only preview.** Public site live on a `*.vercel.app`
   URL. No database. Forms disabled, admin 404s. ← *do this first*
2. **Stage B — production domain.** `mugupstudio.com` attached, hosts locked
   down, admin panel reachable on its hidden subdomain.
3. **Stage C — backend.** Supabase project wired up: forms, reviews,
   database-driven Insights, admin panel.

Stage A needs **zero environment variables**. This is by design — every data
entry point is guarded (`isBackendConfigured()` / `canAcceptSubmissions()` in
`src/lib/data`), Insights falls back to the static content in `src/content`,
and the admin panel is fail-closed. Verified: `npm run build` succeeds with no
`.env.local` present.

---

## Stage A — content-only preview

### 1. Import the repository

Vercel dashboard → **Add New → Project** → import `Intrao-Tech/MugUp`.

### 2. Project settings

Everything is auto-detected; do not override:

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Build Command | `npm run build` (default) |
| Install Command | `npm install` (default) |
| Output Directory | default — do **not** set one |
| Root Directory | `./` |
| Node.js Version | 22.x (matches local `v22.17.1`) |

### 3. Environment variables

**None.** Leave the section empty and deploy.

Specifically, do *not* set these yet:

- `PUBLIC_HOST` — setting it makes the `*.vercel.app` URL a **hard 404**
  (`src/middleware.ts`); the whole point of Stage A is that preview URL.
- `ADMIN_HOST` — leave unset so `/admin` stays fail-closed in production.
- `DATA_BACKEND` — defaults to `supabase` in code; only set it if a second
  backend is ever implemented.

### 4. Deploy, then verify

- `/` → 308-redirects to `/en`
- `/en` and `/ua` render, and the language switcher preserves the path
- `/en/insights` lists the static fallback posts
- `/en/contact`, `/en/book-assessment`, `/en/review` render with forms shown
  as **disabled** (expected — no `SUPABASE_SERVICE_ROLE_KEY`)
- `/robots.txt` and `/sitemap.xml` resolve
- `/admin` returns **404** (fail-closed — correct)
- `/en/nonsense` returns a real 404, not a soft one

> Note: `robots.txt` and `sitemap.xml` advertise
> `https://mugupstudio.com` — `SITE_URL` in `src/lib/site.ts` is a hardcoded
> constant, not an env var. On the preview URL those absolute links point at
> the not-yet-live production domain. Harmless for review; resolved by Stage B.
> Don't submit the preview URL to Search Console.

---

## Stage B — production domain

1. Vercel → Project → **Settings → Domains**, add:
   - `mugupstudio.com` (and `www.mugupstudio.com` redirecting to it)
   - a **non-advertised** admin subdomain, e.g. `ops-x7k2.mugupstudio.com` —
     pick a random-ish label, it is never linked from anywhere
2. Point DNS at Vercel and wait for certificates to issue.
3. **Only after the domains are verified and serving**, add:

   ```
   PUBLIC_HOST=mugupstudio.com
   ADMIN_HOST=ops-x7k2.mugupstudio.com
   ```

   Setting these before DNS resolves makes the whole deployment 404.
4. Redeploy (env changes need a fresh build).
5. Optional defence-in-depth — `ADMIN_IP_ALLOWLIST=203.0.113.7,10.8.0.0/24`
   (IPv4/CIDR, comma-separated). Unlisted IPs get a 404 *before* auth. For a
   real VPN-only gate put Cloudflare Access in front of the admin subdomain;
   the app-level allowlist is not a VPN replacement.

**Trade-off to accept:** with `PUBLIC_HOST` set, `*.vercel.app` preview
deployments 404. That is the intended fail-closed behaviour. If you want
working previews, use a Vercel *Preview*-scoped env set that omits
`PUBLIC_HOST`, and set it on Production only.

---

## Stage C — Supabase backend

1. Create the client-owned Supabase project (**London / eu-west-2**).
2. Apply the schema: `supabase/migrations/0001_init.sql`, via the dashboard
   SQL editor or `supabase db push`. This creates the tables, the `has_perm()`
   function, every RLS policy **and both storage buckets** (`lead-files`,
   `post-images`) — no manual bucket creation needed.
3. Add to Vercel (Settings → API in Supabase):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...        # server-only, never expose
   ```

   Mark `SUPABASE_SERVICE_ROLE_KEY` as **Sensitive**. It must never appear in
   a `NEXT_PUBLIC_*` variable.
4. First administrator: Supabase → Authentication → **Add user** (tick *Auto
   confirm user*), then edit the email in `supabase/seed_admin.sql` and run it
   against the project to grant the permission flags.
5. Email (invites + notifications): follow `docs/EMAIL-SETUP.md` — Resend
   API key + verified domain for enquiry/review notifications (recipients are
   then configured on the admin **Notifications** page), and Supabase custom
   SMTP + the `/admin/welcome` redirect URL for team invites. Without the
   key, submissions still save — only the email step is skipped.
7. Redeploy and verify: forms accept submissions, `/admin` on the admin host
   reaches the login page, Insights posts published from admin appear on the
   public site (ISR + `revalidatePath`).

---

## Client-test deployment (no production domain yet)

To let the client exercise the *whole* product — working forms and a working
admin panel — on `*.vercel.app`, before the real domain exists.

**Do not wait for the client's production Supabase project.** Use a free
throwaway project; at go-live you swap three env vars and point at their
London one. Test data is disposable.

### Admin needs its own hostname

`ADMIN_HOST` serves nothing but the panel: if you point it at the public
`*.vercel.app` URL, middleware redirects the entire public site into `/admin`.
So claim a second `*.vercel.app` name on the **same project** (Settings →
Domains) — e.g. `mug-up-admin.vercel.app`.

### Env vars for the test deploy

```
ADMIN_HOST=mug-up-admin.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-TEST-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...          # mark Sensitive
```

Leave **`PUBLIC_HOST` unset** (otherwise the public `*.vercel.app` URL 404s)
and **`ADMIN_IP_ALLOWLIST` unset** (otherwise the client gets a 404 instead of
a login page).

### Then

Apply the migration, add the first admin user (Stage C steps 2 and 4 above),
redeploy, and verify:

- `mug-up.vercel.app/en` → public site, forms now **enabled**
- `mug-up-admin.vercel.app` → redirects to `/admin`, shows the login page
- `mug-up.vercel.app/admin` → still **404** (admin is not on the public host)

> The test URL is indexable — it is a production deployment, so Vercel's
> automatic preview-noindex does not apply, and `robots.txt` allows all.
> Canonicals point at `mugupstudio.com`, which limits the damage, but do not
> leave it crawlable for months. Stage B resolves it permanently.


---

## Still outstanding (not deploy blockers)

From `docs/SPEC.md` §11 — known gaps, none of which prevent going live:
GA4 + Search Console + cookie consent banner · Cloudflare Turnstile (honeypot
only today) · founder video & photo · LinkedIn/YouTube/Eventbrite footer URLs ·
client review of the UA copy · final legal texts for `/privacy-policy` and
`/terms`.

The cookie banner in particular should land before any analytics script does —
GA4 without consent is a GDPR problem for a UK-facing site.

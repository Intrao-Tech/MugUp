# Mug.Up Language Studio — mugupstudio.com

Next.js site for Mug.Up Language Studio (Intrao Tech). Scope per Schedule 2 to
Agreement No. INTRAO-MUGUP-2026-07 (`docs/requirements/`).

Documentation: `docs/SPEC.md` (full as-built spec) · `docs/HANDOFF-DESIGN.md`
(for the design developer) · `docs/SEO-REQUIREMENTS.md` (SEO invariants) ·
`CLAUDE.md` (AI-assistant onboarding).

**Current stage: structure skeleton.** Full page structure, navigation, bilingual
content and technical SEO are in place; visual design is intentionally absent —
it is applied later by the design developer on top of the existing components.

## Stack

- Next.js 15 (App Router, TypeScript, static generation), Tailwind CSS v4
- Content = typed data modules in `src/content` rendered by shared components
- Supabase (Postgres + Auth + Storage) — leads database, file uploads, admin panel

## Run (public site only)

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all public pages SSG)
npm run typecheck
```

Without Supabase env vars the site runs fully; the two forms render with submit
disabled and `/admin` shows a setup page.

## Run (local full stack — Docker)

The fastest way to develop and test everything, no cloud account needed:

```bash
npm run db:start   # local Supabase in Docker: applies supabase/migrations,
                   # prints API URL + anon/service keys, Studio on :54323
npm run seed:dev   # test accounts + demo data (local stack only, guarded)
npm run dev        # site on :3000, admin on /admin
```

Copy the keys `db:start` prints into `.env.local` (see `.env.example`) before
seeding. Test accounts: `admin@` / `manager@` / `editor@mugup.local`, password
`admin123`. `npm run db:reset` wipes the DB and re-applies migrations;
`npm run db:stop` stops the containers.

## Run (hosted Supabase)

1. **Supabase project** — create one at supabase.com (region **London,
   eu-west-2**; production project lives on the client's account, use your own
   free project for development).
2. **Schema** — open the project's SQL editor and run the whole of
   `supabase/migrations/0001_init.sql` (tables, RLS, triggers, storage bucket).
3. **Env vars** — copy `.env.example` to `.env.local`, fill in Project URL +
   anon key + service-role key (dashboard → Settings → API). The service-role
   key is server-only: never commit it, never expose it to the browser.
4. **First admin** — dashboard → Authentication → Add user (email + password,
   tick *Auto confirm*), then edit your email into `supabase/seed_admin.sql`
   and run it in the SQL editor.
5. `npm run dev` → `http://localhost:3000/admin` → sign in.

## Admin panel

English UI, never indexed (`X-Robots-Tag` + metadata; deliberately NOT listed
in robots.txt). Modules: dashboard, Enquiries (status/form filter chips with
counts, search by name/email, newest/oldest sort, internal notes, attached
files via short-lived signed URLs), Reviews (add + moderate before anything
can be published), Insights posts (Markdown editor, draft/publish/unpublish/
delete with confirmation, status+language filters, "view on site" links; the
public site updates within seconds via revalidation), Team.

**Where it lives — not on the public site.** Access is controlled by env vars:

- `ADMIN_HOST` — the only host that serves the panel (use a non-advertised
  subdomain, e.g. `ops-x7k2.mugupstudio.com`, added as a domain alias of the
  same deployment). On every other host `/admin*` is a hard 404, and the
  admin host serves nothing but the panel.
- Unset `ADMIN_HOST`: `/admin` works only in local development; in production
  the panel is **fail-closed** (404 everywhere).
- `ADMIN_IP_ALLOWLIST` (optional) — IPv4/CIDR list (VPN egress, office IPs);
  anyone else gets a 404 before authentication is even attempted.
- For full VPN-only access put a network gate (Cloudflare Access / Zero Trust
  or the hosting provider's firewall) in front of the admin host — the
  app-level allowlist is defence-in-depth, not a VPN replacement.

**Access model:** a *role* (`admin` / `manager` / `editor`) is just a preset;
enforcement uses per-account permission flags, editable per user in Team:
`leads.view`, `leads.manage`, `files.view`, `reviews.moderate`, `posts.edit`,
`posts.publish`, `users.manage`. Editor deliberately has no access to leads
(personal data, GDPR minimisation); Manager has no publishing rights.

**Security layers:** middleware redirect for anonymous visitors → every page
and server action re-checks the permission flag → Postgres RLS enforces the
same flags again (`has_perm()`), so even a bug in the UI cannot leak data.
Public form inserts go through the service role; the tables have no anonymous
policies at all. Accounts are created only by an administrator (no
self-registration); an account cannot remove `users.manage` from itself.

## Portability (ports & adapters)

Pages, actions and guards never import a vendor SDK — they talk to the
interfaces in `src/lib/data/ports.ts` (`AuthPort`, `TeamPort`, `LeadsPort`,
`ReviewsPort`, `PostsPort`, `FileStoragePort`) through `getData()` from
`src/lib/data`. The active backend is chosen by the `DATA_BACKEND` env var.

Migrating off Supabase = implement `DataBackend` once and flip one env var:

1. `src/lib/data/<name>/backend.ts` — implement the six ports (any Postgres
   driver, any S3-compatible storage, any auth provider);
2. swap `refreshAdminSession` (`src/lib/data/<name>/middleware.ts`) — the one
   vendor-specific call the root middleware makes;
3. register the backend in `src/lib/data/index.ts`, set `DATA_BACKEND=<name>`.

The SQL schema is plain Postgres (RLS included) and the permission model is an
ordinary table — both survive any migration unchanged. The DTO shapes every
backend must return live in `src/lib/db-types.ts`.

## Languages

- `/en/...` — English (primary market, x-default), `/ua/...` — Ukrainian (hreflang `uk`)
- `/` permanently redirects to `/en`
- **The Ukrainian copy is a draft translation** produced from the client's English
  materials — it must be reviewed/approved by the client before launch.
- The existing Ukrainian-language school site stays at mugup.com.ua (linked from
  the Global Integration page and the footer "Languages" link).

## Structure

```
/en                                          Home (hero, choose path, results,
/ua                                          how it works, for parents, why,
                                             team, insights preview, CTA)
/{locale}/about                              Mission, methodology, founder story
                                             (+video placeholder), team, standards
/{locale}/pathways/british-education         Hub: educational journey + 11 cards
/{locale}/pathways/british-education/<slug>  11 programme pages (single template:
                                             hero, at-a-glance, sections, CTA)
/{locale}/pathways/global-integration        Stage 1: hero landing only
/{locale}/insights                           Listing, 5 fixed categories —
                                             database-driven (admin-managed)
/{locale}/insights/<slug>                    Article page (Markdown from DB;
                                             ISR + instant revalidation on
                                             publish/unpublish/delete)
/{locale}/book-assessment                    Content + booking form + FAQ
/{locale}/contact                            Contact details + enquiry form
/{locale}/privacy-policy, /{locale}/terms    Noindexed stubs pending legal text
```

## SEO

Hard requirements live in `docs/SEO-REQUIREMENTS.md` and are implemented:
SSG everywhere, unique title/description per page+locale, self-canonicals,
hreflang pairs (en/uk + x-default), real HTTP 404s (unknown locale, unknown
path, unknown slug), human-readable slugs, one H1 per page, JSON-LD
(EducationalOrganization sitewide, Service on programmes, FAQPage on booking,
Article on posts, BreadcrumbList), `sitemap.xml` + `robots.txt`, own-domain
`og:image`.

## Conventions

- **Images:** only client-provided assets (team photos, logos in `public/images`);
  everything else uses the grey-X `ImagePlaceholder`. No AI-generated imagery.
- **Content editing:** text lives in `src/content/{en,ua}/...`, never in components.
  Section `id`s and hrefs are identical across locales; hrefs are locale-relative
  (`/book-assessment`), prefixed at render time.
- **Forms** submit through a server action (honeypot anti-spam, validation,
  10 MB file limit, pdf/doc/docx/jpg/png) into the `leads` table + private
  storage bucket; with no env vars they degrade to disabled.

## Not in this stage

GA4 + cookie banner, Cloudflare Turnstile (honeypot only for now), founder
video embed and founder photo (awaiting client materials), LinkedIn/YouTube/
Eventbrite footer links (awaiting exact URLs), Stage 2 Global Integration
sub-pages, legal texts.

Email notifications for new enquiries ARE wired (Resend) — set
`RESEND_API_KEY` + `LEADS_NOTIFY_EMAIL` to enable; without them submissions
simply skip the email step.

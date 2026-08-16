# Mug.Up Language Studio — mugupstudio.com

Next.js site for Mug.Up Language Studio (Intrao Tech). Scope per Schedule 2 to
Agreement No. INTRAO-MUGUP-2026-07 (`docs/requirements/`).

Documentation: `docs/SPEC.md` (full as-built spec) · `docs/HANDOFF-DESIGN.md`
(for the design developer) · `docs/SEO-REQUIREMENTS.md` (SEO invariants) ·
`docs/EMAIL-SETUP.md` (outgoing email) · `docs/DEPLOY.md` (production) ·
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
npm run dev        # site on http://localhost:3000,
                   # admin on http://admin.localhost:3000 (host split via env)
```

Copy the keys `db:start` prints into `.env.local` (see `.env.example`) before
seeding. Test accounts: `admin@` / `manager@` / `editor@mugup.local`, password
`admin123`. `npm run db:reset` wipes the DB and re-applies migrations;
`npx supabase migration up` applies only NEW migrations without wiping data;
`npm run db:stop` stops the containers.

Emails (invites, password resets, enquiry copies): work out of the box into
Mailpit (http://localhost:54324, nothing leaves the machine); to send REAL
email from the local machine set the SMTP vars — see `docs/EMAIL-SETUP.md`.

## Run (hosted Supabase)

1. **Supabase project** — create one at supabase.com (region **London,
   eu-west-2**; production project lives on the client's account, use your own
   free project for development).
2. **Schema** — apply every file in `supabase/migrations/` in order (0001 →
   0006): either `npx supabase db push` with the project linked, or paste each
   file into the SQL editor (tables, RLS, triggers, storage buckets).
3. **Env vars** — copy `.env.example` to `.env.local`, fill in Project URL +
   anon key + service-role key (dashboard → Settings → API). The service-role
   key is server-only: never commit it, never expose it to the browser.
4. **First admin** — dashboard → Authentication → Add user (email + password,
   tick *Auto confirm*), then edit your email into `supabase/seed_admin.sql`
   and run it in the SQL editor.
5. `npm run dev` → `http://localhost:3000/admin` → sign in.

## Admin panel

English UI, never indexed (`X-Robots-Tag` + metadata; deliberately NOT listed
in robots.txt). Modules: dashboard (This Month, areas, top sources, needs
attention), Enquiries (full CRM: 9-status pipeline with Lost reasons, owner /
next action / due date, filter chips with counts, search, CSV export, PII
masking, internal notes, attached files via short-lived signed URLs), Reviews
(moderation queue + managed "All reviews" list: edit details, feature for the
homepage, delete; manual Google-review import), Insights posts (layout block
builder: drag & drop, per-block width/alignment, side-by-side columns,
buttons, captions, live preview; draft/publish/schedule/unpublish/delete —
the public site updates within seconds via revalidation), Team (invite by
email, one-click password reset email, member deletion, custom roles),
Notifications (in-admin feed with per-member event subscriptions),
Activity log (date filters + stats), Settings (change own password with the
current password required; idle session timeout, default 15 min).

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

**Access model:** a *role* is just a preset (built-in `admin` / `manager` /
`editor` + admin-defined custom roles); enforcement uses per-account
permission flags, editable per user in Team: `leads.view`, `leads.manage`,
`leads.export`, `leads.pii`, `posts.edit`, `posts.publish`,
`reviews.moderate`, `analytics.view`, `users.manage`. Editor deliberately has
no access to leads (personal data, GDPR minimisation); learner PII
(`leads.pii`) is a separate flag from working the pipeline.

**Security layers:** middleware redirect for anonymous visitors → every page
and server action re-checks the permission flag → Postgres RLS enforces the
same flags again (`has_perm()`), so even a bug in the UI cannot leak data.
Public form inserts go through the service role; the tables have no anonymous
policies at all. Accounts are created only by an administrator (no
self-registration); an account cannot remove `users.manage` from itself.

## Portability (ports & adapters)

Pages, actions and guards never import a vendor SDK — they talk to the
interfaces in `src/lib/data/ports.ts` (`AuthPort`, `TeamPort`, `LeadsPort`,
`ReviewsPort`, `PostsPort`, `FileStoragePort`, `ActivityPort`,
`NotificationsPort`, `SettingsPort`) through `getData()` from `src/lib/data`.
The active backend is chosen by the `DATA_BACKEND` env var.

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
/{locale}/courses                            Full courses & programmes catalogue
/{locale}/pathways/global-integration        Goal-first landing (Live/Work/Grow/
                                             Study/Connect) + 6 language pages
/{locale}/pathways/global-integration/qualifications
                                             Intl. language qualifications hub
                                             (+ IELTS/Cambridge/SELT pages, 301s
                                             from the old BE URLs)
/{locale}/pathways/global-integration/boarding-schools
                                             British Boarding Schools page
/{locale}/insights                           Listing, categories admin-managed
/{locale}/insights/<slug>                    Article page (layout blocks or
                                             Markdown from DB; ISR + instant
                                             revalidation on publish/unpublish)
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

Notifications for new enquiries/reviews/posts ARE wired: they land in the
admin panel's Notifications section with no setup at all. Outgoing email
(team invites, password resets, optional email copies of enquiries) goes
through one configurable channel — SMTP or Resend, sender set once via
`MAIL_FROM` — see `docs/EMAIL-SETUP.md`.

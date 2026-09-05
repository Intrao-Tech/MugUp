# MugUp — Technical Specification (as built)

Project: mugupstudio.com for Mug.Up Language Studio (Bedford, UK), built by
Intrao Tech. Contract scope: Schedule 2 to Agreement No. INTRAO-MUGUP-2026-07
(`docs/requirements/MugUp_Technical_Specification_TZ.pdf`). This document
describes what exists in the repository and how it fits together — written to
onboard the next developer (human or AI) without access to this chat history.

## 1. Scope

- **Stage 1 (built):** full public site structure + admin panel. Visual design
  is deliberately absent — a design developer applies it on top
  (see `docs/HANDOFF-DESIGN.md`).
- **Stage 2 (not built, URLs reserved):** Global Integration track — hub +
  3 programme sub-pages + Modern Languages section linking to mugup.com.ua
  (the client's Ukrainian site, which stays live).
- Requirement sources, all under `docs/requirements/`:
  - `MugUp_Technical_Specification_TZ.pdf` — signed TZ (prevails on conflict);
  - `Mug.Up Web site structure v2.pdf` — earlier vision, superseded but shows
    intent (sales funnel, reference sites);
  - `client-materials/` — client copy (docx) and assets (logos, team photos).
- `docs/SEO-REQUIREMENTS.md` — hard technical-SEO requirements, all
  implemented; treat as invariants.

## 2. Stack

Next.js 15 (App Router, TypeScript strict), Tailwind CSS v4, Supabase
(Postgres + Auth + Storage) behind a port layer. All public pages are
statically generated (SSG/ISR); admin pages are dynamic. No CMS by explicit
client decision; the admin panel is the CMS.

## 3. Repository map

```
src/app/[locale]/…        public pages (en, ua)
src/app/admin/…           admin panel (own layout, English UI)
src/app/actions/…         public server actions (leads, reviews)
src/app/admin/actions.ts  admin server actions
src/components/…          shared render components (design layer)
src/content/{en,ua}/…     ALL public copy as typed data (see §5)
src/lib/data/ports.ts     vendor-neutral data interfaces
src/lib/data/supabase/…   the ONLY place the Supabase SDK appears
src/lib/…                 guards, permissions, seo, slugify, helpers
src/middleware.ts         host binding + admin session gate
supabase/migrations/      full schema incl. RLS (plain Postgres SQL)
scripts/                  local seed + RLS verification
```

## 4. Hosts & security model

- `PUBLIC_HOST` — the public site answers only on this host (404 elsewhere).
  Unset → any host (needed for Vercel previews).
- `ADMIN_HOST` — the admin panel exists only on this non-advertised host; that
  host serves nothing else. Unset → `/admin` works in dev only; in production
  the panel is fail-closed (404 everywhere). Optional `ADMIN_IP_ALLOWLIST`
  (IPv4/CIDR) 404s everyone else before auth. Network-level VPN/Zero-Trust is
  recommended in front for production (no code changes needed).
- Admin requests get `X-Robots-Tag: noindex`; the admin path is deliberately
  NOT mentioned in robots.txt.
- Sign-in hardening, both IP-independent (the client travels): (1) idle
  timeout — see `admin_settings` below; (2) second factor = authenticator
  app (TOTP via Supabase MFA, `src/lib/data/supabase/jwt.ts` reads the
  session's `aal` claim). A member who has enrolled counts as signed OUT for
  every page and action until the current session is aal2
  (`AuthPort.getUserId()` returns null → `getCurrentProfile()` null → the
  layout shows no navigation); the middleware serves such a session nothing
  but `/admin/verify` (6-digit code, `verifyMfaCode`). Enrolment lives in
  Settings (`startTotpEnrollment` hands the QR code + key to a client
  component that keeps them in browser state, so `activateTotp` returning a
  wrong-code error keeps the SAME QR — the page's re-render after an action
  must never start a new enrolment); turning it off needs the current code from the app (proof of the phone,
  not the password — a stolen password must not be able to strip the
  protection) and is refused while the team policy `mfa_required` is on. The policy switch (Security card) forces
  members without a factor to Settings until they enrol. Team shows each
  member's status and "Reset two-factor" (lost phone — service role deletes
  the factors). Local stack: `supabase/config.toml` `[auth.mfa.totp]`
  enabled; hosted: Authentication → Multi-Factor → TOTP (default on).
- Authorization is four-layered: middleware redirect → `requireProfile(perm)`
  in every page/action → per-user permission flags → Postgres RLS re-checks
  the same flags (`has_perm()` SQL function). Public form writes use the
  service role; no table has anonymous write policies. Published posts and
  categories have anonymous read policies (public content).
- Roles are presets over flags (`src/lib/permissions.ts`): admin (all),
  manager (leads + files + posts + reviews — everything except team
  management; client request 30 Aug 2026), editor (posts + reviews;
  deliberately no access to leads — personal data, GDPR minimisation).
  Flags are editable per user. `security.policy` (admin preset only) gates
  the team-wide "require two-factor for everyone" switch — deliberately a
  flag of its own so it can be handed out independently of `users.manage`.

## 5. Content layer (public site)

Every public page renders typed data from `src/content/{en,ua}` — components
contain zero copy. Contract in `src/content/types.ts`: pages are
`{ meta, hero, sections[] }`; sections hold typed blocks (paragraph, list,
cards, steps, stats, testimonials, faq, team, image, cta). Programme pages add
slug/group/atAGlance. Rules:

- Section `id`s and hrefs are IDENTICAL across locales; hrefs are
  locale-relative (`/book-assessment`) and prefixed at render time.
- The Ukrainian copy is a DRAFT translation of the client's English materials
  — client review required before launch.
- `image: "placeholder"` renders the grey-X `ImagePlaceholder`; only
  client-provided assets otherwise (no AI imagery — client rule).

Insights is database-driven: static `insights-posts.ts` samples render only
when no backend is configured (and are noindexed).

## 6. Route map (per locale: /en, /ua; root 308 → /en)

```
/                      Home (TZ section order; + For Parents & What We Support
                       from client copy docs — kept by client decision)
/about                 Mission, methodology, founder story (+video placeholder),
                       team, standards, partnerships
/pathways/british-education             hub + 11 programme pages (shared template)
/pathways/british-education/<slug>      slugs listed in src/content/types.ts
/pathways/global-integration            Stage-1 hero landing
/insights               listing; DB categories; ISR 300s
/insights/<slug>        article (layout blocks or legacy Markdown from DB),
                        Article JSON-LD
/book-assessment        content + booking form + FAQ (FAQPage JSON-LD)
/contact                contact details + enquiry form
/review                 public "leave a review" form (3rd form, added beyond
                        the TZ's two by client request)
/privacy-policy, /terms noindexed stubs pending legal text
```

Known deliberate deviation from the TZ: `Contact` appears in the header nav
(TZ lists it in the footer only) — restored by client request for findability.

## 7. Data model (supabase/migrations/ 0001–0013 — plain Postgres, applied in order)

- `profiles` — 1:1 with auth users (auto-created by trigger); role slug
  (built-in or custom) + `permissions text[]` (the enforcement source of
  truth) + `must_change_password` (first-login gate for invited/reset
  accounts, enforced by the middleware).
- `leads` — the public enquiry forms as a CRM: `form` =
  booking|contact|partnership; 9-stage pipeline (new → contacted →
  assessment_booked → assessment_completed → offer → programme_recommended →
  enrolled / closed / lost, `lost_reason` + note required for Lost);
  `programme`, `source`, `owner_id`, `next_action`, `next_action_date`,
  internal notes, optional `file_path` into the private `lead-files` bucket.
- `reviews` — moderation queue: status pending|approved|rejected; `source`
  website|google|other (google = manually imported real reviews), 1–5
  `rating`, `locale` en|ua (which homepage shows it — the public form stores
  the page's language, imports pick one), marketing fields `programme` /
  `audience` / `featured`. Public form always inserts pending;
  approved+featured reviews of the page's locale replace the static homepage
  testimonials. Migration 0012 ships the client's own 25 testimonials
  (12 EN / 13 UA, from "Відгуки.docx") as approved+featured rows with fixed
  ids — the ONLY content that reaches production by migration; the static
  copies in `src/content` remain the no-database fallback.
- `posts` — Insights articles: slug+locale unique; draft|scheduled|published
  with stable `published_at` (scheduled goes live by itself once the time
  passes: the public queries and RLS treat `scheduled` + past `published_at`
  as live, public pages re-render within 5 minutes (`revalidate = 300`), and
  the admin flips such rows to `published` whenever the posts list or an
  edit page loads — `PostsPort.publishDue()`, service role — so status,
  counters and "View on site" stay truthful without a cron); `author`, hero image (+alt), end-of-article CTA pair; FK to
  `post_categories`. Body is stored twice: `body_blocks` (jsonb, layout-aware
  builder-v2 blocks — the render source; schema + validation in
  `src/lib/post-blocks.ts`) and `body_md` (flattened Markdown mirror; the
  only body for pre-v2 posts and the fallback whenever `body_blocks` is null).
- `post_categories` — admin-managed (slug + label_en + label_ua + sort);
  delete restricted while posts reference it.
- `roles` — ALL role presets, built-in (admin/manager/editor, `built_in`
  flag: fixed slug/name, undeletable) and custom, edited in one panel
  (Team → Roles): permissions + the notification events the role receives;
  saving re-applies the permission set to every member holding the role.
  Guards: the admin role can never lose `users.manage`; you cannot apply a
  users.manage-less set to your own role; per-account flags remain the
  enforcement source of truth and stay individually tunable.
- `admin_settings` — key/value: `session_timeout_minutes` (idle sign-out,
  5–480, default 15; written with `users.manage`) and `mfa_required` ("1" =
  every member must have an authenticator app; written with the separate
  `security.policy` flag — RLS checks per key, migration 0013). Keys are
  constants in `src/lib/admin-session.ts`. Mechanics (`src/lib/admin-session.ts` +
  `src/lib/data/supabase/middleware.ts`): every admin request stamps an
  httpOnly `mugup-admin-last-active` cookie whose max-age IS the timeout;
  a request without a fresh stamp (expired, or never set) signs the session
  out and lands on `/admin/login?error=expired`. Sign-in and the welcome
  page stamp it first, so the check works from the very first request and
  survives browser restarts (a session cookie would not). In the browser,
  `src/app/admin/IdleGuard.tsx` (mounted by the admin layout for signed-in
  members) makes it feel right: reading/scrolling counts as activity via a
  throttled heartbeat (`stampAdminActivity`, at most every quarter of the
  timeout), and once the timeout passes with no activity the tab signs
  itself out (`signOutIdle`, local scope — other devices stay signed in) and
  lands on the login page instead of waiting for the next click. It has to
  be an explicit sign-out: any request, a reload included, re-stamps the
  cookie. The middleware remains the authority either way.
- `notifications` + `notification_role_events` + `notification_reads` —
  the in-admin notification centre: feed entries with deep-link `href`
  (service-role writes only, pruned after 90 days), admin-configured
  role→events routing, per-member per-entry read state.
- `activity_log` — append-only audit trail (service-role writes only).
- Storage: `lead-files` (private, signed URLs for `leads.pii` holders),
  `post-images` (public bucket for images embedded in articles).

## 8. Admin panel modules

Dashboard (counts + plain-language role summary) · Enquiries (labelled filter
panel — status/form/sort chips with counts, name/email search, CSV export; a
6-column table that fits without horizontal scroll, name links to the detail
page) · Reviews (pending queue first, approve/reject; "All reviews"
management list with status filter, per-card Edit details (language,
programme, audience, featured) / Delete; manual add with language, source,
rating) · Insights (layout-aware post builder v2 — text /
heading / subheading / list / quote / image+caption / button / divider /
spacer / columns — one "+ Columns" button starts a 2-column row, the count
(2–6) changes in the row's toolbar (CSS-var grid, stacks on mobile;
"◫ with next" pairs two blocks, "↳ into columns" moves a block into the row
below as a new column, "Unstack" reverses); per-block width
standard|wide|full and alignment;
insert-anywhere, duplicate, live preview through the same PostBody renderer
the site uses; serializes to `body_blocks` JSON + a `body_md` mirror; image
upload to `post-images`; auto-slug from title with UA transliteration;
category management; draft/publish/unpublish/delete with `revalidatePath` so
the public site updates in seconds. The form (`PostForm`, client) validates
in the browser first and calls `savePost(intent, formData)` directly: the
action returns `{ code, field }` instead of redirecting, so a slug clash or
a missing CTA link highlights that field with the message under it and
nothing typed is lost; scheduling uses `SchedulePicker`, an in-house
calendar + time selects that always speak UK wall time and show "Now in the
UK", writing "YYYY-MM-DDTHH:MM" into the hidden `publish_at`) · Team (invite by email is the single
way to add accounts: with an email transport the member receives login + a
generated temporary password and MUST set their own on first sign-in
(`profiles.must_change_password`, middleware-enforced); one-click password
reset works the same way; link-based flows via `/admin/welcome` remain only
as the no-transport fallback; per-user role preset + flag checkboxes with
live preset fill; member deletion with confirm (self-delete blocked); custom
roles — admin-defined named permission presets in `custom_roles`, offered in
every role dropdown, deletable only while unused; self-lockout guard) ·
Notifications (in-admin notification centre: events — new booking / contact /
partnership enquiry, new review, post published/scheduled — land in the
`notifications` feed with a deep-link href (enquiry card / reviews / post);
routing is PER ROLE and lives in the role editor (Team → Roles,
`notification_role_events`): members inherit their role's set and cannot
configure it themselves, and an event is only offered/delivered with the
matching permission (`NOTIFICATION_EVENT_PERMISSION`: enquiries need
leads.view, reviews need reviews.moderate, posts need posts.edit — the feed
re-filters by the member's own flags as the final gate); an entry counts as
read per member only once clicked (`notification_reads`), NEW badge +
mark-all-as-read; optional email copy of enquiry/review events via env —
docs/EMAIL-SETUP.md) · Activity (range chips
today/7d/30d/all + custom from–to dates, stats: totals, per-module, top
actors, busiest day) · Settings ("Your account": Profile + Two-factor authentication stacked
beside Password, rows of equal height; "Team security", shown only when the
member holds the flags: Two-factor policy (`security.policy`) and
Inactivity sign-out (`users.manage`) side by side, a lone card full width;
both stored in `admin_settings` and enforced by the middleware). Every admin
input renders its invalid state on the field (`user-invalid` / `aria-invalid`
styling in `ui.tsx`); password fields carry native constraints so the browser
refuses weak or mismatched passwords before any round trip. Team cards show each
member's two-factor status with a "Reset two-factor" recovery button.

Password policy everywhere a password is set (`src/lib/password.ts`): min 8
chars with upper + lower + digit; enforced server-side and hinted client-side
(the seeded `admin123` predates the policy and is dev-only). Self password
change requires the current password EXCEPT on a first-login account — it
just typed its temporary password to sign in, so the form skips the field.
Sign-in trims the pasted password (temporary ones are copied from an email).

Outgoing email goes through ONE app-owned channel (`src/lib/email.ts`, SMTP
via nodemailer or Resend HTTP, env-selected; sender = `MAIL_FROM`): invite
credentials, password resets and optional email copies of enquiries/reviews.
Without a transport, invites/resets fall back to Supabase Auth's own letters
(Mailpit locally). Full guide: `docs/EMAIL-SETUP.md`.

## 9. Environment variables

See `.env.example` — it documents every variable. Summary: `DATA_BACKEND`
(backend selector, default supabase), 3 Supabase keys (service key is
server-only), `PUBLIC_HOST`, `ADMIN_HOST`, `ADMIN_IP_ALLOWLIST`, and the
email transport: `SMTP_*` or `RESEND_API_KEY`, plus `MAIL_FROM` and
`LEADS_NOTIFY_EMAIL` (docs/EMAIL-SETUP.md).

## 10. Runbooks

Local: `npm run db:start` → copy printed keys into `.env.local` →
`npm run seed:dev` → `npm run dev`. Details and test logins: `README.md`.

Production: client-owned Supabase project (London) → apply the migrations in
order → set env vars on the host (Vercel) incl. `ADMIN_HOST` (hidden
subdomain added as a domain alias) → first admin via Authentication → Add
user + `supabase/seed_admin.sql` → email per `docs/EMAIL-SETUP.md` → GA4 +
Search Console + cookie banner (pending, see §11).

## 11. Not built yet (agreed backlog)

GA4 + Search Console + cookie
consent banner · Cloudflare Turnstile (honeypot only today) · founder video &
photo (awaiting client materials) · LinkedIn/YouTube/Eventbrite footer links
(awaiting exact URLs) · UA copy review by client · legal texts · Stage 2
pages · automated Google-review import (Business Profile API; manual
copy-paste flow exists).

## 12. Gotchas

- ONE dev server at a time; never `next build` while dev runs — concurrent
  writers corrupt `.next` (symptom: stale pages / phantom 404s; fix: delete
  `.next`, restart).
- `docs/requirements/**` PDFs and client materials are gitignored on purpose
  (client property, large binaries) — they travel by folder copy, not git.
- Local auth emails never leave the machine — Mailpit UI on :54324.
- The legacy root copies of the requirement PDFs / "Wеb sitе" folder (names
  contain Cyrillic "е" homoglyphs) are superseded by `docs/requirements/` —
  delete them when unlocked.

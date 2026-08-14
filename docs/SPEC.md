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
- Authorization is four-layered: middleware redirect → `requireProfile(perm)`
  in every page/action → per-user permission flags → Postgres RLS re-checks
  the same flags (`has_perm()` SQL function). Public form writes use the
  service role; no table has anonymous write policies. Published posts and
  categories have anonymous read policies (public content).
- Roles are presets over flags (`src/lib/permissions.ts`): admin (all),
  manager (leads + files), editor (posts + reviews; deliberately no access to
  leads — personal data, GDPR minimisation). Flags are editable per user.

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

## 7. Data model (supabase/migrations/0001_init.sql — plain Postgres)

- `profiles` — 1:1 with auth users (auto-created by trigger); role preset +
  `permissions text[]` (the enforcement source of truth).
- `leads` — both public enquiry forms; `form` = booking|contact, status
  workflow new→contacted→in_progress→converted→closed, internal notes,
  optional `file_path` into private `lead-files` bucket.
- `reviews` — moderation queue: status pending|approved|rejected; `source`
  website|google|other (google = manually imported real reviews), optional
  1–5 `rating`. Public form always inserts pending. Approved reviews are NOT
  yet rendered on the public site (next step if requested).
- `posts` — Insights articles: slug+locale unique, draft → published with
  stable `published_at`; FK to `post_categories`. Body is stored twice:
  `body_blocks` (jsonb, layout-aware builder-v2 blocks — the render source;
  see `src/lib/post-blocks.ts` for the schema and validation) and `body_md`
  (flattened Markdown mirror; the only body for pre-v2 posts, and the
  fallback whenever `body_blocks` is null).
- `post_categories` — admin-managed (slug + label_en + label_ua + sort); the
  TZ's five are seeded; delete restricted while posts reference it.
- Storage: `lead-files` (private, signed URLs for `files.view` holders),
  `post-images` (public bucket for images embedded in articles).

## 8. Admin panel modules

Dashboard (counts + plain-language role summary) · Enquiries (labelled filter
panel — status/form/sort chips with counts, name/email search, CSV export; a
6-column table that fits without horizontal scroll, name links to the detail
page) · Reviews (pending queue first, approve/reject; "All reviews"
management list with status filter, per-card Edit details / Delete; manual
add with source+rating) · Insights (layout-aware post builder v2 — text /
heading / subheading / list / quote / image+caption / button / divider /
spacer / 2–3 columns; per-block width standard|wide|full and alignment;
insert-anywhere, duplicate, live preview through the same PostBody renderer
the site uses; serializes to `body_blocks` JSON + a `body_md` mirror; image
upload to `post-images`; auto-slug from title with UA transliteration;
category management; draft/publish/unpublish/delete with `revalidatePath` so
the public site updates in seconds) · Team (invite by email is the single
way to add accounts → `/admin/welcome` set-password page; per-user role
preset + flag checkboxes; one-click "Send password reset email" (recovery
link lands on the same welcome page); member deletion with confirm
(self-delete blocked); custom roles — admin-defined named permission presets
in `custom_roles`, offered in every role dropdown, deletable only while
unused; self-lockout guard) ·
Notifications (in-admin notification centre: events — new booking / contact /
partnership enquiry, new review, post published/scheduled — land in the
`notifications` feed; each member subscribes to event types
(`notification_subscriptions`, self-service + manager-configurable), NEW
badge via `last_seen`, mark-all-as-read; optional email copy of
enquiry/review events via env — docs/EMAIL-SETUP.md) · Activity (range chips
today/7d/30d/all + custom from–to dates, stats: totals, per-module, top
actors, busiest day) · Settings (account info + change own password requiring
the current password; Security card for managers — idle session timeout,
stored in `admin_settings`, enforced by the middleware, default 15 min).

Password policy everywhere a password is set (`src/lib/password.ts`): min 8
chars with upper + lower + digit; enforced server-side and hinted client-side
(the seeded `admin123` predates the policy and is dev-only).

Flows that send email: team invites (Supabase Auth SMTP; Mailpit locally) and
new-lead notifications (`src/lib/notify.ts`, Resend REST; enabled only when
`RESEND_API_KEY` + `LEADS_NOTIFY_EMAIL` are set).

## 9. Environment variables

See `.env.example` — it documents every variable. Summary: `DATA_BACKEND`
(backend selector, default supabase), 3 Supabase keys (service key is
server-only), `PUBLIC_HOST`, `ADMIN_HOST`, `ADMIN_IP_ALLOWLIST`,
`RESEND_API_KEY` + `LEADS_NOTIFY_EMAIL` + `LEADS_NOTIFY_FROM`.

## 10. Runbooks

Local: `npm run db:start` → copy printed keys into `.env.local` →
`npm run seed:dev` → `npm run dev`. Details and test logins: `README.md`.

Production: client-owned Supabase project (London) → run the migration SQL →
set env vars on the host (Vercel) incl. `ADMIN_HOST` (hidden subdomain added
as a domain alias) → first admin via Authentication → Add user +
`supabase/seed_admin.sql` → configure SMTP in Supabase for invites → set
Resend vars for lead notifications → GA4 + Search Console + cookie banner
(pending, see §11).

## 11. Not built yet (agreed backlog)

Rendering approved reviews on the public site · GA4 + Search Console + cookie
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

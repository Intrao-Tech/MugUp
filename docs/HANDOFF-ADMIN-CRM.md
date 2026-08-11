# Admin CRM upgrade — handoff for the UI developer

Backend, data layer, server actions and migrations for the August 2026 client
feedback round are **done, applied and smoke-tested**. What remains is the
interface. This document lists, page by page, what to build and which
already-working pieces to call. Nothing below requires new SQL, ports or
actions — if something is missing, talk to the backend side first.

Everything typechecks (`npm run typecheck`) and the flows marked ✅ below were
verified in the browser against the local stack (`npm run db:start`,
`npm run seed:dev`, logins in CLAUDE.md).

## What changed underneath (already live)

| Area | Change |
|---|---|
| `leads` | new columns `programme`, `source`, `owner_id`, `next_action`, `next_action_date`, `lost_reason`, `lost_reason_note`; statuses replaced by a 9-stage pipeline; `form` gained `partnership` |
| `reviews` | new columns `programme`, `audience`, `featured`; approved rows are publicly readable (RLS) |
| `posts` | new columns `author`, `hero_image_url`, `hero_image_alt`, `cta_label`, `cta_url`; status gained `scheduled`; anon RLS shows scheduled posts whose `published_at <= now()` |
| `post_categories` | relabelled to the client's 7 categories (slugs unchanged), + `international-baccalaureate`, `boarding-schools` |
| `profiles.permissions` | now the 9 client permissions (see `src/lib/permissions.ts`); data migrated (`files.view` → `leads.pii`) |
| `activity_log` | new append-only table; written via service role only |
| Public forms | "How did you hear about us?" select on Book Assessment + Contact (both locales) ✅; Contact with the Partnership subject stores `form = 'partnership'` ✅ |

Key modules: types + label maps in [src/lib/db-types.ts](../src/lib/db-types.ts)
(`LEAD_STATUS_LABELS`, `LOST_REASON_LABELS`, `LEAD_SOURCE_LABELS`,
`REVIEW_AUDIENCE_LABELS`, `POST_STATUS_LABELS`), ports in
[src/lib/data/ports.ts](../src/lib/data/ports.ts), actions in
[src/app/admin/actions.ts](../src/app/admin/actions.ts).

## Permissions to respect in the UI

`PERMISSIONS` / `PERMISSION_LABELS` in `src/lib/permissions.ts`; check with
`hasPerm(profile, "…")`. UI rules:

- `leads.view` — see the enquiries pages at all (middleware/guards enforce).
- `leads.manage` — show editing controls (status, details, notes).
- `leads.export` — show the Export CSV button.
- `leads.pii` — **without it, mask** email/phone (`maskEmail`/`maskPhone` in
  [src/lib/pii.ts](../src/lib/pii.ts)) and hide message + attached file. The
  CSV route already masks server-side ✅.
- `analytics.view` — show the dashboard section on `/admin`.
- `posts.publish` — show Publish AND Schedule buttons (drafting needs only
  `posts.edit`).
- `users.manage` — Team page (already works ✅) and the new Activity page.

## Page-by-page

### 1. `/admin/leads` — list

Client's columns: `Date | Name | Interest | Programme | Source | Owner |
Next Action | Due | Status` (+ Open link). Notes:

- Interest = `lead.pathway_interest ?? lead.subject`.
- Source: `LEAD_SOURCE_LABELS[lead.source]`, empty when null.
- Owner: resolve `owner_id` via `data.team.listProfiles()` (RLS already lets
  `leads.view` holders read profiles). 
- Status chips for all 9 statuses already work ✅ (`LEAD_STATUSES` order is the
  funnel order).
- Inline status select posts `updateLeadStatus` with `id`, `status`, optional
  `back`. Picking **Lost** inline redirects to the detail page with
  `?error=lost-reason` (reason is required) — show that notice there.
- Export button: link to `/admin/leads/export` + the current query string
  (`status`, `form`, `q`) — route is done and logged ✅.

### 2. `/admin/leads/[id]` — detail

- Add an "Enquiry management" form → action `updateLeadDetails` with fields:
  - `programme` — text input + `<datalist>` from `PROGRAMME_SUGGESTIONS`
    ([src/lib/programmes.ts](../src/lib/programmes.ts));
  - `source` — select over `LEAD_SOURCES` (labels from `LEAD_SOURCE_LABELS`),
    empty option = unknown;
  - `owner_id` — select over `listProfiles()` (empty = unassigned);
  - `next_action` — text; `next_action_date` — `<input type="date">`.
- Status form → `updateLeadStatus` must include `lost_reason` select
  (`LOST_REASONS`/`LOST_REASON_LABELS`) and `lost_reason_note` text. The
  action enforces: Lost needs a reason; reason "Other" needs the note.
  Handle `?error=lost-reason`. Show the stored reason on Lost leads.
- PII masking per rules above (the raw row still contains PII — mask at
  render time; do not pass unmasked values into client components).
- File link: keep gating on `leads.pii`. Optionally log link issuance via
  `data.activity.record({action: "lead.file-link", …})` when generating the
  signed URL.

### 3. `/admin` — dashboard (`analytics.view`)

Data: `await data.leads.statsRows()` — PII-free rows
`{created_at, status, source, pathway_interest, next_action_date}` (privileged
aggregate; page MUST gate on `analytics.view`). Compute in the page:

- **This Month** (rows with `created_at` in the current calendar month):
  - New enquiries — count;
  - Contacted — `status !== "new"`;
  - Assessments booked — status index between `assessment_booked` and
    `enrolled` in `LEAD_STATUSES`;
  - Enrolled — `status === "enrolled"`;
  - Enquiry→enrolment — enrolled / total, 0 decimals.
- **Enquiries by area** from `pathway_interest`: contains "British/Британ" →
  Britain; "Global/інтеграц" → Global; else Other.
- **Top sources**: group by `source` (label map), top 5.
- **Needs attention** (all time):
  - new enquiries not contacted — `status === "new"`;
  - follow-ups due — `next_action_date <= today` and status not in
    `enrolled/closed/lost`;
  - assessments awaiting outcome — `status === "assessment_booked"`.

Keep the existing per-permission quick cards (pending reviews, drafts).

### 4. `/admin/reviews`

- Add-review form: `programme` (datalist as above), `audience` select
  (`REVIEW_AUDIENCES`/`REVIEW_AUDIENCE_LABELS`) — action `addReview` already
  accepts them.
- Each card: show programme/audience/featured; add a small form → action
  `updateReviewMeta` (`id`, `programme`, `audience`, `featured` checkbox).
  Only approved + featured reviews reach the homepage.
- Moderation buttons unchanged (`setReviewStatus` ✅, now also revalidates the
  homepage).

### 5. `/admin/posts` + `PostForm`

- New inputs: `author` (text), `cta_label` + `cta_url` (both-or-neither; the
  action rejects half-filled pairs with `?error=cta`).
- Featured image: client uploader (reuse the pattern in
  `PostBuilder.ImageBlockEditor`, action `uploadPostImage`) writing the URL
  into hidden `hero_image_url` + a required-when-image `hero_image_alt`
  (`?error=alt`).
- Third submit button **Schedule** (visible with `posts.publish`):
  `formAction={savePostSchedule}` + `<input type="datetime-local"
  name="publish_at">`, interpreted as **UK wall time** (helpers:
  `isoToUkWallTime`, `isoToUkDisplay` in
  [src/lib/uk-time.ts](../src/lib/uk-time.ts)). Errors: `?error=schedule`
  (malformed), `?error=schedule-past`. Scheduled posts go live by themselves
  — verified ✅.
- ⚠️ **Never use `name="intent"`/`value` on submit buttons** — React drops the
  submitter's name/value for function actions (this was the "post updates
  don't work" bug: every publish saved as a draft). Use the per-button server
  actions instead: `savePostDraft` / `savePostPublish` / `savePostSchedule`
  (see the fixed `PostForm.tsx` for the pattern).
- List page: add a Scheduled chip/status (show the scheduled time via
  `isoToUkDisplay(post.published_at)`).

### 6. `/admin/activity` — new page (`users.manage`)

`await data.activity.list(200)` → table Date | Who (`actor_email`) | Action |
Detail. Actions currently logged: `lead.status`, `lead.update`, `lead.notes`,
`leads.export`, `review.status`, `review.meta`, `post.draft/publish/schedule`,
`post.delete`, `user.create/invite/password/permissions`. Add an "Activity"
item to the admin nav (gate `users.manage`).

### 7. Public site

- **Article page** (`/[locale]/insights/[slug]`): `PublicPost` now carries
  `author`, `heroImageUrl` + `heroImageAlt`, `ctaLabel` + `ctaUrl` — render
  byline, featured image (plain `<img>`, alt is guaranteed) and an
  end-of-article CTA block. Also set JSON-LD `author` to a Person when
  `post.author` is non-empty.
- **Homepage testimonials**: `getFeaturedReviews()` from
  [src/lib/reviews.ts](../src/lib/reviews.ts); when non-empty, render those
  instead of the static testimonials block (map to
  `{quote, author: author_name, tag: author_tag || programme}`); when empty,
  keep the static content. Moderation actions already revalidate `/en` +
  `/ua` ✅.

## Local dev crib

```bash
npm run db:start   # or: npx supabase start
npx supabase db reset && npm run seed:dev
npm run dev
```

Logins: `admin@` / `manager@` / `editor@mugup.local`, password `admin123`.
Seed data includes: 5 leads across the funnel (incl. one partnership, one
lost-with-reason, two with follow-ups due today), a featured approved review,
a scheduled post (+2 days). To watch a scheduled post go live, set its
`published_at` into the past in Studio (localhost:54323) — the public site
picks it up on the next ISR pass (≤5 min).

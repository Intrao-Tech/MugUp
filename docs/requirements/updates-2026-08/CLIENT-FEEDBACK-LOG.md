# Client feedback round — August 2026

Source: Telegram thread with Natalia Volkova (client marketing) + Evgenia
Angerchik (founder), 11–13 Aug 2026, and two docx files in this folder.
Status column = state at the time of writing; the implementation log lives in
git history.

## Files

- `global-integration-updated-v2.docx` (11 Aug) — full rewrite of the Global
  Integration landing: goal-first structure (Live/Work/Grow/Study/Connect),
  languages × destinations, employer section. **Implemented** (landing +
  6 language sub-pages + network stub; commit `ba0ffc2`).
- `Mug.Up_Website_Updates_Final.docx` (12 Aug, "final approved structure and
  copy") — final site logic: two primary areas, International Language
  Qualifications + International Education & Study Abroad sections for GI,
  full British Boarding Schools page copy, homepage Choose-Path final copy,
  British Education cross-link card + card order, naming rule.
  **NOT yet implemented.** NOTE from Natalia: the menu items inside this file
  are NOT final.

## Decisions from the thread

1. **Teachers on the Home page** (11 Aug): keep only photo, name, position,
   with a link to the full team section on About. Full details stay on About.
   Carousel = design-stage decision. **Not yet implemented.**
2. **IB & boarding schools** (12 Aug): boarding schools belong to British
   education thematically, but the boarding-school SERVICE page lives under
   Global Integration → International Education & Study Abroad (audience =
   international students). International Baccalaureate → international
   qualifications area. One page, no duplicated copy; British Education gets
   a cross-link card only.
3. **Top navigation & "Courses & Programmes" catalogue** (12–13 Aug): client
   proposed a new top nav (British Education and Global Integration as
   top-level items, + an "all courses & programmes" catalogue button/page;
   dropdown with 20+ courses would be ugly). Anton's position, accepted by
   the client: decide after the design concepts are ready (variants were in
   preparation on 13 Aug). **Parked — do not change the nav yet.**

## Admin panel feedback (11 Aug, full list)

1. Enquiries columns: Date | Name | Interest | Programme | Source | Owner |
   Next Action | Due date | Status.
2. Status pipeline: New / Contacted / Assessment Booked / Assessment
   Completed / Offer / Programme Recommended / Enrolled / Closed / Lost;
   Lost requires a reason: Price, Timing, No suitable programme, No response,
   Chose another provider, Location, Not ready yet, Other (+ note).
   Form types: Book Assessment / Contact / Partnership. Lead sources: Google
   Search / Instagram / Facebook / TikTok / Telegram / Referral / Event /
   Flyer / School / Partner / Facebook groups / Other.
3. Dashboard: This Month (new, contacted, assessments booked, enrolled,
   enquiry→enrolment %), enquiries by area (Britain/Global/Other), top
   sources, "needs attention" (uncontacted, follow-ups due, assessments
   awaiting outcome).
4. Reviews: + Programme/Area, + Audience (Parent / Adult learner / Student /
   Corporate client), + Featured flag for homepage testimonials.
5. Insights: + Author, + Featured image with alt text, statuses
   Draft/Scheduled/Published, + Related programme / CTA at the article end
   (funnel hand-off).
6. Categories (new set): British Education · Languages & Learning ·
   Qualifications & Exams · Career & Workplace · Life & Integration ·
   International Education Baccalaureate · Boarding schools.
7. Permissions (granular): view/edit/export enquiries, view learner personal
   data (PII — separate from content!), manage content, publish content,
   manage reviews, view analytics, manage users.
8. Activity log: enquiries, downloads/exports, permission changes.

**Status:** backend/data layer/actions/migrations for items 1–8 are DONE and
smoke-tested (commit `0e80292`); the remaining ADMIN UI work is specified
page-by-page in `docs/HANDOFF-ADMIN-CRM.md`.

## 14 Aug additions

1. **New WhatsApp Business account** for the site link — sent as a QR-code
   image. **Resolved:** the QR was decoded locally to
   `https://wa.me/message/PR7BAKHTTTFWK1` and the footer/socials now use it
   (no need to ask the client for a text link).
2. **Two new team members** (bios sent in the thread, added to Home + About
   in both locales):
   - Djennè Stephens — GCSE English | Functional Skills | ESOL; Qualified FE
     English Lecturer, CELTA, PGCE in progress. Photo added
     (`public/images/team/djenne.jpg`).
   - Tetiana Krytsun — Manager of Mug.Up Studio | Educational Consultant; MA
     Laws, MA International Criminology, PhD candidate. Photo added
     (`public/images/team/tetiana.jpg`).

3. **Design reference links** (14 Aug, `Mug.Up Web site structure (links
   only).pdf`) — client's explicit instruction: the structure inside is
   OUTDATED (reworked several times), use ONLY the links. Extracted and
   mapped per section in `docs/HANDOFF-DESIGN.md` (Home: Crimson/Kaplan/
   Kaptest/Preply/Nord Anglia/General Assembly; Pathways: Coursera category
   nav, MasterClass segmentation; Results/Insights: British Council school
   resources, Solid Digital case studies; Footer: apple.com).

## Status checklist (as of 14 Aug, end of day)

- [x] Admin & public UI per `docs/HANDOFF-ADMIN-CRM.md` — done: leads list
      CRM columns + CSV export button, lead detail management/status/lost
      forms + PII masking, dashboard (This Month / areas / top sources /
      needs attention), reviews programme+audience+featured, post form
      author/hero image/CTA/schedule + scheduled chip, /admin/activity page,
      article byline/hero/CTA + Person JSON-LD, homepage featured
      testimonials swap.
- [x] `Mug.Up_Website_Updates_Final.docx` content — done: homepage
      Choose-Path final copy (EN+UA); GI sections International Language
      Qualifications (hub at /pathways/global-integration/qualifications;
      IELTS/Cambridge/SELT moved there with 301 redirects) + International
      Education & Study Abroad (IB teaser, no page yet); British Boarding
      Schools full page at /pathways/global-integration/boarding-schools;
      BE hub cross-link card; naming rule respected.
- [x] Home team preview trimmed to photo/name/position + link to About.
- [x] Nav + Courses & Programmes catalogue (/courses) — implemented per the
      final doc (+ Insights kept in the nav for the SEO funnel); labels may
      still shift with the design round.
- [x] New team members' bios (Djennè, Tetiana) on Home + About, EN+UA.
- [ ] IB full page — copy not provided yet (teaser only).
- [x] WhatsApp: QR decoded → `wa.me/message/PR7BAKHTTTFWK1` in footer/socials.
- [x] Photos: Djennè + Tetiana in `public/images/team/`, wired on Home+About.
- [ ] Open question to client: Functional Skills & ESOL stayed under British
      Education (the final doc does not place them); confirm.

## Internal feedback round (14 Aug, evening)

1. Post builder v2 — layout-aware constructor (widths, alignment, 2–3
   columns, buttons, captions, dividers, spacers, insert-anywhere, live
   preview). New jsonb column `posts.body_blocks` (migration 0003); body_md
   stays as mirror/fallback. Old posts unaffected.
2. Passwords — standard ruleset (8+ chars, upper+lower+digit) everywhere;
   self password change moved to Settings and now requires the current
   password; Team page invite/temp-password redesigned as two clear cards,
   dev-only Mailpit hints removed from the production UI.
3. Enquiries — labelled filter panel (Status / Form / Sort + search + CSV),
   table condensed to 6 columns (no horizontal scroll), name → detail page.
4. Reviews — "History" replaced with a managed "All reviews" list: status
   filter, per-card Edit details / Delete (with confirm), moderation queue
   unchanged on top.
5. Notifications routing — new admin page (Notifications, users.manage):
   per-email subscriptions to events (booking / contact / partnership
   enquiry, new review); table `notification_recipients` (migration 0004);
   review submissions now notify too; env `LEADS_NOTIFY_EMAIL` demoted to
   fallback. Production email guide: `docs/EMAIL-SETUP.md`.
6. Team page: temp-password card now states the email is only the sign-in
   login (nothing is emailed in that flow).

## Internal feedback round (14 Aug, late)

1. Notifications pivoted to an IN-ADMIN notification centre (migration 0005,
   supersedes the email routing from the previous round): `notifications`
   feed + per-member `notification_subscriptions` (self-service + manager
   config), NEW badge / mark-all-read, new event "post published or
   scheduled". Email stays only as an env-gated copy for enquiries/reviews.
2. Idle session timeout for the admin panel — default 15 min, configurable
   in Settings → Security (5–480 min, `admin_settings` table); enforced in
   middleware, revokes only the idle session, login page explains why.
3. Live password checklist (rules tick off in real time) on Settings and the
   invite welcome page.
4. Activity log: range filters (today / 7 / 30 days / all + custom from–to)
   and stats (total, per-module, top actors, busiest day).
5. Wording: removed the "no self-registration" line on the login page;
   per-member password reset renamed to "Set a new password for <name>".

## Internal feedback round (14 Aug, night)

1. Custom roles (migration 0006): admins create named permission presets
   next to the built-in three (`custom_roles` table, profiles.role check
   dropped); applied to every role dropdown; a role in use cannot be
   deleted; built-in names reserved.
2. Team members can now be DELETED (confirm flow, self-delete blocked,
   logged); manual password entry removed entirely — one button "Send
   password reset email" (Supabase recovery link → the same /admin/welcome
   set-password page as invites).
3. "Create with a temporary password" card removed — invite by email is the
   single way to add accounts.
4. Lead detail: contextual fields — Lost reason/note render only while
   status "Lost" is selected (live, client-side); Next action/Due hidden for
   closed/lost enquiries (absent fields keep stored values server-side).
5. Note: invite "email did not arrive" on the local stack is expected —
   local Supabase routes ALL email to Mailpit (localhost:54324), nothing
   leaves the machine until production SMTP is configured
   (docs/EMAIL-SETUP.md).
6. Real email from localhost: one shared transport (`src/lib/email.ts`,
   SMTP via nodemailer or Resend HTTP, env-selected; `MAIL_FROM` = the one
   place the sender changes). Invites/resets now mint the Supabase link and
   send the letter through it (fallback: Supabase Auth email). Local
   `.env.local` carries the shared Gmail test account from TradeHub;
   enquiry/review copies go to LEADS_NOTIFY_EMAIL.
7. Role preset made live: picking a preset in the member card re-ticks the
   permission checkboxes instantly (client component); custom roles join
   built-ins in the presets map.
8. Builder: drag & drop reordering (⠿ handle, drop on a block or on any
   "+ add a block here" line), "◫ with next" pairs two blocks into a
   2-column row, "Unstack" breaks a columns row back into full-width blocks.

## Internal feedback round (15 Aug)

1. Notifications are clickable (migration 0007): each entry deep-links to
   its target (enquiry card / reviews / post) and counts as read PER ITEM
   only once opened (`notification_reads`); "mark all as read" kept.
2. Schedule data-loss fixed: pressing Schedule with an empty/past date is
   blocked client-side with an inline message — the typed post is never
   thrown away by the server error redirect.
3. Builder: an always-visible "Add a block" bar (all block types incl. 2/3
   columns) at the bottom — no need to discover the between-block lines.
4. Invites & resets carry NO links/tokens anymore (they broke against the
   Auth redirect allowlist): the app creates the account with a generated
   temporary password, emails login + password itself, and the middleware
   forces setting an own password on first sign-in
   (`profiles.must_change_password`). Link flows remain only as the
   no-email-transport fallback; `supabase/config.toml` redirect allowlist
   fixed for it (requires `supabase stop/start`).
5. Live-verified end to end: columns insertion, schedule guard, notification
   click-through + per-item read badge, invite email with password
   (artemdom3+pw@gmail.com), must-change gate redirect, idle timeout
   sign-out message.
6. Fix: feed entries recorded before 0007 had an empty href, so their "open"
   went nowhere — backfilled to module pages (migration 0008) + page-level
   fallback by event type.
7. Columns generalised: the count is free data 2–6 (select in the row
   toolbar; CSS-var grid instead of fixed classes), growing adds empty
   columns, shrinking merges content; new "↳ into columns" moves any block
   into the columns row below as its own new column. 6 is a readability
   ceiling, not a code limitation.
8. Palette simplified: one "+ Columns" button (starts at 2, count changed in
   the row toolbar) instead of separate "+ 2/+ 3 columns".
9. Roles list shows the permission summary for built-in roles too (was
   names only).
10. First-login polish: the set-password form no longer asks for the current
    password on a must-change account (they just typed the temporary one to
    sign in; server skips verification too); sign-in now TRIMS the pasted
    password — a trailing space/newline copied from the email made valid
    temporary passwords "not work". The temporary password stays valid for
    signing in until an own password is set (the notice says so). Fixed
    `PROFILE_COLUMNS` to actually select `must_change_password` for app code.
11. Custom roles are EDITABLE after creation (name + permission checkboxes,
    Save per card) with an optional "also apply to the N members with this
    role" (self-lockout guarded); built-ins stay fixed in code.
12. Notification routing moved to PER ROLE (migration 0009,
    `notification_role_events` replaces per-member subscriptions): only
    administrators (users.manage) decide which role receives which events on
    the Notifications page ("Who gets notified"); members — e.g. a manager —
    just see their role's feed with no self-configuration. Built-in role
    defaults seeded: admin = everything, manager = enquiries + reviews,
    editor = reviews + posts. Deleting a custom role removes its routing.

## Internal feedback round (16–17 Aug)

1. Logic hole fixed: the manager role was routed review_new but lacked
   reviews.moderate — clicking the notification hit "access denied". An
   event now REQUIRES its matching permission
   (`NOTIFICATION_EVENT_PERMISSION` in db-types): the role editor disables
   unavailable events (with a "needs …" hint) and auto-unticks them when the
   permission is removed, the server strips them on save, the feed
   re-filters by the member's own flags, and migration 0010 removed
   review_new from the manager defaults.
2. ONE role panel (user-confirmed choices): built-in roles moved into the DB
   (migration 0010, `custom_roles` renamed to `roles` + `built_in` flag), so
   Admin/Manager/Editor are edited exactly like custom roles — pick a role
   tab, edit its permissions AND its notifications in a single form; saving
   ALWAYS re-applies the permission set to every member with the role (no
   opt-in checkbox anymore). Built-ins keep slug/name and cannot be deleted;
   the admin role cannot lose "Manage users"; self-lockout guarded. The
   Notifications page is now a pure feed (config lives in Team → Roles);
   creating a role moved into a collapsible "+ Create a new role".

## Client feedback round 2 (30 Aug, Telegram, Natalia)

Admin panel approved ("все гарно"), two requests:

1. **Manager gets the editor's capabilities**: the manager built-in role now
   also carries posts.edit, posts.publish, reviews.moderate (preset in
   `permissions.ts` + migration 0011 updates the `roles` row, UNIONs the
   flags onto existing manager profiles, and restores the review_new
   notification default that 0010 had removed for lack of the permission).
   **Implemented.**
2. **Lost reason field in Enquiries** — already shipped in the 11 Aug round
   (item 2 above, commit `0e80292`): selecting the "Lost" status reveals a
   required reason select (Price / Timing / No suitable programme /
   No response / Chose another provider / Location / Not ready yet / Other)
   plus a note, required for "Other". The client reviewed a build that
   predates it or didn't switch a status to Lost. **No code change; show /
   redeploy.**

## Production-readiness pass (5 Sep, internal)

Goal: the product can be handed over with no demo content anywhere but a
developer's machine.

1. **Client reviews live in the database** — the 25 testimonials from
   "Відгуки.docx" (12 EN / 13 UA) ship by migration `0012` as approved +
   featured rows with fixed ids; `reviews.locale` (en|ua) decides which
   homepage shows a review, the public "Leave a review" form stores the
   page's language, and the admin Reviews module gained a Language field
   (add form + Edit details) and a language badge on every card. The static
   copies in `src/content` remain the no-database fallback only.
2. **Seeding policy** — `seed:dev` demo content (accounts `@mugup.local`,
   enquiries, posts, pending reviews) is local-only; on a hosted project the
   seed creates the administrator and nothing else unless `SEED_DEMO_DATA=1`
   is set on purpose. Seed-on-deploy was removed; migrations-on-deploy
   (`scripts/deploy-migrate.mjs`, `SUPABASE_DB_URL`) stays.
3. **Test project (mugup-test) cleaned** — demo enquiries/posts deleted,
   migrations 0011–0012 applied: it now holds the administrator, the 7 post
   categories and the 25 client reviews.
4. **Idle sign-out fixed** — the activity cookie was a session cookie, so a
   browser kept open for days never timed out; it now expires with the
   configured timeout (default 15 min) and a missing/expired stamp signs the
   session out (`/admin/login?error=expired`). Sign-in and the welcome page
   stamp it first.
5. Round-2 items re-checked on this branch: manager = editor capabilities
   (migration 0011, applied to the test project) and the Lost reason list
   (Price / Timing / No suitable programme / No response / Chose another
   provider / Location / Not ready yet / Other) — both present.
6. **Second factor (authenticator app)** — requested after the IP-allowlist
   discussion (the client travels, so protection must not depend on the
   network): TOTP via Supabase MFA. Settings → "Two-factor authentication"
   (QR code + key, first code activates it; turning off needs the current
   password), sign-in gains a `/admin/verify` code step, a session that has
   not passed it is signed OUT for every page/action, Security card gets
   "Require two-factor authentication for everyone" (forces enrolment), Team
   shows each member's status + "Reset two-factor" for a lost phone.
   Hosted project: Authentication → Multi-Factor → TOTP must stay enabled.
7. **Full click-through (5 Sep, every admin module + all three public forms,
   admin/manager/editor)** — everything worked; three small polish fixes
   made on the way: the public review form thanked people with the contact
   form's "we will get back to you" (now "it will appear once approved"),
   the post editor showed "published <date>" on an unpublished draft (now
   "taken off the site (was live from <date>)"), and the activity log's
   role-delete entry had no detail. Note for testers: "Delete post" /
   "Remove" ask for confirmation in a browser dialog.

## Internal feedback round (5 Sep, evening — screenshots)

1. **Settings looked untidy** (a bare separator line inside the Security
   card) — the card is now two cards, "Inactivity sign-out" and "Two-factor
   policy", each with its own heading; no separator lines.
2. **Header links too close** — the admin nav now has real gaps between
   sections, and Settings / Sign out sit apart from the section links.
3. **Enquiries table hard to scan, Save crowding the status select** —
   zebra rows, more cell padding, a heavier header rule, a wider select and
   Save as a compact outlined button with a proper gap.
4. **Idle sign-out** — confirmed working server-side (cookie lifetime =
   timeout, stale/missing stamp signs out). Added `IdleGuard`: reading or
   scrolling keeps the session alive via a heartbeat, and after the timeout
   the tab signs itself out and goes to the login page instead of waiting
   for the next click (verified with a 5-minute timeout).
   "Require two-factor for everyone" explained in place: off = each member
   decides, on = everyone must set it up and can do nothing else until then.
5. **Could not turn 2FA off** — the form asked for the password while the
   natural thing to type is the app code; it now asks for the current code
   from the authenticator app (proof of the phone), password not involved.
6. **Settings still one narrow column** — re-laid out in two columns on
   wide screens ("Your account": Profile, Password · "Security": Two-factor,
   Inactivity sign-out, Two-factor policy), each card with a one-line
   explanation; the authenticator setup shows the QR code beside the steps.
7. **Settings rows did not line up; two-factor options apart** — the page is
   now two groups, each a grid whose cards stretch to the same row height:
   "Your account" = Profile | Password; "Security" = Two-factor
   authentication | Two-factor policy side by side, Inactivity sign-out full
   width beneath.
8. **Two-factor policy behind its own permission** — new flag
   `security.policy` ("Security policy: require two-factor authentication
   for everyone"), migration 0013: added to the admin preset and every admin
   profile; RLS on `admin_settings` checks it for the `mfa_required` key
   (other keys keep `users.manage`). Grant/withhold it per role or per
   member in Team like any other flag.

## Internal feedback round (6 Sep — screenshots)

1. **Settings half-empty without the policy flag** — the page adapts: Profile
   and Two-factor stack beside Password; the "Team security" group appears
   only for members holding `security.policy` / `users.manage`, and a lone
   card takes the full width.
2. **Post form lost everything on a validation error** (e.g. Schedule with no
   date, CTA half-filled, slug already taken) — the form now checks in the
   browser first, the save action returns the problem instead of
   redirecting, the offending field is highlighted with the message under
   it, the page scrolls to it, and nothing typed is lost. Native invalid
   styling on every admin input; password fields block weak/mismatched
   values before submitting.
3. **Schedule control ugly, jumping layout, device-zone "now"** — replaced
   the browser datetime control with an in-house calendar + time picker in
   the panel's design, always UK time, with "Now in the UK" shown; it sits
   in its own "Schedule for later" card and its error line no longer shifts
   the buttons.
4. **Opening the calendar shifted the whole page** — the popover was
   absolutely positioned and, near the end of a short page, grew the
   document so the scrollbar appeared; it is now position:fixed, placed from
   the button (below, or above when there is no room), and the admin shell
   reserves the scrollbar gutter so nothing shifts sideways.
5. **"It's 23:30 and the scheduled post was not sent"** — it was: the site
   showed it (time-based ISR, ≤ 5 min), only the admin kept saying
   "Scheduled" because nothing flipped the row. The posts list and the edit
   page now promote due scheduled posts to Published on load, so the status,
   the counters and the "View on site" link agree with the site.

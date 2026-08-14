# Email — how sending works and how to configure it

Primary notifications are IN-ADMIN: every event (new enquiry, new review,
post published/scheduled) lands in the notification centre
(`/admin/notifications`). That needs no email setup at all.

Everything the app actually EMAILS — team invites, password resets and the
optional email copies of enquiries/reviews — goes through **one shared
channel**: `src/lib/email.ts`. Configure it once in the env and every email
sends from the same address (`MAIL_FROM`); change the address in that one
place and you are done.

## The transport (env-selected)

| Env set | Transport | Typical use |
| --- | --- | --- |
| `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS` (+ `SMTP_PORT`) | SMTP via nodemailer | local testing (shared Gmail test account) |
| `RESEND_API_KEY` | Resend HTTP API | production (verified domain) |
| neither | not configured | invites/resets fall back to Supabase Auth email (= Mailpit on the local stack); enquiry/review copies are skipped |

Common vars: `MAIL_FROM` (sender on every email), `LEADS_NOTIFY_EMAIL`
(the inbox that receives enquiry/review copies).

Invites and password resets work in both modes: with a transport configured
the app mints the link via Supabase (`generateLink`) and sends the letter
itself; without one, Supabase Auth sends its own letter.

## Local: real email from your machine

`.env.local` already carries the shared Intrao Tech Gmail test account (the
same credentials TradeHub uses). After a rebuild:

- Invite / password reset → a real email arrives in the real inbox.
- Submit a form or review → a copy arrives at `LEADS_NOTIFY_EMAIL`.

Caveats of the Gmail test account: Gmail rewrites the visible sender to
`intraotech1@gmail.com` (so `MAIL_FROM` display-name shows, but the address
is Gmail's), and it is rate-limited (~500/day) — fine for testing, not for
the client's production traffic.

Remove/comment the `SMTP_*` block in `.env.local` to go back to
Mailpit-only (http://localhost:54324, nothing leaves the machine).

## Production (~15 minutes)

1. Create an account at https://resend.com (free tier: 100 emails/day).
2. Verify the sending domain: Domains → Add → `mugupstudio.com`; add the
   SPF/DKIM DNS records Resend shows and wait for "Verified". Without this
   Gmail/Outlook will spam-filter the mail.
3. Create an API key and set the production env:

   ```
   RESEND_API_KEY=re_...
   MAIL_FROM=Mug.Up Studio <noreply@mugupstudio.com>
   LEADS_NOTIFY_EMAIL=hello@mugupstudio.com   # optional copies
   ```

   (Do NOT set `SMTP_*` in production — SMTP wins when both are present.)
4. Supabase dashboard → Authentication → URL Configuration: add
   `https://<ADMIN_HOST>/admin/welcome` to Redirect URLs — invite and
   recovery links must be allowed to land there.
5. Test: invite a teammate, reset a password, submit the contact form.

## Troubleshooting

- Copy did not arrive: check the transport vars and `LEADS_NOTIFY_EMAIL`;
  for Resend see dashboard → Logs. The in-admin feed is independent — if the
  event is missing THERE, check the member's subscriptions on the
  Notifications page.
- Invite/reset did not arrive: with a transport configured the failure is
  reported right in the admin UI ("email could not be sent"); without one,
  check Mailpit locally or Supabase Auth logs on the hosted project.
- Link says invalid/expired: the redirect URL is missing from Supabase Auth
  URL Configuration (step 4), or the link was already used.
- Mail goes to spam: domain not verified, or `MAIL_FROM` is not on the
  verified domain.

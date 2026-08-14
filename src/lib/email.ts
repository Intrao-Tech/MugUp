import "server-only";

import nodemailer from "nodemailer";

// ONE outgoing-email channel for the whole app: enquiry/review copies, team
// invites and password resets all go through sendEmail(). The transport is
// picked from env (see .env.example / docs/EMAIL-SETUP.md):
//
//   * SMTP_HOST + SMTP_USER + SMTP_PASS  -> SMTP via nodemailer
//     (local testing: the shared Gmail test account; note Gmail rewrites the
//     from-address to the authenticated account).
//   * RESEND_API_KEY                     -> Resend HTTP API
//     (production: verified domain, so MAIL_FROM can be noreply@mugupstudio.com).
//   * neither                            -> not configured; callers fall back
//     (invites then go out through Supabase Auth = Mailpit on the local stack).
//
// Change MAIL_FROM in one place and every email sends from that address.

export function isEmailConfigured(): boolean {
  return Boolean(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
      process.env.RESEND_API_KEY,
  );
}

function mailFrom(): string {
  return (
    process.env.MAIL_FROM ??
    process.env.LEADS_NOTIFY_FROM ?? // older name, kept working
    process.env.SMTP_USER ??
    "MugUp Website <onboarding@resend.dev>"
  );
}

/** Sends one plain-text email; false = not configured or send failed. */
export async function sendEmail(message: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, RESEND_API_KEY } = process.env;
  try {
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      const transport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        // Gmail app passwords are often pasted with spaces — strip them.
        auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, "") },
      });
      await transport.sendMail({
        from: mailFrom(),
        to: message.to,
        subject: message.subject,
        text: message.text,
      });
      return true;
    }
    if (RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: mailFrom(),
          to: [message.to],
          subject: message.subject,
          text: message.text,
        }),
      });
      return response.ok;
    }
  } catch {
    // fall through — email must never crash the calling action
  }
  return false;
}

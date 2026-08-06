import "server-only";

// New-lead email notification via Resend's REST API (no SDK needed).
// Fully env-gated: without RESEND_API_KEY + LEADS_NOTIFY_EMAIL it's a no-op,
// and a notification failure must never break the visitor's submission.

export async function notifyNewLead(lead: {
  form: "booking" | "contact";
  locale: "en" | "ua";
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  hasFile: boolean;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const kind = lead.form === "booking" ? "Book Assessment" : "Contact";
  const lines = [
    `Form: ${kind} (${lead.locale.toUpperCase()} site)`,
    `Name: ${lead.fullName}`,
    `Email: ${lead.email}`,
    lead.phone ? `Phone: ${lead.phone}` : null,
    lead.subject ? `Subject: ${lead.subject}` : null,
    lead.hasFile ? "Attachment: yes (open the enquiry in the admin panel)" : null,
    "",
    lead.message ?? "(no message)",
    "",
    "Open the admin panel to reply and set the status.",
  ].filter((line): line is string => line !== null);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEADS_NOTIFY_FROM ?? "MugUp Website <onboarding@resend.dev>",
        to: [to],
        subject: `New ${kind} enquiry — ${lead.fullName}`,
        text: lines.join("\n"),
      }),
    });
  } catch {
    // Never surface notification failures to the visitor.
  }
}

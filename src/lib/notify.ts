import "server-only";

import {
  LEAD_FORM_LABELS,
  type LeadForm,
  type NotificationEvent,
} from "@/lib/db-types";
import { getData, isBackendConfigured } from "@/lib/data";
import { sendEmail } from "@/lib/email";

// Notifications have two channels:
//  1. The in-admin notification centre (primary): every event lands in the
//     `notifications` feed; team members see the ones they subscribed to on
//     /admin/notifications.
//  2. Email (optional copy): enquiry/review events also go to
//     LEADS_NOTIFY_EMAIL through the shared transport in src/lib/email.ts —
//     see docs/EMAIL-SETUP.md.
// Either channel failing must never break the visitor's submission.

async function recordInAdmin(
  event: NotificationEvent,
  title: string,
  detail = "",
): Promise<void> {
  if (!isBackendConfigured()) return;
  try {
    const data = await getData();
    await data.notifications.record(event, title, detail);
  } catch {
    // never break the calling action
  }
}

async function sendEmailCopy(subject: string, text: string): Promise<void> {
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!to) return;
  await sendEmail({ to, subject, text });
}

const LEAD_EVENT: Record<LeadForm, NotificationEvent> = {
  booking: "lead_booking",
  contact: "lead_contact",
  partnership: "lead_partnership",
};

export async function notifyNewLead(lead: {
  form: LeadForm;
  locale: "en" | "ua";
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  hasFile: boolean;
}): Promise<void> {
  const kind = LEAD_FORM_LABELS[lead.form];
  // Feed detail stays PII-light (name only) — the feed is visible to the
  // whole team while contact details sit behind the leads permissions.
  await recordInAdmin(
    LEAD_EVENT[lead.form],
    `${kind}: ${lead.fullName}`,
    `${lead.locale.toUpperCase()} site — open Enquiries to view and take it.`,
  );

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
  await sendEmailCopy(`New ${kind} enquiry — ${lead.fullName}`, lines.join("\n"));
}

export async function notifyNewReview(review: {
  authorName: string;
  quote: string;
  rating: number | null;
}): Promise<void> {
  const stars = review.rating ? ` (${"★".repeat(review.rating)})` : "";
  await recordInAdmin(
    "review_new",
    `New review from ${review.authorName}${stars}`,
    `“${review.quote.slice(0, 120)}${review.quote.length > 120 ? "…" : ""}” — awaiting moderation.`,
  );

  const lines = [
    `From: ${review.authorName}`,
    review.rating ? `Rating: ${"★".repeat(review.rating)}` : null,
    "",
    `“${review.quote}”`,
    "",
    "The review is awaiting moderation — nothing appears on the site until it is approved.",
  ].filter((line): line is string => line !== null);
  await sendEmailCopy(`New review awaiting moderation — ${review.authorName}`, lines.join("\n"));
}

/** Feed-only (no email copy): a post went live or was queued. */
export async function notifyPostPublished(post: {
  title: string;
  status: "published" | "scheduled";
  actorEmail: string;
}): Promise<void> {
  await recordInAdmin(
    "post_published",
    post.status === "published" ? `Post published: ${post.title}` : `Post scheduled: ${post.title}`,
    `By ${post.actorEmail}.`,
  );
}

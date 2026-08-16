import type { LeadSource } from "@/lib/db-types";

// The public forms submit the option LABEL the visitor saw (the content
// files own all copy — see src/content). Keyword matching keeps the mapping
// resilient to small label edits in either locale; anything unrecognised is
// stored as null and the team can set the source in the admin panel.

const MATCHERS: [RegExp, LeadSource][] = [
  // Before the generic "facebook" pattern.
  [/facebook[\s-]*(group|груп)/i, "facebook_groups"],
  [/google|гугл/i, "google_search"],
  [/instagram|інстаграм/i, "instagram"],
  [/facebook|фейсбук/i, "facebook"],
  [/tik\s*tok|тік\s*ток/i, "tiktok"],
  [/telegram|телеграм/i, "telegram"],
  [/referral|recommend|рекоменда|друз|родин/i, "referral"],
  [/event|поді/i, "event"],
  [/flyer|leaflet|флаєр|листівк/i, "flyer"],
  [/school|школ/i, "school"],
  [/partner|партнер/i, "partner"],
  [/other|інше/i, "other"],
];

export function normaliseLeadSource(label: string | null): LeadSource | null {
  if (!label) return null;
  for (const [pattern, source] of MATCHERS) {
    if (pattern.test(label)) return source;
  }
  return null;
}

/** Contact-form subjects that mark the enquiry as a partnership one. */
export function isPartnershipSubject(subject: string | null): boolean {
  return subject !== null && /partnership|партнерств/i.test(subject);
}

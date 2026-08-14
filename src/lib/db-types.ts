import type { Permission, Role } from "@/lib/permissions";

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  permissions: Permission[];
  created_at: string;
}

/** Admin-defined role preset (next to the built-in admin/manager/editor). */
export interface CustomRoleRow {
  slug: string;
  name: string;
  permissions: Permission[];
  created_at: string;
}

/* ---------- Leads (enquiries) ---------- */

/** Pipeline order — the dashboard treats later stages as "reached earlier ones". */
export type LeadStatus =
  | "new"
  | "contacted"
  | "assessment_booked"
  | "assessment_completed"
  | "offer"
  | "programme_recommended"
  | "enrolled"
  | "closed"
  | "lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "assessment_booked",
  "assessment_completed",
  "offer",
  "programme_recommended",
  "enrolled",
  "closed",
  "lost",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  assessment_booked: "Assessment Booked",
  assessment_completed: "Assessment Completed",
  offer: "Offer",
  programme_recommended: "Programme Recommended",
  enrolled: "Enrolled",
  closed: "Closed",
  lost: "Lost",
};

export type LostReason =
  | "price"
  | "timing"
  | "no_suitable_programme"
  | "no_response"
  | "chose_another_provider"
  | "location"
  | "not_ready_yet"
  | "other";

export const LOST_REASONS: LostReason[] = [
  "price",
  "timing",
  "no_suitable_programme",
  "no_response",
  "chose_another_provider",
  "location",
  "not_ready_yet",
  "other",
];

export const LOST_REASON_LABELS: Record<LostReason, string> = {
  price: "Price",
  timing: "Timing",
  no_suitable_programme: "No suitable programme",
  no_response: "No response",
  chose_another_provider: "Chose another provider",
  location: "Location",
  not_ready_yet: "Not ready yet",
  other: "Other",
};

export type LeadSource =
  | "google_search"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "telegram"
  | "referral"
  | "event"
  | "flyer"
  | "school"
  | "partner"
  | "facebook_groups"
  | "other";

export const LEAD_SOURCES: LeadSource[] = [
  "google_search",
  "instagram",
  "facebook",
  "tiktok",
  "telegram",
  "referral",
  "event",
  "flyer",
  "school",
  "partner",
  "facebook_groups",
  "other",
];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  google_search: "Google Search",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  telegram: "Telegram",
  referral: "Referral",
  event: "Event",
  flyer: "Flyer",
  school: "School",
  partner: "Partner",
  facebook_groups: "Facebook groups",
  other: "Other",
};

export type LeadForm = "booking" | "contact" | "partnership";

export const LEAD_FORMS: LeadForm[] = ["booking", "contact", "partnership"];

export const LEAD_FORM_LABELS: Record<LeadForm, string> = {
  booking: "Book Assessment",
  contact: "Contact form",
  partnership: "Partnership",
};

export interface LeadRow {
  id: string;
  created_at: string;
  updated_at: string;
  form: LeadForm;
  locale: "en" | "ua";
  full_name: string;
  email: string;
  phone: string | null;
  who_for: string | null;
  pathway_interest: string | null;
  preferred_format: string | null;
  subject: string | null;
  message: string | null;
  file_path: string | null;
  status: LeadStatus;
  notes: string;
  programme: string;
  source: LeadSource | null;
  owner_id: string | null;
  next_action: string;
  /** ISO date (yyyy-mm-dd) the next action is due, or null. */
  next_action_date: string | null;
  lost_reason: LostReason | null;
  lost_reason_note: string;
}

/* ---------- Reviews ---------- */

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewAudience = "parent" | "adult_learner" | "student" | "corporate_client";

export const REVIEW_AUDIENCES: ReviewAudience[] = [
  "parent",
  "adult_learner",
  "student",
  "corporate_client",
];

export const REVIEW_AUDIENCE_LABELS: Record<ReviewAudience, string> = {
  parent: "Parent",
  adult_learner: "Adult learner",
  student: "Student",
  corporate_client: "Corporate client",
};

export interface ReviewRow {
  id: string;
  created_at: string;
  author_name: string;
  author_tag: string;
  quote: string;
  source: "website" | "google" | "other";
  rating: number | null;
  status: ReviewStatus;
  moderated_by: string | null;
  moderated_at: string | null;
  /** Programme/area the review relates to (free text: "GCSE", "IELTS", …). */
  programme: string;
  audience: ReviewAudience | null;
  /** Featured reviews are the homepage testimonials pool. */
  featured: boolean;
}

/* ---------- Insights posts ---------- */

export type PostStatus = "draft" | "scheduled" | "published";

export const POST_STATUSES: PostStatus[] = ["draft", "scheduled", "published"];

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
};

export interface CategoryRow {
  slug: string;
  label_en: string;
  label_ua: string;
  sort: number;
}

export interface PostRow {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  locale: "en" | "ua";
  category: string;
  title: string;
  description: string;
  body_md: string;
  /** Layout-aware body (builder v2), jsonb; null = legacy post → render body_md.
   *  Validate through sanitizePostBlocks() before rendering — jsonb is untyped. */
  body_blocks: unknown | null;
  status: PostStatus;
  /** For scheduled posts: the moment the article goes live. */
  published_at: string | null;
  created_by: string | null;
  author: string;
  hero_image_url: string | null;
  hero_image_alt: string;
  cta_label: string;
  cta_url: string;
}

/* ---------- Notification centre (in-admin feed) ---------- */

export type NotificationEvent =
  | "lead_booking"
  | "lead_contact"
  | "lead_partnership"
  | "review_new"
  | "post_published";

export const NOTIFICATION_EVENTS: NotificationEvent[] = [
  "lead_booking",
  "lead_contact",
  "lead_partnership",
  "review_new",
  "post_published",
];

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  lead_booking: "New Book Assessment enquiry",
  lead_contact: "New Contact form enquiry",
  lead_partnership: "New Partnership enquiry",
  review_new: "New review awaiting moderation",
  post_published: "Post published or scheduled",
};

/** One feed entry, shown in the admin Notifications section. */
export interface NotificationRow {
  id: string;
  created_at: string;
  event: NotificationEvent;
  title: string;
  detail: string;
}

/** Which events a team member sees; last_seen powers the NEW badge. */
export interface NotificationSubscriptionRow {
  profile_id: string;
  events: NotificationEvent[];
  last_seen: string;
}

/* ---------- Activity log ---------- */

export interface ActivityRow {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string;
  detail: string;
}

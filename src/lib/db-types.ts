import type { Permission, Role } from "@/lib/permissions";

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  permissions: Permission[];
  created_at: string;
}

export type LeadStatus = "new" | "contacted" | "in_progress" | "converted" | "closed";
export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "in_progress",
  "converted",
  "closed",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In progress",
  converted: "Converted",
  closed: "Closed",
};

export const LEAD_FORM_LABELS: Record<LeadRow["form"], string> = {
  booking: "Book Assessment",
  contact: "Contact form",
};

export interface LeadRow {
  id: string;
  created_at: string;
  updated_at: string;
  form: "booking" | "contact";
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
}

export type ReviewStatus = "pending" | "approved" | "rejected";

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
}

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
  status: "draft" | "published";
  published_at: string | null;
  created_by: string | null;
}

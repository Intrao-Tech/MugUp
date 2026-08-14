// Vendor-neutral data-access contract. Pages, actions and guards import ONLY
// from this layer (via src/lib/data). Swapping Supabase for anything else
// (raw Postgres + S3 + Auth.js, ...) = implement DataBackend in
// src/lib/data/<backend>/ and register it in src/lib/data/index.ts.
// The Row DTOs in src/lib/db-types.ts are the canonical shapes every backend
// must return.

import type {
  ActivityRow,
  CategoryRow,
  CustomRoleRow,
  LeadForm,
  LeadRow,
  LeadSource,
  LeadStatus,
  LostReason,
  NotificationEvent,
  NotificationRow,
  NotificationSubscriptionRow,
  PostRow,
  PostStatus,
  ProfileRow,
  ReviewAudience,
  ReviewRow,
  ReviewStatus,
} from "@/lib/db-types";
import type { Permission, Role } from "@/lib/permissions";
import type { PostBlock } from "@/lib/post-blocks";

/** Uniform outcome for writes: empty object = success. */
export interface Result {
  error?: string;
}

export interface AuthPort {
  /** Signed-in user id for the current request, or null. */
  getUserId(): Promise<string | null>;
  signInWithPassword(email: string, password: string): Promise<Result>;
  signOut(): Promise<void>;
  /** Change the signed-in user's own password. */
  updateOwnPassword(newPassword: string): Promise<Result>;
  /** True if `password` matches the signed-in user's current password. */
  verifyOwnPassword(password: string): Promise<boolean>;
}

export interface TeamPort {
  getProfile(userId: string): Promise<ProfileRow | null>;
  listProfiles(): Promise<ProfileRow[]>;
  updateAccess(userId: string, role: Role, permissions: Permission[]): Promise<Result>;
  /**
   * Privileged: invite a team member by email. The invite letter links to
   * `${redirectOrigin}/admin/welcome`, where the invitee sets a password.
   */
  inviteAccount(input: {
    email: string;
    fullName: string;
    role: Role;
    permissions: Permission[];
    redirectOrigin: string;
  }): Promise<Result>;
  /** Privileged: removes the login and (via cascade) its profile. */
  deleteAccount(userId: string): Promise<Result>;
  /** Emails a password-reset link that lands on `${redirectOrigin}/admin/welcome`. */
  sendPasswordReset(email: string, redirectOrigin: string): Promise<Result>;
  /* Custom role presets (built-ins live in src/lib/permissions.ts). */
  listCustomRoles(): Promise<CustomRoleRow[]>;
  addCustomRole(input: { slug: string; name: string; permissions: Permission[] }): Promise<Result>;
  deleteCustomRole(slug: string): Promise<Result>;
}

export interface NewLead {
  form: LeadForm;
  locale: "en" | "ua";
  fullName: string;
  email: string;
  phone: string | null;
  whoFor: string | null;
  pathwayInterest: string | null;
  preferredFormat: string | null;
  subject: string | null;
  message: string | null;
  filePath: string | null;
  /** Normalised "How did you hear about us?" answer, when given. */
  source: LeadSource | null;
}

export interface LeadFilter {
  status?: LeadStatus;
  form?: LeadForm;
  /** Case-insensitive match on name or email. */
  search?: string;
  sort?: "newest" | "oldest";
  limit?: number;
}

/** CRM fields the team maintains on an enquiry (all set together). */
export interface LeadDetailsInput {
  programme: string;
  source: LeadSource | null;
  ownerId: string | null;
  nextAction: string;
  /** ISO date (yyyy-mm-dd) or null. */
  nextActionDate: string | null;
}

/**
 * Skinny, PII-free projection for the dashboard. Backends may serve it via a
 * privileged client — pages MUST gate it behind the analytics permission.
 */
export interface LeadStatsRow {
  created_at: string;
  status: LeadStatus;
  source: LeadSource | null;
  pathway_interest: string | null;
  next_action_date: string | null;
}

export interface LeadsPort {
  list(filter?: LeadFilter): Promise<LeadRow[]>;
  get(id: string): Promise<LeadRow | null>;
  countByStatus(status: LeadStatus): Promise<number>;
  /** `lost` is required when the status is "lost" and cleared otherwise. */
  updateStatus(
    id: string,
    status: LeadStatus,
    lost?: { reason: LostReason; note: string },
  ): Promise<Result>;
  updateDetails(id: string, details: LeadDetailsInput): Promise<Result>;
  updateNotes(id: string, notes: string): Promise<Result>;
  /** Privileged: public form submission (visitors have no direct DB access). */
  submit(lead: NewLead): Promise<Result>;
  /** Privileged aggregate read (no PII columns) — dashboard only. */
  statsRows(): Promise<LeadStatsRow[]>;
}

export interface ReviewInput {
  authorName: string;
  authorTag: string;
  quote: string;
  source: "website" | "google" | "other";
  rating: number | null;
  programme: string;
  audience: ReviewAudience | null;
}

/** What the public site needs to render a testimonial. */
export interface FeaturedReview {
  author_name: string;
  author_tag: string;
  quote: string;
  rating: number | null;
  programme: string;
  audience: ReviewAudience | null;
}

export interface ReviewsPort {
  listAll(): Promise<ReviewRow[]>;
  countByStatus(status: ReviewStatus): Promise<number>;
  /** Team-side manual add (e.g. importing a real Google review). */
  add(input: ReviewInput): Promise<Result>;
  /** Privileged: public "leave a review" form; always lands as pending. */
  submitPublic(
    input: Omit<ReviewInput, "source" | "programme" | "audience" | "featured">,
  ): Promise<Result>;
  setStatus(id: string, status: ReviewStatus, moderatorId: string): Promise<Result>;
  /** Marketing fields on an existing review. */
  updateMeta(
    id: string,
    meta: { programme: string; audience: ReviewAudience | null; featured: boolean },
  ): Promise<Result>;
  /** Permanent removal (moderators only — RLS enforces the permission). */
  delete(id: string): Promise<Result>;
  /** Public site: approved + featured reviews, newest first (anonymous). */
  listFeatured(): Promise<FeaturedReview[]>;
}

export interface PostSaveInput {
  slug: string;
  locale: "en" | "ua";
  category: string;
  title: string;
  description: string;
  bodyMd: string;
  /** Validated layout blocks (builder v2); null clears → legacy Markdown rendering. */
  bodyBlocks: PostBlock[] | null;
  status: PostStatus;
  /** undefined = keep the stored value untouched. */
  publishedAt?: string | null;
  author: string;
  heroImageUrl: string | null;
  heroImageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface PostsPort {
  listAll(): Promise<PostRow[]>;
  get(id: string): Promise<PostRow | null>;
  countByStatus(status: PostStatus): Promise<number>;
  create(input: PostSaveInput, createdBy: string): Promise<Result>;
  update(id: string, input: PostSaveInput): Promise<Result>;
  delete(id: string): Promise<Result>;
  /**
   * Public site: live posts, newest first (anonymous access). "Live" =
   * published, plus scheduled posts whose publication time has passed.
   */
  listPublished(locale: "en" | "ua"): Promise<PostRow[]>;
  getPublished(locale: "en" | "ua", slug: string): Promise<PostRow | null>;
  /** Categories are public data (labels appear on the site). */
  listCategories(): Promise<CategoryRow[]>;
  addCategory(input: { slug: string; labelEn: string; labelUa: string }): Promise<Result>;
  /** Fails while any post still uses the category (FK restrict). */
  deleteCategory(slug: string): Promise<Result>;
}

export interface FileStoragePort {
  /** Privileged: stores a visitor-uploaded file under the given opaque path. */
  uploadLeadFile(path: string, file: File): Promise<Result>;
  /** Short-lived download link; null when missing or not permitted. */
  getLeadFileUrl(path: string, expiresInSeconds: number): Promise<string | null>;
  /** Privileged: stores a post image; returns its permanent public URL. */
  uploadPostImage(path: string, file: File): Promise<{ url?: string; error?: string }>;
}

export interface NotificationsPort {
  /** Feed entries for the given events, newest first (empty events = []). */
  feed(events: NotificationEvent[], limit?: number): Promise<NotificationRow[]>;
  /** Privileged append (public form actions have no session); never throws. */
  record(event: NotificationEvent, title: string, detail?: string): Promise<void>;
  /** All members' subscriptions (managers; RLS narrows others to their own row). */
  listSubscriptions(): Promise<NotificationSubscriptionRow[]>;
  getSubscription(profileId: string): Promise<NotificationSubscriptionRow | null>;
  /** Upsert events for a member (own row, or any row for managers). */
  setSubscription(profileId: string, events: NotificationEvent[]): Promise<Result>;
  /** Reset the member's NEW badge. */
  markSeen(profileId: string): Promise<Result>;
}

export interface SettingsPort {
  /** Team-readable global setting, or null when unset. */
  get(key: string): Promise<string | null>;
  /** users.manage only (RLS-enforced). */
  set(key: string, value: string): Promise<Result>;
}

export interface ActivityEntry {
  actorId: string | null;
  actorEmail: string;
  /** Dot-scoped verb, e.g. "lead.status", "leads.export", "user.permissions". */
  action: string;
  entity?: string;
  entityId?: string;
  detail?: string;
}

export interface ActivityPort {
  /**
   * Privileged append-only audit write; never throws (an audit failure must
   * not break the action it documents).
   */
  record(entry: ActivityEntry): Promise<void>;
  /** Newest first; from/to are ISO timestamps (from inclusive, to exclusive). */
  list(options?: { limit?: number; from?: string; to?: string }): Promise<ActivityRow[]>;
}

export interface DataBackend {
  auth: AuthPort;
  team: TeamPort;
  leads: LeadsPort;
  reviews: ReviewsPort;
  posts: PostsPort;
  files: FileStoragePort;
  activity: ActivityPort;
  notifications: NotificationsPort;
  settings: SettingsPort;
}

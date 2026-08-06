// Vendor-neutral data-access contract. Pages, actions and guards import ONLY
// from this layer (via src/lib/data). Swapping Supabase for anything else
// (raw Postgres + S3 + Auth.js, ...) = implement DataBackend in
// src/lib/data/<backend>/ and register it in src/lib/data/index.ts.
// The Row DTOs in src/lib/db-types.ts are the canonical shapes every backend
// must return.

import type {
  CategoryRow,
  LeadRow,
  LeadStatus,
  PostRow,
  ProfileRow,
  ReviewRow,
  ReviewStatus,
} from "@/lib/db-types";
import type { Permission, Role } from "@/lib/permissions";

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
}

export interface TeamPort {
  getProfile(userId: string): Promise<ProfileRow | null>;
  listProfiles(): Promise<ProfileRow[]>;
  updateAccess(userId: string, role: Role, permissions: Permission[]): Promise<Result>;
  /** Privileged: creates the login + its profile. No self-registration exists. */
  createAccount(input: {
    email: string;
    fullName: string;
    password: string;
    role: Role;
    permissions: Permission[];
  }): Promise<Result>;
  /** Privileged: an administrator issues a new password to a team member. */
  setPassword(userId: string, newPassword: string): Promise<Result>;
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
}

export interface NewLead {
  form: "booking" | "contact";
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
}

export interface LeadFilter {
  status?: LeadStatus;
  form?: "booking" | "contact";
  /** Case-insensitive match on name or email. */
  search?: string;
  sort?: "newest" | "oldest";
  limit?: number;
}

export interface LeadsPort {
  list(filter?: LeadFilter): Promise<LeadRow[]>;
  get(id: string): Promise<LeadRow | null>;
  countByStatus(status: LeadStatus): Promise<number>;
  updateStatus(id: string, status: LeadStatus): Promise<Result>;
  updateNotes(id: string, notes: string): Promise<Result>;
  /** Privileged: public form submission (visitors have no direct DB access). */
  submit(lead: NewLead): Promise<Result>;
}

export interface ReviewInput {
  authorName: string;
  authorTag: string;
  quote: string;
  source: "website" | "google" | "other";
  rating: number | null;
}

export interface ReviewsPort {
  listAll(): Promise<ReviewRow[]>;
  countByStatus(status: ReviewStatus): Promise<number>;
  /** Team-side manual add (e.g. importing a real Google review). */
  add(input: ReviewInput): Promise<Result>;
  /** Privileged: public "leave a review" form; always lands as pending. */
  submitPublic(input: Omit<ReviewInput, "source">): Promise<Result>;
  setStatus(id: string, status: ReviewStatus, moderatorId: string): Promise<Result>;
}

export interface PostSaveInput {
  slug: string;
  locale: "en" | "ua";
  category: string;
  title: string;
  description: string;
  bodyMd: string;
  status: "draft" | "published";
  /** undefined = keep the stored value untouched. */
  publishedAt?: string | null;
}

export interface PostsPort {
  listAll(): Promise<PostRow[]>;
  get(id: string): Promise<PostRow | null>;
  countByStatus(status: "draft" | "published"): Promise<number>;
  create(input: PostSaveInput, createdBy: string): Promise<Result>;
  update(id: string, input: PostSaveInput): Promise<Result>;
  delete(id: string): Promise<Result>;
  /** Public site: published posts, newest first (anonymous access). */
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

export interface DataBackend {
  auth: AuthPort;
  team: TeamPort;
  leads: LeadsPort;
  reviews: ReviewsPort;
  posts: PostsPort;
  files: FileStoragePort;
}

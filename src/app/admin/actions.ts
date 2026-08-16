"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getData } from "@/lib/data";
import { requireProfile } from "@/lib/auth-guard";
import { isPermission, ROLE_PRESETS, type BuiltInRole, type Permission } from "@/lib/permissions";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LOST_REASONS,
  NOTIFICATION_EVENT_PERMISSION,
  NOTIFICATION_EVENTS,
  REVIEW_AUDIENCES,
  type LeadSource,
  type LeadStatus,
  type LostReason,
  type NotificationEvent,
  type ProfileRow,
  type ReviewAudience,
} from "@/lib/db-types";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { notifyPostPublished } from "@/lib/notify";
import { isStrongPassword } from "@/lib/password";
import { parsePostBlocksJson, sanitizePostBlocks, type PostBlock } from "@/lib/post-blocks";
import { slugify } from "@/lib/slugify";
import { adminSiteOrigin } from "@/lib/site";
import { ukWallTimeToIso } from "@/lib/uk-time";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function requireId(formData: FormData, backTo: string): string {
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) redirect(`${backTo}?error=input`);
  return id;
}

/** Only ever redirect back to our own admin pages — never to a caller-supplied host. */
function safeBack(formData: FormData, fallback: string): string {
  const back = String(formData.get("back") ?? "");
  return back.startsWith("/admin/") ? back : fallback;
}

/** Audit trail append; failures never break the action being documented. */
async function logActivity(
  actor: ProfileRow,
  action: string,
  entity: string,
  entityId: string,
  detail: string,
): Promise<void> {
  const data = await getData();
  await data.activity.record({
    actorId: actor.id,
    actorEmail: actor.email,
    action,
    entity,
    entityId,
    detail,
  });
}

/* ---------- auth ---------- */

export async function signIn(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  // Trimmed: temporary passwords are copied out of an email, and a stray
  // trailing space/newline made perfectly valid credentials "not work".
  const password = String(formData.get("password") ?? "").trim();
  if (!email || !password) redirect("/admin/login?error=missing");
  const data = await getData();
  const { error } = await data.auth.signInWithPassword(email, password);
  if (error) redirect("/admin/login?error=invalid");
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const data = await getData();
  await data.auth.signOut();
  redirect("/admin/login");
}

/* ---------- leads ---------- */

export async function updateLeadStatus(formData: FormData): Promise<void> {
  const profile = await requireProfile("leads.manage");
  const id = requireId(formData, "/admin/leads");
  const back = safeBack(formData, "/admin/leads");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!LEAD_STATUSES.includes(status)) redirect("/admin/leads?error=input");

  let lost: { reason: LostReason; note: string } | undefined;
  if (status === "lost") {
    const reason = String(formData.get("lost_reason") ?? "") as LostReason;
    const note = String(formData.get("lost_reason_note") ?? "").trim().slice(0, 500);
    // The reason (and a note for "other") is required — the list page has no
    // reason field, so send the user to the detail page to fill it in.
    if (!LOST_REASONS.includes(reason) || (reason === "other" && !note)) {
      redirect(`/admin/leads/${id}?error=lost-reason`);
    }
    lost = { reason, note };
  }

  const data = await getData();
  const before = await data.leads.get(id);
  if (!before) redirect("/admin/leads?error=input");
  const { error } = await data.leads.updateStatus(id, status, lost);
  if (error) redirect("/admin/leads?error=save");
  await logActivity(
    profile,
    "lead.status",
    "lead",
    id,
    `${LEAD_STATUS_LABELS[before.status]} → ${LEAD_STATUS_LABELS[status]}` +
      (lost ? ` (${lost.reason}${lost.note ? `: ${lost.note}` : ""})` : ""),
  );
  revalidatePath("/admin/leads");
  redirect(back);
}

export async function updateLeadDetails(formData: FormData): Promise<void> {
  const profile = await requireProfile("leads.manage");
  const id = requireId(formData, "/admin/leads");

  const rawSource = String(formData.get("source") ?? "");
  const source = (LEAD_SOURCES as string[]).includes(rawSource)
    ? (rawSource as LeadSource)
    : null;
  const rawOwner = String(formData.get("owner_id") ?? "");
  if (rawOwner && !UUID_RE.test(rawOwner)) redirect(`/admin/leads/${id}?error=input`);

  const data = await getData();
  const existing = await data.leads.get(id);
  if (!existing) redirect("/admin/leads?error=input");

  // The next-action fields are hidden for closed/lost enquiries — an absent
  // field keeps the stored value instead of silently clearing it.
  const rawNextAction = formData.get("next_action");
  const rawNextDate = formData.get("next_action_date");
  const rawDate = rawNextDate === null ? (existing.next_action_date ?? "") : String(rawNextDate);
  if (rawDate && !DATE_RE.test(rawDate)) redirect(`/admin/leads/${id}?error=input`);

  const { error } = await data.leads.updateDetails(id, {
    programme: String(formData.get("programme") ?? "").trim().slice(0, 200),
    source,
    ownerId: rawOwner || null,
    nextAction:
      rawNextAction === null
        ? existing.next_action
        : String(rawNextAction).trim().slice(0, 300),
    nextActionDate: rawDate || null,
  });
  if (error) redirect(`/admin/leads/${id}?error=save`);
  await logActivity(profile, "lead.update", "lead", id, "programme/source/owner/next action");
  revalidatePath("/admin/leads");
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function saveLeadNotes(formData: FormData): Promise<void> {
  const profile = await requireProfile("leads.manage");
  const id = requireId(formData, "/admin/leads");
  const notes = String(formData.get("notes") ?? "").slice(0, 5000);
  const data = await getData();
  const { error } = await data.leads.updateNotes(id, notes);
  if (!error) await logActivity(profile, "lead.notes", "lead", id, "internal notes edited");
  redirect(`/admin/leads/${id}${error ? "?error=save" : "?saved=1"}`);
}

/* ---------- reviews ---------- */

/** Featured/approved reviews feed the homepage testimonials — refresh it. */
function revalidateHome(): void {
  revalidatePath("/en");
  revalidatePath("/ua");
}

function audienceFromForm(formData: FormData): ReviewAudience | null {
  const raw = String(formData.get("audience") ?? "");
  return (REVIEW_AUDIENCES as string[]).includes(raw) ? (raw as ReviewAudience) : null;
}

export async function addReview(formData: FormData): Promise<void> {
  await requireProfile("reviews.moderate");
  const authorName = String(formData.get("author_name") ?? "").trim();
  const authorTag = String(formData.get("author_tag") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const rawSource = String(formData.get("source") ?? "website");
  const source = (["website", "google", "other"].includes(rawSource) ? rawSource : "other") as
    | "website"
    | "google"
    | "other";
  const ratingRaw = Number(formData.get("rating"));
  const rating = Number.isInteger(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;
  if (!authorName || !quote) redirect("/admin/reviews?error=input");
  const data = await getData();
  const { error } = await data.reviews.add({
    authorName,
    authorTag,
    quote,
    source,
    rating,
    programme: String(formData.get("programme") ?? "").trim().slice(0, 100),
    audience: audienceFromForm(formData),
  });
  redirect(`/admin/reviews${error ? "?error=save" : "?saved=1"}`);
}

export async function setReviewStatus(formData: FormData): Promise<void> {
  const profile = await requireProfile("reviews.moderate");
  const id = requireId(formData, "/admin/reviews");
  const status = String(formData.get("status") ?? "");
  if (!["pending", "approved", "rejected"].includes(status)) {
    redirect("/admin/reviews?error=input");
  }
  const data = await getData();
  const { error } = await data.reviews.setStatus(
    id,
    status as "pending" | "approved" | "rejected",
    profile.id,
  );
  if (!error) {
    await logActivity(profile, "review.status", "review", id, status);
    revalidateHome();
  }
  redirect(`/admin/reviews${error ? "?error=save" : ""}`);
}

export async function updateReviewMeta(formData: FormData): Promise<void> {
  const profile = await requireProfile("reviews.moderate");
  const id = requireId(formData, "/admin/reviews");
  const featured = formData.get("featured") === "on";
  const data = await getData();
  const { error } = await data.reviews.updateMeta(id, {
    programme: String(formData.get("programme") ?? "").trim().slice(0, 100),
    audience: audienceFromForm(formData),
    featured,
  });
  if (!error) {
    await logActivity(
      profile,
      "review.meta",
      "review",
      id,
      featured ? "featured on homepage" : "not featured",
    );
    revalidateHome();
  }
  redirect(`/admin/reviews${error ? "?error=save" : "?saved=1"}`);
}

export async function deleteReview(formData: FormData): Promise<void> {
  const profile = await requireProfile("reviews.moderate");
  const id = requireId(formData, "/admin/reviews");
  const data = await getData();
  // Fetched first so the activity log keeps a trace of what was removed.
  const review = (await data.reviews.listAll()).find((r) => r.id === id);
  const { error } = await data.reviews.delete(id);
  if (!error) {
    await logActivity(
      profile,
      "review.delete",
      "review",
      id,
      review ? `${review.author_name}: “${review.quote.slice(0, 80)}”` : "deleted",
    );
    // A featured review may have been on the homepage.
    revalidateHome();
  }
  redirect(`/admin/reviews${error ? "?error=save" : "?deleted=1"}`);
}

/* ---------- notification centre ---------- */

function notificationEventsFromForm(formData: FormData): NotificationEvent[] {
  const chosen = formData.getAll("events").map(String);
  return NOTIFICATION_EVENTS.filter((event) => chosen.includes(event));
}


/** Clicking a feed entry: mark THAT entry read, then jump to its target. */
export async function openNotification(formData: FormData): Promise<void> {
  const me = await requireProfile();
  const id = String(formData.get("id") ?? "");
  const href = String(formData.get("href") ?? "");
  if (!UUID_RE.test(id)) redirect("/admin/notifications");
  const data = await getData();
  await data.notifications.markRead(me.id, [id]);
  // Only in-admin targets — href comes from our own feed rows.
  redirect(href.startsWith("/admin") ? href : "/admin/notifications");
}

export async function markAllNotificationsRead(formData: FormData): Promise<void> {
  const me = await requireProfile();
  const ids = formData
    .getAll("ids")
    .map(String)
    .filter((id) => UUID_RE.test(id));
  const data = await getData();
  await data.notifications.markRead(me.id, ids);
  redirect("/admin/notifications");
}

/* ---------- admin settings ---------- */

export async function updateSessionTimeout(formData: FormData): Promise<void> {
  const me = await requireProfile("users.manage");
  const minutes = Number(String(formData.get("minutes") ?? ""));
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 480) {
    redirect("/admin/account?error=timeout");
  }
  const data = await getData();
  const { error } = await data.settings.set("session_timeout_minutes", String(minutes));
  if (!error) {
    await logActivity(me, "settings.session-timeout", "settings", "", `${minutes} minutes`);
  }
  redirect(`/admin/account${error ? "?error=save" : "?saved-timeout=1"}`);
}

/* ---------- posts ---------- */

/** Published content changed — refresh the public pages immediately. */
function revalidatePublicInsights(slug: string): void {
  for (const locale of ["en", "ua"]) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/insights`);
    revalidatePath(`/${locale}/insights/${slug}`);
  }
  revalidatePath("/sitemap.xml");
}

export async function deletePost(formData: FormData): Promise<void> {
  const profile = await requireProfile("posts.edit");
  const id = requireId(formData, "/admin/posts");
  const data = await getData();
  const post = await data.posts.get(id);
  if (!post) redirect("/admin/posts?error=input");
  // Removing live or queued content is a publishing-level action.
  if (post.status !== "draft" && !profile.permissions.includes("posts.publish")) {
    redirect(`/admin/posts/${id}?error=publish-denied`);
  }
  const { error } = await data.posts.delete(id);
  if (error) redirect(`/admin/posts/${id}?error=save`);
  await logActivity(profile, "post.delete", "post", id, `${post.title} (${post.status})`);
  revalidatePublicInsights(post.slug);
  redirect("/admin/posts?deleted=1");
}

// The submit buttons carry the intent via per-button formAction — React drops
// a submitter's own name/value for function actions, so a single action
// reading formData.get("intent") silently saved every publish as a draft
// (the original "posts don't update" bug).
export async function savePostDraft(formData: FormData): Promise<void> {
  formData.set("intent", "draft");
  await savePost(formData);
}

export async function savePostPublish(formData: FormData): Promise<void> {
  formData.set("intent", "publish");
  await savePost(formData);
}

export async function savePostSchedule(formData: FormData): Promise<void> {
  formData.set("intent", "schedule");
  await savePost(formData);
}

export async function savePost(formData: FormData): Promise<void> {
  const profile = await requireProfile("posts.edit");
  const rawId = String(formData.get("id") ?? "");
  const id = rawId && UUID_RE.test(rawId) ? rawId : "";
  if (rawId && !id) redirect("/admin/posts?error=input");
  const intent = String(formData.get("intent") ?? "draft");
  const wantPublish = intent === "publish";
  const wantSchedule = intent === "schedule";
  const backTo = id ? `/admin/posts/${id}` : "/admin/posts/new";

  const data = await getData();
  const existing = id ? await data.posts.get(id) : null;
  if (id && !existing) redirect("/admin/posts?error=input");

  /** Absent field (form version without it) = keep the stored value; present
   *  but empty = the user cleared it. Keeps older/partial forms lossless. */
  const textField = (name: string, stored: string, max: number): string => {
    const raw = formData.get(name);
    return raw === null ? stored : String(raw).trim().slice(0, max);
  };

  // Layout blocks (builder v2). Absent field = older form → keep the stored
  // value; present but invalid = reject (the builder always emits valid JSON,
  // so a failure means tampering or corruption, not user error).
  const rawBlocks = formData.get("body_blocks");
  let bodyBlocks: PostBlock[] | null;
  if (rawBlocks === null) {
    bodyBlocks = existing?.body_blocks ? sanitizePostBlocks(existing.body_blocks) : null;
  } else {
    const trimmed = String(rawBlocks).trim();
    bodyBlocks = trimmed && trimmed !== "[]" ? parsePostBlocksJson(trimmed) : null;
    if (trimmed && trimmed !== "[]" && !bodyBlocks) redirect(`${backTo}?error=blocks`);
  }

  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const rawHeroUrl = formData.get("hero_image_url");
  const heroImageUrl =
    rawHeroUrl === null ? (existing?.hero_image_url ?? null) : String(rawHeroUrl).trim() || null;
  const heroImageAlt = textField("hero_image_alt", existing?.hero_image_alt ?? "", 200);
  const ctaLabel = textField("cta_label", existing?.cta_label ?? "", 80);
  const ctaUrl = textField("cta_url", existing?.cta_url ?? "", 300);
  const input = {
    // Empty slug field -> generated from the title (UA transliterated).
    slug: rawSlug || slugify(title),
    locale: String(formData.get("locale") ?? "en") as "en" | "ua",
    category: String(formData.get("category") ?? ""),
    title,
    description: String(formData.get("description") ?? "").trim(),
    bodyMd: String(formData.get("body_md") ?? ""),
    bodyBlocks,
    author: textField("author", existing?.author ?? "", 120),
    heroImageUrl,
    heroImageAlt,
    ctaLabel,
    ctaUrl,
  };
  // Category validity is enforced by the database (FK to post_categories).
  if (
    !SLUG_RE.test(input.slug) ||
    !input.title ||
    !["en", "ua"].includes(input.locale) ||
    !input.category
  ) {
    redirect(`${backTo}?error=input`);
  }
  if (heroImageUrl && !/^https?:\/\//.test(heroImageUrl)) redirect(`${backTo}?error=input`);
  // Alt text is non-negotiable when there is an image (accessibility + SEO).
  if (heroImageUrl && !heroImageAlt) redirect(`${backTo}?error=alt`);
  // CTA needs both the label and the destination.
  if ((ctaLabel && !ctaUrl) || (ctaUrl && !ctaLabel)) redirect(`${backTo}?error=cta`);
  if (ctaUrl && !/^(\/|https?:\/\/)/.test(ctaUrl)) redirect(`${backTo}?error=cta`);
  if ((wantPublish || wantSchedule) && !profile.permissions.includes("posts.publish")) {
    redirect(`${backTo}?error=publish-denied`);
  }

  let scheduledAt: string | null = null;
  if (wantSchedule) {
    scheduledAt = ukWallTimeToIso(String(formData.get("publish_at") ?? ""));
    if (!scheduledAt) redirect(`${backTo}?error=schedule`);
    if (new Date(scheduledAt).getTime() <= Date.now()) redirect(`${backTo}?error=schedule-past`);
  }

  const status = wantPublish ? "published" : wantSchedule ? "scheduled" : "draft";
  if (id) {
    // Keep the original publication date on republish; a draft save leaves
    // the stored date untouched (undefined) so nothing is lost.
    const publishedAt = wantPublish
      ? (existing?.status === "published" && existing.published_at) || new Date().toISOString()
      : wantSchedule
        ? scheduledAt
        : undefined;
    const { error } = await data.posts.update(id, { ...input, status, publishedAt });
    if (error) redirect(`${backTo}?error=save`);
    // Un-publishing / re-scheduling also has to refresh the site.
    if (status !== "draft" || existing?.status !== "draft") revalidatePublicInsights(input.slug);
    await logActivity(profile, `post.${intent}`, "post", id, input.title);
    if (status !== "draft") {
      await notifyPostPublished({
        title: input.title,
        status,
        actorEmail: profile.email,
        href: `/admin/posts/${id}`,
      });
    }
    redirect("/admin/posts?saved=1");
  } else {
    const { error } = await data.posts.create(
      {
        ...input,
        status,
        publishedAt: wantPublish ? new Date().toISOString() : wantSchedule ? scheduledAt : null,
      },
      profile.id,
    );
    if (error) redirect(`${backTo}?error=save`);
    if (status !== "draft") revalidatePublicInsights(input.slug);
    await logActivity(profile, `post.${intent}`, "post", input.slug, input.title);
    if (status !== "draft") {
      await notifyPostPublished({ title: input.title, status, actorEmail: profile.email });
    }
    redirect("/admin/posts?saved=1");
  }
}

/* ---------- categories & images ---------- */

export async function addCategory(formData: FormData): Promise<void> {
  await requireProfile("posts.edit");
  const labelEn = String(formData.get("label_en") ?? "").trim();
  const labelUa = String(formData.get("label_ua") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase() || slugify(labelEn);
  if (!labelEn || !labelUa || !SLUG_RE.test(slug)) redirect("/admin/posts?error=category-input");
  const data = await getData();
  const { error } = await data.posts.addCategory({ slug, labelEn, labelUa });
  if (!error) {
    revalidatePath("/en/insights");
    revalidatePath("/ua/insights");
  }
  redirect(`/admin/posts${error ? "?error=category-save" : "?saved=1"}`);
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireProfile("posts.edit");
  const slug = String(formData.get("slug") ?? "");
  if (!SLUG_RE.test(slug)) redirect("/admin/posts?error=category-input");
  const data = await getData();
  const { error } = await data.posts.deleteCategory(slug);
  if (!error) {
    revalidatePath("/en/insights");
    revalidatePath("/ua/insights");
  }
  redirect(`/admin/posts${error ? "?error=category-in-use" : "?saved=1"}`);
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Called from the post builder (client) — returns the public image URL. */
export async function uploadPostImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireProfile("posts.edit");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "No file selected." };
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!IMAGE_EXTENSIONS.includes(extension)) {
    return { error: "Only jpg, png, webp or gif images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) return { error: "The image is larger than 5 MB." };
  const safeName = file.name.replace(/[^\w.-]+/g, "_").slice(-80);
  const data = await getData();
  return data.files.uploadPostImage(`${crypto.randomUUID()}/${safeName}`, file);
}

/* ---------- passwords ---------- */


export async function changeOwnPassword(formData: FormData): Promise<void> {
  const me = await requireProfile();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!isStrongPassword(password)) redirect("/admin/account?error=weak");
  if (password !== confirm) redirect("/admin/account?error=mismatch");
  const data = await getData();
  // Proving the current password stops a walk-up attacker with an unlocked
  // screen from silently taking over the account. First-login accounts skip
  // it: they JUST typed their temporary password to get here.
  if (!me.must_change_password) {
    const current = String(formData.get("current") ?? "");
    if (!(await data.auth.verifyOwnPassword(current))) {
      redirect("/admin/account?error=wrong-current");
    }
  }
  const { error } = await data.auth.updateOwnPassword(password);
  redirect(`/admin/account${error ? "?error=save" : "?saved=1"}`);
}

/* ---------- team ---------- */

function permsFromForm(formData: FormData): Permission[] {
  return formData.getAll("permissions").map(String).filter(isPermission);
}

/** Readable 12-char temporary password that always passes the policy
 *  (ambiguous characters excluded — it will be retyped from an email). */
function generateTempPassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  for (;;) {
    const bytes = randomBytes(12);
    const candidate = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
    if (isStrongPassword(candidate)) return candidate;
  }
}

function credentialsEmail(fullName: string, email: string, password: string): string {
  return [
    `Hello ${fullName},`,
    "",
    "Here is your access to the Mug.Up Studio admin panel:",
    "",
    `Panel:    ${adminSiteOrigin()}/admin`,
    `Login:    ${email}`,
    `Password: ${password}`,
    "",
    "This password is temporary — the panel will ask you to set your own the",
    "first time you sign in.",
    "",
    "If you were not expecting this email, ignore it.",
  ].join("\n");
}

/** Permission preset for a role slug (all roles live in the DB);
 *  null = unknown role. */
async function resolveRolePreset(role: string): Promise<Permission[] | null> {
  const data = await getData();
  const row = (await data.team.listRoles()).find((r) => r.slug === role);
  if (row) return row.permissions;
  // Safety net for a database that predates the roles table.
  return role in ROLE_PRESETS ? ROLE_PRESETS[role as BuiltInRole] : null;
}

export async function inviteTeamUser(formData: FormData): Promise<void> {
  const me = await requireProfile("users.manage");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "editor");
  if (!email.includes("@") || !fullName) redirect("/admin/users?error=input");
  const preset = await resolveRolePreset(role);
  if (!preset) redirect("/admin/users?error=input");
  const data = await getData();

  if (isEmailConfigured()) {
    // No links, no tokens: the account is created with a generated temporary
    // password, the member gets login + password by email and MUST set their
    // own password on first sign-in (middleware-enforced).
    const password = generateTempPassword();
    const { error, userId } = await data.team.createInvitedAccount({
      email,
      fullName,
      role,
      permissions: preset,
      password,
    });
    if (error) redirect("/admin/users?error=invite");
    const sent = await sendEmail({
      to: email,
      subject: "Your access to Mug.Up Admin",
      text: credentialsEmail(fullName, email, password),
    });
    if (!sent) {
      // No usable letter went out — remove the half-born account so the
      // invite can simply be retried.
      if (userId) await data.team.deleteAccount(userId);
      redirect("/admin/users?error=invite");
    }
    await logActivity(me, "user.invite", "user", email, `role: ${role}`);
    redirect("/admin/users?invited=1");
  }

  // No email transport configured: the auth provider sends its own invite
  // letter (Mailpit on the local stack).
  const { error } = await data.team.inviteAccount({
    email,
    fullName,
    role,
    permissions: preset,
    redirectOrigin: adminSiteOrigin(),
  });
  if (!error) await logActivity(me, "user.invite", "user", email, `role: ${role}`);
  redirect(`/admin/users${error ? "?error=invite" : "?invited=1"}`);
}

export async function sendPasswordResetEmail(formData: FormData): Promise<void> {
  const me = await requireProfile("users.manage");
  const id = requireId(formData, "/admin/users");
  const data = await getData();
  const target = await data.team.getProfile(id);
  if (!target) redirect("/admin/users?error=input");

  if (isEmailConfigured()) {
    // Same model as invites: a generated temporary password by email,
    // own password forced on the next sign-in.
    const password = generateTempPassword();
    const { error } = await data.team.setPassword(id, password, true);
    if (error) redirect("/admin/users?error=save");
    const sent = await sendEmail({
      to: target.email,
      subject: "Your Mug.Up Admin password was reset",
      text: credentialsEmail(target.full_name || target.email, target.email, password),
    });
    if (!sent) redirect("/admin/users?error=save");
    await logActivity(me, "user.password-reset", "user", id, `new temporary password emailed to ${target.email}`);
    redirect("/admin/users?reset-sent=1");
  }

  const { error } = await data.team.sendPasswordReset(target.email, adminSiteOrigin());
  if (!error) await logActivity(me, "user.password-reset", "user", id, `reset email to ${target.email}`);
  redirect(`/admin/users${error ? "?error=save" : "?reset-sent=1"}`);
}

export async function deleteTeamUser(formData: FormData): Promise<void> {
  const me = await requireProfile("users.manage");
  const id = requireId(formData, "/admin/users");
  // Deleting your own signed-in account would strand the session mid-request.
  if (id === me.id) redirect("/admin/users?error=self-delete");
  const data = await getData();
  const target = await data.team.getProfile(id);
  const { error } = await data.team.deleteAccount(id);
  if (!error) await logActivity(me, "user.delete", "user", id, target?.email ?? "");
  redirect(`/admin/users${error ? "?error=save" : "?removed=1"}`);
}

export async function addRole(formData: FormData): Promise<void> {
  const me = await requireProfile("users.manage");
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const permissions = permsFromForm(formData);
  const slug = slugify(name);
  if (!name || !slug) redirect("/admin/users?error=role-input");
  const data = await getData();
  const { error } = await data.team.addRole({ slug, name, permissions });
  if (!error) {
    await logActivity(me, "role.create", "role", slug, permissions.join(", ") || "(no access)");
  }
  redirect(`/admin/users${error ? "?error=role-save" : "?role-saved=1"}`);
}

/** The role editor's single save: name (custom roles), permissions AND
 *  notification events in one go. The permission set is re-applied to every
 *  member holding the role — a role IS its members' access. */
export async function saveRole(formData: FormData): Promise<void> {
  const me = await requireProfile("users.manage");
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const permissions = permsFromForm(formData);
  // An event is only offered when the role can OPEN its target.
  const events = notificationEventsFromForm(formData).filter((event) =>
    permissions.includes(NOTIFICATION_EVENT_PERMISSION[event]),
  );
  if (!/^[a-z0-9-]+$/.test(slug) || !name) redirect("/admin/users?error=role-input");
  // The admin role losing team management would brick the panel.
  if (slug === "admin" && !permissions.includes("users.manage")) {
    redirect("/admin/users?error=admin-lockout");
  }

  const data = await getData();
  const members = (await data.team.listProfiles()).filter((p) => p.role === slug);
  // The save applies to members — never let it lock YOU out.
  if (!permissions.includes("users.manage") && members.some((p) => p.id === me.id)) {
    redirect("/admin/users?error=self-lockout");
  }

  const { error } = await data.team.updateRole(slug, { name, permissions });
  if (error) redirect("/admin/users?error=role-save");
  await data.notifications.setRoleEvents(slug, events);
  for (const member of members) {
    await data.team.updateAccess(member.id, slug, permissions);
  }
  await logActivity(
    me,
    "role.update",
    "role",
    slug,
    `permissions: ${permissions.join(", ") || "(none)"}; notifications: ${events.join(", ") || "(none)"}; applied to ${members.length} member(s)`,
  );
  redirect("/admin/users?role-saved=1");
}

export async function deleteRole(formData: FormData): Promise<void> {
  const me = await requireProfile("users.manage");
  const slug = String(formData.get("slug") ?? "");
  if (!/^[a-z0-9-]+$/.test(slug)) redirect("/admin/users?error=role-input");
  const data = await getData();
  // Keep accounts consistent: a role in use cannot be deleted.
  const inUse = (await data.team.listProfiles()).some((p) => p.role === slug);
  if (inUse) redirect("/admin/users?error=role-in-use");
  const { error } = await data.team.deleteRole(slug);
  if (!error) await logActivity(me, "role.delete", "role", slug, "");
  redirect(`/admin/users${error ? "?error=role-save" : "?role-deleted=1"}`);
}

export async function updateTeamUser(formData: FormData): Promise<void> {
  const me = await requireProfile("users.manage");
  const id = requireId(formData, "/admin/users");
  const role = String(formData.get("role") ?? "editor");
  const permissions = permsFromForm(formData);
  if (!(await resolveRolePreset(role))) redirect("/admin/users?error=input");
  // Never let an account lock itself out of user management.
  if (id === me.id && !permissions.includes("users.manage")) {
    redirect("/admin/users?error=self-lockout");
  }
  const data = await getData();
  const { error } = await data.team.updateAccess(id, role, permissions);
  if (!error) {
    await logActivity(
      me,
      "user.permissions",
      "user",
      id,
      `role: ${role}; permissions: ${permissions.join(", ") || "(none)"}`,
    );
  }
  redirect(`/admin/users${error ? "?error=save" : "?saved=1"}`);
}

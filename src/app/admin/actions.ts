"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getData } from "@/lib/data";
import { requireProfile } from "@/lib/auth-guard";
import { isPermission, ROLE_PRESETS, type Permission, type Role } from "@/lib/permissions";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/db-types";
import { slugify } from "@/lib/slugify";
import { adminSiteOrigin } from "@/lib/site";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

/* ---------- auth ---------- */

export async function signIn(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
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
  await requireProfile("leads.manage");
  const id = requireId(formData, "/admin/leads");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!LEAD_STATUSES.includes(status)) redirect("/admin/leads?error=input");
  const data = await getData();
  const { error } = await data.leads.updateStatus(id, status);
  if (error) redirect("/admin/leads?error=save");
  revalidatePath("/admin/leads");
  redirect(safeBack(formData, "/admin/leads"));
}

export async function saveLeadNotes(formData: FormData): Promise<void> {
  await requireProfile("leads.manage");
  const id = requireId(formData, "/admin/leads");
  const notes = String(formData.get("notes") ?? "").slice(0, 5000);
  const data = await getData();
  const { error } = await data.leads.updateNotes(id, notes);
  redirect(`/admin/leads/${id}${error ? "?error=save" : "?saved=1"}`);
}

/* ---------- reviews ---------- */

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
  const { error } = await data.reviews.add({ authorName, authorTag, quote, source, rating });
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
  redirect(`/admin/reviews${error ? "?error=save" : ""}`);
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
  // Removing live content is a publishing-level action.
  if (post.status === "published" && !profile.permissions.includes("posts.publish")) {
    redirect(`/admin/posts/${id}?error=publish-denied`);
  }
  const { error } = await data.posts.delete(id);
  if (error) redirect(`/admin/posts/${id}?error=save`);
  revalidatePublicInsights(post.slug);
  redirect("/admin/posts?deleted=1");
}

export async function savePost(formData: FormData): Promise<void> {
  const profile = await requireProfile("posts.edit");
  const rawId = String(formData.get("id") ?? "");
  const id = rawId && UUID_RE.test(rawId) ? rawId : "";
  if (rawId && !id) redirect("/admin/posts?error=input");
  const wantPublish = formData.get("intent") === "publish";
  const backTo = id ? `/admin/posts/${id}` : "/admin/posts/new";

  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const input = {
    // Empty slug field -> generated from the title (UA transliterated).
    slug: rawSlug || slugify(title),
    locale: String(formData.get("locale") ?? "en") as "en" | "ua",
    category: String(formData.get("category") ?? ""),
    title,
    description: String(formData.get("description") ?? "").trim(),
    bodyMd: String(formData.get("body_md") ?? ""),
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
  if (wantPublish && !profile.permissions.includes("posts.publish")) {
    redirect(`${backTo}?error=publish-denied`);
  }

  const data = await getData();
  if (id) {
    // Keep the original publication date on republish.
    const existing = await data.posts.get(id);
    const publishedAt = wantPublish
      ? (existing?.status === "published" && existing.published_at) || new Date().toISOString()
      : undefined;
    const { error } = await data.posts.update(id, {
      ...input,
      status: wantPublish ? "published" : "draft",
      publishedAt,
    });
    if (error) redirect(`${backTo}?error=save`);
    // Unpublishing (published -> draft) also has to refresh the site.
    if (wantPublish || existing?.status === "published") revalidatePublicInsights(input.slug);
    redirect("/admin/posts?saved=1");
  } else {
    const { error } = await data.posts.create(
      {
        ...input,
        status: wantPublish ? "published" : "draft",
        publishedAt: wantPublish ? new Date().toISOString() : null,
      },
      profile.id,
    );
    if (error) redirect(`${backTo}?error=save`);
    if (wantPublish) revalidatePublicInsights(input.slug);
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

const MIN_PASSWORD_LENGTH = 6;

export async function changeOwnPassword(formData: FormData): Promise<void> {
  await requireProfile();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) redirect("/admin/account?error=short");
  if (password !== confirm) redirect("/admin/account?error=mismatch");
  const data = await getData();
  const { error } = await data.auth.updateOwnPassword(password);
  redirect(`/admin/account${error ? "?error=save" : "?saved=1"}`);
}

export async function issueTeamPassword(formData: FormData): Promise<void> {
  await requireProfile("users.manage");
  const id = requireId(formData, "/admin/users");
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) redirect("/admin/users?error=short-password");
  const data = await getData();
  const { error } = await data.team.setPassword(id, password);
  redirect(`/admin/users${error ? "?error=save" : "?password-issued=1"}`);
}

/* ---------- team ---------- */

function permsFromForm(formData: FormData): Permission[] {
  return formData.getAll("permissions").map(String).filter(isPermission);
}

export async function createTeamUser(formData: FormData): Promise<void> {
  await requireProfile("users.manage");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "editor") as Role;
  if (
    !email.includes("@") ||
    !fullName ||
    password.length < MIN_PASSWORD_LENGTH ||
    !(role in ROLE_PRESETS)
  ) {
    redirect("/admin/users?error=input");
  }
  const data = await getData();
  const { error } = await data.team.createAccount({
    email,
    fullName,
    password,
    role,
    permissions: ROLE_PRESETS[role],
  });
  redirect(`/admin/users${error ? "?error=create" : "?saved=1"}`);
}

export async function inviteTeamUser(formData: FormData): Promise<void> {
  await requireProfile("users.manage");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "editor") as Role;
  if (!email.includes("@") || !fullName || !(role in ROLE_PRESETS)) {
    redirect("/admin/users?error=input");
  }
  const data = await getData();
  const { error } = await data.team.inviteAccount({
    email,
    fullName,
    role,
    permissions: ROLE_PRESETS[role],
    redirectOrigin: adminSiteOrigin(),
  });
  redirect(`/admin/users${error ? "?error=invite" : "?invited=1"}`);
}

export async function updateTeamUser(formData: FormData): Promise<void> {
  const me = await requireProfile("users.manage");
  const id = requireId(formData, "/admin/users");
  const role = String(formData.get("role") ?? "editor") as Role;
  const permissions = permsFromForm(formData);
  if (!(role in ROLE_PRESETS)) redirect("/admin/users?error=input");
  // Never let an account lock itself out of user management.
  if (id === me.id && !permissions.includes("users.manage")) {
    redirect("/admin/users?error=self-lockout");
  }
  const data = await getData();
  const { error } = await data.team.updateAccess(id, role, permissions);
  redirect(`/admin/users${error ? "?error=save" : "?saved=1"}`);
}

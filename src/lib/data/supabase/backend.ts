import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityRow,
  CategoryRow,
  CustomRoleRow,
  LeadRow,
  NotificationRow,
  NotificationSubscriptionRow,
  PostRow,
  ProfileRow,
  ReviewRow,
} from "@/lib/db-types";
import type { DataBackend, FeaturedReview, LeadStatsRow, Result } from "@/lib/data/ports";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { createAnonClient, createServiceClient, createUserClient } from "./clients";
import { LEAD_FILES_BUCKET, POST_IMAGES_BUCKET } from "./config";

const PROFILE_COLUMNS = "id, email, full_name, role, permissions, created_at";

function toResult(error: { message: string } | null): Result {
  return error ? { error: error.message } : {};
}

async function countRows(
  db: SupabaseClient,
  table: string,
  column: string,
  value: string,
): Promise<number> {
  const { count } = await db
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, value);
  return count ?? 0;
}

/**
 * Supabase implementation of the DataBackend ports.
 * User-scoped operations run through the RLS-enforced client — created
 * LAZILY because it reads request cookies, which would force public ISR
 * pages into dynamic rendering. Public post reads use the cookie-less anon
 * client instead. The privileged service client is confined to the
 * operations marked in the port contract.
 */
export async function createSupabaseBackend(): Promise<DataBackend> {
  let userClient: Promise<SupabaseClient> | null = null;
  const user = () => (userClient ??= createUserClient());

  return {
    auth: {
      async getUserId() {
        const {
          data: { user: authUser },
        } = await (await user()).auth.getUser();
        return authUser?.id ?? null;
      },
      async signInWithPassword(email, password) {
        const { error } = await (await user()).auth.signInWithPassword({ email, password });
        return toResult(error);
      },
      async signOut() {
        await (await user()).auth.signOut();
      },
      async updateOwnPassword(newPassword) {
        const { error } = await (await user()).auth.updateUser({ password: newPassword });
        return toResult(error);
      },
      async verifyOwnPassword(password) {
        const {
          data: { user: authUser },
        } = await (await user()).auth.getUser();
        if (!authUser?.email) return false;
        // Probe sign-in on the cookie-less anon client: proves the password
        // without touching the real session cookies.
        const { error } = await createAnonClient().auth.signInWithPassword({
          email: authUser.email,
          password,
        });
        return !error;
      },
    },

    team: {
      async getProfile(userId) {
        const { data } = await (await user())
          .from("profiles")
          .select(PROFILE_COLUMNS)
          .eq("id", userId)
          .maybeSingle();
        return (data as ProfileRow | null) ?? null;
      },
      async listProfiles() {
        const { data } = await (await user())
          .from("profiles")
          .select(PROFILE_COLUMNS)
          .order("created_at", { ascending: true });
        return (data ?? []) as ProfileRow[];
      },
      async updateAccess(userId, role, permissions) {
        const { error } = await (await user())
          .from("profiles")
          .update({ role, permissions })
          .eq("id", userId);
        return toResult(error);
      },
      async inviteAccount({ email, fullName, role, permissions, redirectOrigin }) {
        const service = createServiceClient();
        const redirectTo = `${redirectOrigin}/admin/welcome`;
        let userId: string;
        if (isEmailConfigured()) {
          // App-owned email channel (src/lib/email.ts): Supabase only mints
          // the invite link; the letter goes out from OUR sender address, so
          // it reaches real inboxes even on the local stack.
          const { data, error } = await service.auth.admin.generateLink({
            type: "invite",
            email,
            options: { redirectTo },
          });
          if (error || !data.user) return { error: error?.message ?? "invite failed" };
          userId = data.user.id;
          const sent = await sendEmail({
            to: email,
            subject: "You are invited to Mug.Up Admin",
            text: [
              `Hello ${fullName},`,
              "",
              "You have been given access to the Mug.Up Studio admin panel.",
              "Open the link below and choose your password:",
              "",
              data.properties.action_link,
              "",
              "The link can be used once. If you were not expecting this email, ignore it.",
            ].join("\n"),
          });
          if (!sent) return { error: "invite email could not be sent" };
        } else {
          // Fallback: Supabase Auth sends the letter (Mailpit on the local stack).
          const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
            redirectTo,
          });
          if (error || !data.user) return { error: error?.message ?? "invite failed" };
          userId = data.user.id;
        }
        const { error: profileError } = await service
          .from("profiles")
          .update({ full_name: fullName, role, permissions })
          .eq("id", userId);
        return toResult(profileError);
      },
      async deleteAccount(userId) {
        // profiles(id) references auth.users on delete cascade.
        const { error } = await createServiceClient().auth.admin.deleteUser(userId);
        return toResult(error);
      },
      async sendPasswordReset(email, redirectOrigin) {
        const redirectTo = `${redirectOrigin}/admin/welcome`;
        if (isEmailConfigured()) {
          // Same app-owned channel as invites: mint the recovery link, send
          // the letter ourselves.
          const { data, error } = await createServiceClient().auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo },
          });
          if (error) return { error: error.message };
          const sent = await sendEmail({
            to: email,
            subject: "Reset your Mug.Up Admin password",
            text: [
              "A password reset was requested for your Mug.Up Admin account.",
              "Open the link below and choose a new password:",
              "",
              data.properties.action_link,
              "",
              "The link can be used once. If you did not request this, ignore it.",
            ].join("\n"),
          });
          return sent ? {} : { error: "reset email could not be sent" };
        }
        // Fallback: Supabase Auth sends the letter (Mailpit on the local stack).
        const { error } = await createAnonClient().auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        return toResult(error);
      },
      async listCustomRoles() {
        const { data } = await (await user())
          .from("custom_roles")
          .select("*")
          .order("name", { ascending: true });
        return (data ?? []) as CustomRoleRow[];
      },
      async addCustomRole({ slug, name, permissions }) {
        const { error } = await (await user())
          .from("custom_roles")
          .insert({ slug, name, permissions });
        return toResult(error);
      },
      async deleteCustomRole(slug) {
        const { error } = await (await user()).from("custom_roles").delete().eq("slug", slug);
        return toResult(error);
      },
    },

    leads: {
      async list(filter = {}) {
        const db = await user();
        let query = db
          .from("leads")
          .select("*")
          .order("created_at", { ascending: filter.sort === "oldest" })
          .limit(filter.limit ?? 200);
        if (filter.status) query = query.eq("status", filter.status);
        if (filter.form) query = query.eq("form", filter.form);
        if (filter.search) {
          const term = filter.search.replace(/[%,()]/g, "").trim();
          if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
        }
        const { data } = await query;
        return (data ?? []) as LeadRow[];
      },
      async get(id) {
        const { data } = await (await user())
          .from("leads")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        return (data as LeadRow | null) ?? null;
      },
      countByStatus: async (status) => countRows(await user(), "leads", "status", status),
      async updateStatus(id, status, lost) {
        const { error } = await (await user())
          .from("leads")
          .update({
            status,
            lost_reason: status === "lost" ? (lost?.reason ?? null) : null,
            lost_reason_note: status === "lost" ? (lost?.note ?? "") : "",
          })
          .eq("id", id);
        return toResult(error);
      },
      async updateDetails(id, details) {
        const { error } = await (await user())
          .from("leads")
          .update({
            programme: details.programme,
            source: details.source,
            owner_id: details.ownerId,
            next_action: details.nextAction,
            next_action_date: details.nextActionDate,
          })
          .eq("id", id);
        return toResult(error);
      },
      async updateNotes(id, notes) {
        const { error } = await (await user()).from("leads").update({ notes }).eq("id", id);
        return toResult(error);
      },
      async submit(lead) {
        const service = createServiceClient();
        const { error } = await service.from("leads").insert({
          form: lead.form,
          locale: lead.locale,
          full_name: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          who_for: lead.whoFor,
          pathway_interest: lead.pathwayInterest,
          preferred_format: lead.preferredFormat,
          subject: lead.subject,
          message: lead.message,
          file_path: lead.filePath,
          source: lead.source,
        });
        return toResult(error);
      },
      // Aggregate-only projection (no PII columns); the service client keeps
      // the dashboard available to analytics.view holders without leads.view.
      async statsRows() {
        const { data } = await createServiceClient()
          .from("leads")
          .select("created_at, status, source, pathway_interest, next_action_date")
          .order("created_at", { ascending: false })
          .limit(5000);
        return (data ?? []) as LeadStatsRow[];
      },
    },

    reviews: {
      async listAll() {
        const { data } = await (await user())
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });
        return (data ?? []) as ReviewRow[];
      },
      countByStatus: async (status) => countRows(await user(), "reviews", "status", status),
      async add({ authorName, authorTag, quote, source, rating, programme, audience }) {
        const { error } = await (await user()).from("reviews").insert({
          author_name: authorName,
          author_tag: authorTag,
          quote,
          source,
          rating,
          programme,
          audience,
        });
        return toResult(error);
      },
      async submitPublic({ authorName, authorTag, quote, rating }) {
        const service = createServiceClient();
        const { error } = await service.from("reviews").insert({
          author_name: authorName,
          author_tag: authorTag,
          quote,
          rating,
          source: "website",
          status: "pending",
        });
        return toResult(error);
      },
      async setStatus(id, status, moderatorId) {
        const { error } = await (await user())
          .from("reviews")
          .update({ status, moderated_by: moderatorId, moderated_at: new Date().toISOString() })
          .eq("id", id);
        return toResult(error);
      },
      async updateMeta(id, { programme, audience, featured }) {
        const { error } = await (await user())
          .from("reviews")
          .update({ programme, audience, featured })
          .eq("id", id);
        return toResult(error);
      },
      async delete(id) {
        const { error } = await (await user()).from("reviews").delete().eq("id", id);
        return toResult(error);
      },
      // Public read: cookie-less anon client keeps ISR pages static; RLS
      // exposes approved rows only.
      async listFeatured() {
        const { data } = await createAnonClient()
          .from("reviews")
          .select("author_name, author_tag, quote, rating, programme, audience")
          .eq("status", "approved")
          .eq("featured", true)
          .order("created_at", { ascending: false });
        return (data ?? []) as FeaturedReview[];
      },
    },

    posts: {
      async listAll() {
        const { data } = await (await user())
          .from("posts")
          .select("*")
          .order("updated_at", { ascending: false });
        return (data ?? []) as PostRow[];
      },
      async get(id) {
        const { data } = await (await user())
          .from("posts")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        return (data as PostRow | null) ?? null;
      },
      countByStatus: async (status) => countRows(await user(), "posts", "status", status),
      async create(input, createdBy) {
        const { error } = await (await user())
          .from("posts")
          .insert({ ...toPostColumns(input), created_by: createdBy });
        return toResult(error);
      },
      async update(id, input) {
        const { error } = await (await user())
          .from("posts")
          .update(toPostColumns(input))
          .eq("id", id);
        return toResult(error);
      },
      async delete(id) {
        const { error } = await (await user()).from("posts").delete().eq("id", id);
        return toResult(error);
      },
      // Public reads: cookie-less anon client keeps ISR pages static.
      // "Live" = published + scheduled posts whose time has passed (the RLS
      // policy mirrors this condition, so anon can actually read them).
      async listPublished(locale) {
        const { data } = await createAnonClient()
          .from("posts")
          .select("*")
          .or(livePostsFilter())
          .eq("locale", locale)
          .order("published_at", { ascending: false });
        return (data ?? []) as PostRow[];
      },
      async getPublished(locale, slug) {
        const { data } = await createAnonClient()
          .from("posts")
          .select("*")
          .or(livePostsFilter())
          .eq("locale", locale)
          .eq("slug", slug)
          .maybeSingle();
        return (data as PostRow | null) ?? null;
      },
      async listCategories() {
        const { data } = await createAnonClient()
          .from("post_categories")
          .select("slug, label_en, label_ua, sort")
          .order("sort", { ascending: true });
        return (data ?? []) as CategoryRow[];
      },
      async addCategory({ slug, labelEn, labelUa }) {
        const { error } = await (await user())
          .from("post_categories")
          .insert({ slug, label_en: labelEn, label_ua: labelUa });
        return toResult(error);
      },
      async deleteCategory(slug) {
        const { error } = await (await user())
          .from("post_categories")
          .delete()
          .eq("slug", slug);
        return toResult(error);
      },
    },

    activity: {
      // Append-only via the service role: team accounts cannot write (or
      // tamper with) audit entries directly. Failures are swallowed — the
      // audit trail must never break the action it documents.
      async record(entry) {
        try {
          await createServiceClient().from("activity_log").insert({
            actor_id: entry.actorId,
            actor_email: entry.actorEmail,
            action: entry.action,
            entity: entry.entity ?? "",
            entity_id: entry.entityId ?? "",
            detail: entry.detail ?? "",
          });
        } catch {
          // ignore — see above
        }
      },
      async list({ limit = 200, from, to } = {}) {
        let query = (await user())
          .from("activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (from) query = query.gte("created_at", from);
        if (to) query = query.lt("created_at", to);
        const { data } = await query;
        return (data ?? []) as ActivityRow[];
      },
    },

    notifications: {
      async feed(events, limit = 100) {
        if (!events.length) return [];
        const { data } = await (await user())
          .from("notifications")
          .select("*")
          .in("event", events)
          .order("created_at", { ascending: false })
          .limit(limit);
        return (data ?? []) as NotificationRow[];
      },
      // Service role: called from public form actions (no user session) and
      // admin actions alike. Failures are swallowed — a notification must
      // never break the action it announces. Old rows are pruned in passing.
      async record(event, title, detail = "") {
        try {
          const service = createServiceClient();
          await service.from("notifications").insert({ event, title, detail });
          await service
            .from("notifications")
            .delete()
            .lt("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
        } catch {
          // ignore — see above
        }
      },
      async listSubscriptions() {
        const { data } = await (await user()).from("notification_subscriptions").select("*");
        return (data ?? []) as NotificationSubscriptionRow[];
      },
      async getSubscription(profileId) {
        const { data } = await (await user())
          .from("notification_subscriptions")
          .select("*")
          .eq("profile_id", profileId)
          .maybeSingle();
        return (data as NotificationSubscriptionRow | null) ?? null;
      },
      async setSubscription(profileId, events) {
        const { error } = await (await user())
          .from("notification_subscriptions")
          .upsert({ profile_id: profileId, events });
        return toResult(error);
      },
      async markSeen(profileId) {
        const { error } = await (await user())
          .from("notification_subscriptions")
          .update({ last_seen: new Date().toISOString() })
          .eq("profile_id", profileId);
        return toResult(error);
      },
    },

    settings: {
      async get(key) {
        const { data } = await (await user())
          .from("admin_settings")
          .select("value")
          .eq("key", key)
          .maybeSingle();
        return (data as { value: string } | null)?.value ?? null;
      },
      async set(key, value) {
        const { error } = await (await user())
          .from("admin_settings")
          .upsert({ key, value });
        return toResult(error);
      },
    },

    files: {
      async uploadLeadFile(path, file) {
        const service = createServiceClient();
        const { error } = await service.storage
          .from(LEAD_FILES_BUCKET)
          .upload(path, file, { contentType: file.type || undefined });
        return toResult(error);
      },
      async getLeadFileUrl(path, expiresInSeconds) {
        const { data } = await (await user()).storage
          .from(LEAD_FILES_BUCKET)
          .createSignedUrl(path, expiresInSeconds);
        return data?.signedUrl ?? null;
      },
      async uploadPostImage(path, file) {
        const service = createServiceClient();
        const { error } = await service.storage
          .from(POST_IMAGES_BUCKET)
          .upload(path, file, { contentType: file.type || undefined });
        if (error) return { error: error.message };
        const { data } = service.storage.from(POST_IMAGES_BUCKET).getPublicUrl(path);
        return { url: data.publicUrl };
      },
    },
  };
}

/** Anon "or" filter matching the public RLS policy for live posts. */
function livePostsFilter(): string {
  return `status.eq.published,and(status.eq.scheduled,published_at.lte.${new Date().toISOString()})`;
}

function toPostColumns(input: {
  slug: string;
  locale: string;
  category: string;
  title: string;
  description: string;
  bodyMd: string;
  bodyBlocks: unknown;
  status: string;
  publishedAt?: string | null;
  author: string;
  heroImageUrl: string | null;
  heroImageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
}) {
  return {
    slug: input.slug,
    locale: input.locale,
    category: input.category,
    title: input.title,
    description: input.description,
    body_md: input.bodyMd,
    body_blocks: input.bodyBlocks,
    status: input.status,
    author: input.author,
    hero_image_url: input.heroImageUrl,
    hero_image_alt: input.heroImageAlt,
    cta_label: input.ctaLabel,
    cta_url: input.ctaUrl,
    // undefined = leave the stored publication date untouched.
    ...(input.publishedAt !== undefined ? { published_at: input.publishedAt } : {}),
  };
}

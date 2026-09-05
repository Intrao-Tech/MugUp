import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityRow,
  CategoryRow,
  LeadRow,
  NotificationEvent,
  NotificationRoleEventsRow,
  NotificationRow,
  PostRow,
  ProfileRow,
  ReviewRow,
  RoleRow,
} from "@/lib/db-types";
import type {
  DataBackend,
  FeaturedReview,
  LeadStatsRow,
  MfaLevel,
  Result,
} from "@/lib/data/ports";
import { createAnonClient, createServiceClient, createUserClient } from "./clients";
import { readAal } from "./jwt";
import { LEAD_FILES_BUCKET, POST_IMAGES_BUCKET } from "./config";

const PROFILE_COLUMNS =
  "id, email, full_name, role, permissions, must_change_password, created_at";

function toResult(error: { message: string } | null): Result {
  return error ? { error: error.message } : {};
}

/**
 * The auth server's view of the current session: user id, the active
 * authenticator factor and the assurance level claimed by the access token
 * (read only after getUser has validated that token).
 */
async function sessionFacts(client: SupabaseClient): Promise<{
  userId: string;
  level: MfaLevel;
  factor: { id: string; enrolledAt: string } | null;
} | null> {
  const {
    data: { user: authUser },
  } = await client.auth.getUser();
  if (!authUser) return null;
  const {
    data: { session },
  } = await client.auth.getSession();
  const verified = (authUser.factors ?? []).find(
    (factor) => factor.factor_type === "totp" && factor.status === "verified",
  );
  return {
    userId: authUser.id,
    level: readAal(session?.access_token),
    factor: verified ? { id: verified.id, enrolledAt: verified.created_at } : null,
  };
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
        const state = await sessionFacts(await user());
        // An enrolled member counts as signed in only once THIS session has
        // passed the second factor (port contract).
        if (!state || (state.factor && state.level !== "aal2")) return null;
        return state.userId;
      },
      async signInWithPassword(email, password) {
        const { error } = await (await user()).auth.signInWithPassword({ email, password });
        return toResult(error);
      },
      async signOut(scope = "global") {
        await (await user()).auth.signOut({ scope });
      },
      async updateOwnPassword(newPassword) {
        const client = await user();
        const {
          data: { user: authUser },
        } = await client.auth.getUser();
        const { error } = await client.auth.updateUser({ password: newPassword });
        if (!error && authUser) {
          // The member now owns their password — lift the first-login gate.
          await createServiceClient()
            .from("profiles")
            .update({ must_change_password: false })
            .eq("id", authUser.id);
        }
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
      async getMfaState() {
        const state = await sessionFacts(await user());
        return state && { level: state.level, factor: state.factor };
      },
      async enrollTotp() {
        const client = await user();
        // Abandoned attempts pile up as unverified factors (and hold the
        // friendly name) — clear them before starting again.
        const { data: existing } = await client.auth.mfa.listFactors();
        for (const factor of existing?.all ?? []) {
          if (factor.status === "unverified") {
            await client.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
        const { data, error } = await client.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Authenticator app",
          issuer: "Mug.Up Admin",
        });
        if (error || !data) return { error: error?.message ?? "Could not start enrolment." };
        return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
      },
      async verifyTotp(factorId, code) {
        // Success rewrites the session cookies with aal2 tokens.
        const { error } = await (await user()).auth.mfa.challengeAndVerify({ factorId, code });
        return toResult(error);
      },
      async unenrollTotp(factorId) {
        const { error } = await (await user()).auth.mfa.unenroll({ factorId });
        return toResult(error);
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
      async createInvitedAccount({ email, fullName, role, permissions, password }) {
        const service = createServiceClient();
        const { data, error } = await service.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error || !data.user) return { error: error?.message ?? "create failed" };
        // The on_auth_user_created trigger has already inserted the profile row.
        const { error: profileError } = await service
          .from("profiles")
          .update({ full_name: fullName, role, permissions, must_change_password: true })
          .eq("id", data.user.id);
        if (profileError) return { error: profileError.message };
        return { userId: data.user.id };
      },
      // Fallback (no email transport): Supabase Auth sends its own invite
      // letter (Mailpit on the local stack).
      async inviteAccount({ email, fullName, role, permissions, redirectOrigin }) {
        const service = createServiceClient();
        const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${redirectOrigin}/admin/welcome`,
        });
        if (error || !data.user) return { error: error?.message ?? "invite failed" };
        const { error: profileError } = await service
          .from("profiles")
          .update({ full_name: fullName, role, permissions })
          .eq("id", data.user.id);
        return toResult(profileError);
      },
      async setPassword(userId, password, mustChange) {
        const service = createServiceClient();
        const { error } = await service.auth.admin.updateUserById(userId, { password });
        if (error) return { error: error.message };
        const { error: profileError } = await service
          .from("profiles")
          .update({ must_change_password: mustChange })
          .eq("id", userId);
        return toResult(profileError);
      },
      async deleteAccount(userId) {
        // profiles(id) references auth.users on delete cascade.
        const { error } = await createServiceClient().auth.admin.deleteUser(userId);
        return toResult(error);
      },
      async hasMfa(userId) {
        const { data } = await createServiceClient().auth.admin.mfa.listFactors({ userId });
        return (data?.factors ?? []).some((factor) => factor.status === "verified");
      },
      async resetMfa(userId) {
        const service = createServiceClient();
        const { data, error } = await service.auth.admin.mfa.listFactors({ userId });
        if (error) return { error: error.message };
        for (const factor of data?.factors ?? []) {
          const { error: deleteError } = await service.auth.admin.mfa.deleteFactor({
            id: factor.id,
            userId,
          });
          if (deleteError) return { error: deleteError.message };
        }
        return {};
      },
      // Fallback (no email transport): Supabase Auth emails a recovery link
      // landing on the welcome set-password page (Mailpit on the local stack).
      async sendPasswordReset(email, redirectOrigin) {
        const { error } = await createAnonClient().auth.resetPasswordForEmail(email, {
          redirectTo: `${redirectOrigin}/admin/welcome`,
        });
        return toResult(error);
      },
      async listRoles() {
        // Built-ins first, then customs alphabetically.
        const { data } = await (await user())
          .from("roles")
          .select("*")
          .order("built_in", { ascending: false })
          .order("name", { ascending: true });
        return (data ?? []) as RoleRow[];
      },
      async addRole({ slug, name, permissions }) {
        const { error } = await (await user())
          .from("roles")
          .insert({ slug, name, permissions });
        return toResult(error);
      },
      async updateRole(slug, { name, permissions }) {
        // A built-in row keeps its identity: only permissions may change.
        const db = await user();
        const { data } = await db.from("roles").select("built_in").eq("slug", slug).maybeSingle();
        const patch = (data as { built_in: boolean } | null)?.built_in
          ? { permissions }
          : { name, permissions };
        const { error } = await db.from("roles").update(patch).eq("slug", slug);
        return toResult(error);
      },
      async deleteRole(slug) {
        const db = await user();
        const { error } = await db
          .from("roles")
          .delete()
          .eq("slug", slug)
          .eq("built_in", false);
        if (error) return { error: error.message };
        // Its notification routing goes with it.
        await db.from("notification_role_events").delete().eq("role_slug", slug);
        return {};
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
        const { data, error } = await service
          .from("leads")
          .insert({
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
          })
          .select("id")
          .single();
        if (error) return { error: error.message };
        return { id: (data as { id: string }).id };
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
      async add({ locale, authorName, authorTag, quote, source, rating, programme, audience }) {
        const { error } = await (await user()).from("reviews").insert({
          locale,
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
      async submitPublic({ locale, authorName, authorTag, quote, rating }) {
        const service = createServiceClient();
        const { error } = await service.from("reviews").insert({
          locale,
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
      async updateMeta(id, { locale, programme, audience, featured }) {
        const { error } = await (await user())
          .from("reviews")
          .update({ locale, programme, audience, featured })
          .eq("id", id);
        return toResult(error);
      },
      async delete(id) {
        const { error } = await (await user()).from("reviews").delete().eq("id", id);
        return toResult(error);
      },
      // Public read: cookie-less anon client keeps ISR pages static; RLS
      // exposes approved rows only.
      async listFeatured(locale) {
        const { data } = await createAnonClient()
          .from("reviews")
          .select("author_name, author_tag, quote, rating, programme, audience")
          .eq("locale", locale)
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
      async publishDue() {
        const { data } = await createServiceClient()
          .from("posts")
          .update({ status: "published" })
          .eq("status", "scheduled")
          .lte("published_at", new Date().toISOString())
          .select("id");
        return data?.length ?? 0;
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
      async record(event, title, detail = "", href = "") {
        try {
          const service = createServiceClient();
          await service.from("notifications").insert({ event, title, detail, href });
          await service
            .from("notifications")
            .delete()
            .lt("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
        } catch {
          // ignore — see above
        }
      },
      async listRoleEvents() {
        const { data } = await (await user()).from("notification_role_events").select("*");
        return (data ?? []) as NotificationRoleEventsRow[];
      },
      async eventsForRole(roleSlug) {
        const { data } = await (await user())
          .from("notification_role_events")
          .select("events")
          .eq("role_slug", roleSlug)
          .maybeSingle();
        return ((data as { events: NotificationEvent[] } | null)?.events ?? []);
      },
      async setRoleEvents(roleSlug, events) {
        const { error } = await (await user())
          .from("notification_role_events")
          .upsert({ role_slug: roleSlug, events });
        return toResult(error);
      },
      async readIds(profileId, notificationIds) {
        if (!notificationIds.length) return [];
        const { data } = await (await user())
          .from("notification_reads")
          .select("notification_id")
          .eq("profile_id", profileId)
          .in("notification_id", notificationIds);
        return ((data ?? []) as { notification_id: string }[]).map((r) => r.notification_id);
      },
      async markRead(profileId, notificationIds) {
        if (!notificationIds.length) return {};
        const { error } = await (await user())
          .from("notification_reads")
          .upsert(
            notificationIds.map((id) => ({ profile_id: profileId, notification_id: id })),
            { ignoreDuplicates: true },
          );
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

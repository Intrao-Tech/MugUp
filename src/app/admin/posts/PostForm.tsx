"use client";

import { useRef, useState, useTransition } from "react";
import type { CategoryRow, PostRow } from "@/lib/db-types";
import { sanitizePostBlocks } from "@/lib/post-blocks";
import { isoToUkWallTime, ukNowWallTime } from "@/lib/uk-time";
import { savePost } from "../actions";
import { BTN_PRIMARY, BTN_SECONDARY, CARD, FIELD_ERROR, INPUT, Notice } from "../ui";
import { HeroImageField } from "./HeroImageField";
import { PostBuilder } from "./PostBuilder";
import { SchedulePicker } from "./SchedulePicker";
import { POST_FORM_ERRORS, type PostField, type PostIntent } from "./errors";

// Shared by /admin/posts/new and /admin/posts/[id]. Submission is handled
// here, not by a form action: the checks run in the browser first, the save
// action returns an error instead of redirecting, and either way the form
// keeps everything typed and points at the field that needs attention.

type FieldErrors = Partial<Record<PostField, string>>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Same rules as the save action, applied before anything leaves the browser. */
function validate(formData: FormData, intent: PostIntent): FieldErrors {
  const get = (name: string) => String(formData.get(name) ?? "").trim();
  const errors: FieldErrors = {};
  if (!get("title")) errors.title = POST_FORM_ERRORS.title;
  const slug = get("slug").toLowerCase();
  if (slug && !SLUG_RE.test(slug)) errors.slug = POST_FORM_ERRORS.slug;
  if (!get("category")) errors.category = POST_FORM_ERRORS.input;
  if (get("hero_image_url") && !get("hero_image_alt")) errors.hero_image_alt = POST_FORM_ERRORS.alt;
  const ctaLabel = get("cta_label");
  const ctaUrl = get("cta_url");
  if (ctaLabel && !ctaUrl) errors.cta_url = POST_FORM_ERRORS.cta;
  if (ctaUrl && !ctaLabel) errors.cta_label = POST_FORM_ERRORS.cta;
  if (ctaUrl && !/^(\/|https?:\/\/)/.test(ctaUrl)) errors.cta_url = POST_FORM_ERRORS["cta-url"];
  if (intent === "schedule") {
    const at = get("publish_at");
    if (!at) errors.publish_at = POST_FORM_ERRORS.schedule;
    else if (at <= ukNowWallTime()) errors.publish_at = POST_FORM_ERRORS["schedule-past"];
  }
  return errors;
}

export function PostForm({
  post,
  canPublish,
  categories,
}: {
  post?: PostRow;
  canPublish: boolean;
  categories: CategoryRow[];
}) {
  const form = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const clearError = (field: PostField) =>
    setFieldErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  function showErrors(errors: FieldErrors, message: string) {
    setFieldErrors(errors);
    setFormError(message);
    // Bring the first problem on screen instead of leaving it somewhere above.
    requestAnimationFrame(() => {
      const first = form.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.scrollIntoView({ block: "center", behavior: "smooth" });
      first?.focus({ preventScroll: true });
    });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = (submitter?.value || "draft") as PostIntent;
    const formData = new FormData(event.currentTarget);
    const errors = validate(formData, intent);
    if (Object.keys(errors).length > 0) {
      showErrors(errors, "Some fields need attention — nothing you typed has been lost.");
      return;
    }
    setFieldErrors({});
    setFormError(null);
    startTransition(async () => {
      // Success redirects to the list; anything else comes back as a code.
      const result = await savePost(intent, formData);
      if (!result) return;
      const message = POST_FORM_ERRORS[result.code] ?? POST_FORM_ERRORS.save;
      showErrors(result.field ? { [result.field]: message } : {}, message);
    });
  }

  const invalid = (field: PostField) => (fieldErrors[field] ? true : undefined);
  const fieldError = (field: PostField) =>
    fieldErrors[field] ? <p className={FIELD_ERROR}>{fieldErrors[field]}</p> : null;

  return (
    // The metadata fields sit in a narrow column; the content builder below
    // uses the full admin width (columns and wide blocks need the room).
    <form ref={form} onSubmit={onSubmit} noValidate className="space-y-4">
      {post && <input type="hidden" name="id" value={post.id} />}
      {formError && <Notice tone="error">{formError}</Notice>}
      <div className="max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="locale" className="block text-sm font-bold text-ink">
              Language *
            </label>
            <select id="locale" name="locale" defaultValue={post?.locale ?? "en"} className={INPUT}>
              <option value="en">English</option>
              <option value="ua">Ukrainian</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-bold text-ink">
              Category *
            </label>
            <select
              id="category"
              name="category"
              defaultValue={post?.category ?? categories[0]?.slug}
              aria-invalid={invalid("category")}
              onChange={() => clearError("category")}
              className={INPUT}
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label_en} / {cat.label_ua}
                </option>
              ))}
            </select>
            {fieldError("category")}
          </div>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-ink">
            Title *{" "}
            <span className="font-normal text-muted">(unique, ≤ 60 chars — used as meta title)</span>
          </label>
          <input
            id="title"
            name="title"
            maxLength={70}
            defaultValue={post?.title}
            aria-invalid={invalid("title")}
            onInput={() => clearError("title")}
            className={INPUT}
          />
          {fieldError("title")}
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-bold text-ink">
            URL address (slug){" "}
            <span className="font-normal text-muted">
              — leave empty to generate from the title. Becomes /insights/&lt;slug&gt;; readable
              URLs matter for SEO.
            </span>
          </label>
          <input
            id="slug"
            name="slug"
            placeholder="generated-from-title"
            defaultValue={post?.slug}
            aria-invalid={invalid("slug")}
            onInput={() => clearError("slug")}
            className={INPUT}
          />
          {fieldError("slug")}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-ink">
            Description{" "}
            <span className="font-normal text-muted">(~150 chars — meta description)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            maxLength={200}
            defaultValue={post?.description}
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="author" className="block text-sm font-bold text-ink">
            Author{" "}
            <span className="font-normal text-muted">
              (shown as the byline; adds educational expertise for readers and Google)
            </span>
          </label>
          <input id="author" name="author" defaultValue={post?.author} className={INPUT} />
        </div>
        <div>
          <span className="block text-sm font-bold text-ink">Featured image</span>
          <p className="text-xs text-muted">Shown at the top of the article and in social previews.</p>
          <div className="mt-2">
            <HeroImageField
              initialUrl={post?.hero_image_url ?? null}
              initialAlt={post?.hero_image_alt ?? ""}
              altError={fieldErrors.hero_image_alt}
              onAltInput={() => clearError("hero_image_alt")}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cta_label" className="block text-sm font-bold text-ink">
              End-of-article CTA — button text
            </label>
            <input
              id="cta_label"
              name="cta_label"
              placeholder="e.g. Explore British Education"
              defaultValue={post?.cta_label}
              aria-invalid={invalid("cta_label")}
              onInput={() => clearError("cta_label")}
              className={INPUT}
            />
            {fieldError("cta_label")}
          </div>
          <div>
            <label htmlFor="cta_url" className="block text-sm font-bold text-ink">
              CTA — link
            </label>
            <input
              id="cta_url"
              name="cta_url"
              placeholder="/pathways/british-education"
              defaultValue={post?.cta_url}
              aria-invalid={invalid("cta_url")}
              onInput={() => clearError("cta_url")}
              className={INPUT}
            />
            {fieldError("cta_url")}
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted">
          The CTA hands the reader on to a programme (fill both fields or neither).
        </p>
      </div>

      <div>
        <span className="block text-sm font-bold text-ink">Content</span>
        <p className="text-xs text-muted">
          Build the article from blocks: drag them by the ⠿ handle to any position, insert at
          any point, set each block&apos;s width (standard / wide / full) and alignment, put two
          blocks side by side with “◫ with next” (and break columns apart with “Unstack”), and
          check the result with the preview button below.
        </p>
        <div className="mt-2">
          <PostBuilder
            initialMarkdown={post?.body_md ?? ""}
            initialBlocks={post?.body_blocks ? sanitizePostBlocks(post.body_blocks) : null}
          />
        </div>
      </div>

      {/* The submitter's value carries the intent (read in onSubmit). */}
      <div className="flex flex-wrap gap-3">
        <button type="submit" value="draft" disabled={pending} className={BTN_SECONDARY}>
          Save draft
        </button>
        {canPublish && (
          <button type="submit" value="publish" disabled={pending} className={BTN_PRIMARY}>
            {post?.status === "published" ? "Update & keep published" : "Publish to site"}
          </button>
        )}
      </div>
      {canPublish && (
        <section className={`${CARD} max-w-2xl p-4`}>
          <h2 className="text-sm font-bold text-ink">Schedule for later</h2>
          <p className="mt-1 text-xs text-muted">
            The article goes live by itself at the chosen moment (UK time). Saving a draft or
            publishing now ignores this.
          </p>
          <div className="mt-3 flex flex-wrap items-start gap-3">
            <SchedulePicker
              initialValue={
                post?.status === "scheduled" && post.published_at
                  ? isoToUkWallTime(post.published_at)
                  : ""
              }
              error={fieldErrors.publish_at}
              onChange={() => clearError("publish_at")}
            />
            <button
              type="submit"
              value="schedule"
              disabled={pending}
              className={`${BTN_SECONDARY} mt-6`}
            >
              Schedule
            </button>
          </div>
        </section>
      )}
      <p className="text-sm text-muted" aria-live="polite">
        {pending
          ? "Saving…"
          : "Drafts are visible only here in the admin. Publishing puts the article on the live site within seconds."}
        {!pending && post?.status === "published" && " “Save draft” takes a published article OFF the site."}
      </p>
    </form>
  );
}

import type { CategoryRow, PostRow } from "@/lib/db-types";
import { sanitizePostBlocks } from "@/lib/post-blocks";
import { isoToUkWallTime } from "@/lib/uk-time";
import { savePost, savePostDraft, savePostPublish } from "../actions";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "../ui";
import { HeroImageField } from "./HeroImageField";
import { PostBuilder } from "./PostBuilder";
import { ScheduleField } from "./ScheduleField";

// Shared by /admin/posts/new and /admin/posts/[id]. The block builder
// serializes to Markdown (body_md) — the same format the site renders.
export function PostForm({
  post,
  canPublish,
  categories,
}: {
  post?: PostRow;
  canPublish: boolean;
  categories: CategoryRow[];
}) {
  const inputCls = INPUT;
  return (
    // The metadata fields sit in a narrow column; the content builder below
    // uses the full admin width (columns and wide blocks need the room).
    <form action={savePost} className="space-y-4">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="locale" className="block text-sm font-bold text-ink">
            Language *
          </label>
          <select id="locale" name="locale" defaultValue={post?.locale ?? "en"} className={inputCls}>
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
            className={inputCls}
          >
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label_en} / {cat.label_ua}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-bold text-ink">
          Title * <span className="font-normal text-muted">(unique, ≤ 60 chars — used as meta title)</span>
        </label>
        <input id="title" name="title" required maxLength={70} defaultValue={post?.title} className={inputCls} />
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
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          placeholder="generated-from-title"
          defaultValue={post?.slug}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-bold text-ink">
          Description <span className="font-normal text-muted">(~150 chars — meta description)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          maxLength={200}
          defaultValue={post?.description}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="author" className="block text-sm font-bold text-ink">
          Author{" "}
          <span className="font-normal text-muted">
            (shown as the byline; adds educational expertise for readers and Google)
          </span>
        </label>
        <input id="author" name="author" defaultValue={post?.author} className={inputCls} />
      </div>
      <div>
        <span className="block text-sm font-bold text-ink">Featured image</span>
        <p className="text-xs text-muted">
          Shown at the top of the article and in social previews.
        </p>
        <div className="mt-2">
          <HeroImageField initialUrl={post?.hero_image_url ?? null} initialAlt={post?.hero_image_alt ?? ""} />
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
            className={inputCls}
          />
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
            className={inputCls}
          />
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
      {/* Per-button formAction: React drops a submitter's own name/value for
          function actions, so a shared action can't tell the buttons apart —
          submitting via `name="intent"` silently saved publishes as drafts. */}
      <div className="flex flex-wrap items-end gap-3">
        <button type="submit" formAction={savePostDraft} className={BTN_SECONDARY}>
          Save draft
        </button>
        {canPublish && (
          <button
            type="submit"
            formAction={savePostPublish}
            className={BTN_PRIMARY}
          >
            {post?.status === "published" ? "Update & keep published" : "Publish to site"}
          </button>
        )}
        {canPublish && (
          <ScheduleField
            initialValue={
              post?.status === "scheduled" && post.published_at
                ? isoToUkWallTime(post.published_at)
                : ""
            }
          />
        )}
      </div>
      <p className="text-sm text-muted">
        Drafts are visible only here in the admin. Publishing puts the article on the live site
        within seconds; scheduling publishes it automatically at the chosen UK time.
        {post?.status === "published" && " “Save draft” takes a published article OFF the site."}
      </p>
    </form>
  );
}

import type { CategoryRow, PostRow } from "@/lib/db-types";
import { savePost } from "../actions";
import { PostBuilder } from "./PostBuilder";

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
  const inputCls = "mt-1 w-full border border-neutral-400 px-3 py-2";
  return (
    <form action={savePost} className="max-w-2xl space-y-4">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="locale" className="block text-sm font-medium">
            Language *
          </label>
          <select id="locale" name="locale" defaultValue={post?.locale ?? "en"} className={inputCls}>
            <option value="en">English</option>
            <option value="ua">Ukrainian</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
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
        <label htmlFor="title" className="block text-sm font-medium">
          Title * <span className="font-normal text-neutral-500">(unique, ≤ 60 chars — used as meta title)</span>
        </label>
        <input id="title" name="title" required maxLength={70} defaultValue={post?.title} className={inputCls} />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          URL address (slug){" "}
          <span className="font-normal text-neutral-500">
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
        <label htmlFor="description" className="block text-sm font-medium">
          Description <span className="font-normal text-neutral-500">(~150 chars — meta description)</span>
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
        <span className="block text-sm font-medium">Content</span>
        <p className="text-xs text-neutral-500">
          Build the article from blocks — add as many as you need, reorder with the arrows.
        </p>
        <div className="mt-2">
          <PostBuilder initialMarkdown={post?.body_md ?? ""} />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          name="intent"
          value="draft"
          className="border border-neutral-900 px-4 py-2"
        >
          Save draft
        </button>
        {canPublish && (
          <button
            type="submit"
            name="intent"
            value="publish"
            className="border border-neutral-900 bg-neutral-900 px-4 py-2 font-medium text-white"
          >
            {post?.status === "published" ? "Update & keep published" : "Publish to site"}
          </button>
        )}
      </div>
      <p className="text-sm text-neutral-500">
        Drafts are visible only here in the admin. Publishing puts the article on the live site
        within seconds — at /{post?.locale ?? "en"}/insights/&lt;slug&gt;.
        {post?.status === "published" && " “Save draft” takes a published article OFF the site."}
      </p>
    </form>
  );
}

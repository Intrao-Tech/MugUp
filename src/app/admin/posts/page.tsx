import Link from "next/link";
import { POST_STATUS_LABELS, POST_STATUSES, type PostStatus } from "@/lib/db-types";
import { requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { publicSiteOrigin } from "@/lib/site";
import { isoToUkDisplay } from "@/lib/uk-time";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { addCategory, deleteCategory } from "../actions";
import { buildQuery, FilterChip, Notice } from "../ui";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  "category-input": "Category needs both labels; the URL name must be kebab-case.",
  "category-save": "Could not add the category — the URL name may already exist.",
  "category-in-use": "This category still has posts in it — move or delete them first.",
};

type Search = { status?: string; lang?: string; saved?: string; deleted?: string; error?: string };

export default async function PostsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireProfile("posts.edit");
  const params = await searchParams;
  const statusFilter = POST_STATUSES.includes(params.status as PostStatus)
    ? (params.status as PostStatus)
    : undefined;
  const langFilter = params.lang === "en" || params.lang === "ua" ? params.lang : undefined;

  const data = await getData();
  const [all, categories] = await Promise.all([
    data.posts.listAll(),
    data.posts.listCategories(),
  ]);
  const posts = all.filter(
    (p) => (!statusFilter || p.status === statusFilter) && (!langFilter || p.locale === langFilter),
  );

  const chipHref = (overrides: Record<string, string | undefined>) =>
    `/admin/posts${buildQuery(params, overrides)}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Insights posts</h1>
        <Link href="/admin/posts/new" className="border border-neutral-900 px-4 py-2 font-medium">
          New post
        </Link>
      </div>
      {params.saved && <Notice tone="success">Saved.</Notice>}
      {params.deleted && <Notice tone="success">Post deleted.</Notice>}
      {params.error && ERRORS[params.error] && (
        <Notice tone="error">{ERRORS[params.error]}</Notice>
      )}
      <p className="mt-1 text-sm text-neutral-500">
        Published posts appear on the public site within seconds; drafts are visible only here.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <FilterChip label={`All (${all.length})`} href={chipHref({ status: undefined })} active={!statusFilter} />
        {POST_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={`${POST_STATUS_LABELS[s]} (${all.filter((p) => p.status === s).length})`}
            href={chipHref({ status: s })}
            active={statusFilter === s}
          />
        ))}
        <span className="mx-2 text-neutral-300">|</span>
        <FilterChip label="All languages" href={chipHref({ lang: undefined })} active={!langFilter} />
        <FilterChip label="EN" href={chipHref({ lang: "en" })} active={langFilter === "en"} />
        <FilterChip label="UA" href={chipHref({ lang: "ua" })} active={langFilter === "ua"} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-left">
              <th className="p-2">Updated</th>
              <th className="p-2">Lang</th>
              <th className="p-2">Title</th>
              <th className="p-2">Category</th>
              <th className="p-2">Status</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-neutral-200">
                <td className="p-2 whitespace-nowrap">
                  {new Date(post.updated_at).toLocaleDateString("en-GB")}
                </td>
                <td className="p-2 uppercase">{post.locale}</td>
                <td className="p-2">
                  <Link href={`/admin/posts/${post.id}`} className="font-medium underline">
                    {post.title}
                  </Link>
                </td>
                <td className="p-2">{post.category}</td>
                <td className="p-2 whitespace-nowrap">
                  {POST_STATUS_LABELS[post.status]}
                  {post.status === "scheduled" && post.published_at && (
                    <span className="block text-xs text-neutral-500">
                      {isoToUkDisplay(post.published_at)}
                    </span>
                  )}
                </td>
                <td className="p-2">
                  {post.status === "published" && (
                    <a
                      href={`${publicSiteOrigin()}/${post.locale}/insights/${post.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="underline"
                    >
                      View on site
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-neutral-500">
                  No posts match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-10 max-w-2xl">
        <h2 className="text-xl font-semibold">Categories</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Categories group articles on the public Insights page. A category can only be removed
          while no posts use it.
        </p>
        <ul className="mt-3 space-y-2">
          {categories.map((cat) => {
            const used = all.filter((p) => p.category === cat.slug).length;
            return (
              <li
                key={cat.slug}
                className="flex flex-wrap items-center gap-3 border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium">{cat.label_en}</span>
                <span className="text-neutral-500">{cat.label_ua}</span>
                <span className="text-xs text-neutral-400">/{cat.slug}</span>
                <span className="ml-auto text-xs text-neutral-500">
                  {used} post{used === 1 ? "" : "s"}
                </span>
                <form action={deleteCategory}>
                  <input type="hidden" name="slug" value={cat.slug} />
                  <ConfirmSubmit
                    label="Remove"
                    confirmText={`Remove the category "${cat.label_en}"?`}
                    className="border border-red-300 px-2 py-0.5 text-xs text-red-700 disabled:opacity-40"
                  />
                </form>
              </li>
            );
          })}
        </ul>
        <form action={addCategory} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            name="label_en"
            required
            placeholder="Label in English"
            className="border border-neutral-400 px-3 py-2 text-sm"
          />
          <input
            name="label_ua"
            required
            placeholder="Назва українською"
            className="border border-neutral-400 px-3 py-2 text-sm"
          />
          <button type="submit" className="border border-neutral-900 px-4 py-2 text-sm font-medium">
            Add category
          </button>
        </form>
        <p className="mt-1 text-xs text-neutral-500">
          The URL name is generated from the English label automatically.
        </p>
      </section>
    </div>
  );
}

import { notFound } from "next/navigation";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { deletePost } from "../../actions";
import { PostForm } from "../PostForm";
import { Notice } from "../../ui";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireProfile("posts.edit");
  const { id } = await params;
  const { error } = await searchParams;

  const data = await getData();
  const post = await data.posts.get(id);
  if (!post) notFound();
  const categories = await data.posts.listCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit post</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Status: {post.status}
        {post.published_at && ` · published ${new Date(post.published_at).toLocaleDateString("en-GB")}`}
      </p>
      {error && (
        <Notice tone="error">
          {error === "publish-denied"
            ? "You do not have the publish permission — nothing was saved. Ask an administrator."
            : error === "input"
              ? "Check the slug (kebab-case), title and category."
              : "Could not save — the slug may already exist for this language."}
        </Notice>
      )}
      <div className="mt-6">
        <PostForm post={post} canPublish={hasPerm(profile, "posts.publish")} categories={categories} />
      </div>
      {(post.status !== "published" || hasPerm(profile, "posts.publish")) && (
        <form action={deletePost} className="mt-10 border-t border-neutral-300 pt-4">
          <input type="hidden" name="id" value={post.id} />
          <ConfirmSubmit
            label="Delete post"
            confirmText={`Delete "${post.title}" permanently? This cannot be undone.`}
            className="border border-red-700 px-4 py-2 text-red-700"
          />
        </form>
      )}
    </div>
  );
}

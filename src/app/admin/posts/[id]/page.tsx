import { notFound } from "next/navigation";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { deletePost } from "../../actions";
import { PostForm } from "../PostForm";
import { POST_FORM_ERRORS } from "../errors";
import { H1, Notice } from "../../ui";

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
      <h1 className={H1}>Edit post</h1>
      <p className="mt-1 text-base text-body">
        Status: {post.status}
        {post.published_at && ` · published ${new Date(post.published_at).toLocaleDateString("en-GB")}`}
      </p>
      {error && <Notice tone="error">{POST_FORM_ERRORS[error] ?? POST_FORM_ERRORS.save}</Notice>}
      <div className="mt-6">
        <PostForm post={post} canPublish={hasPerm(profile, "posts.publish")} categories={categories} />
      </div>
      {(post.status !== "published" || hasPerm(profile, "posts.publish")) && (
        <form action={deletePost} className="mt-10 border-t border-line pt-4">
          <input type="hidden" name="id" value={post.id} />
          <ConfirmSubmit
            label="Delete post"
            confirmText={`Delete "${post.title}" permanently? This cannot be undone.`}
            className="inline-flex items-center justify-center rounded-full border-2 border-red-700 px-4 py-1.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50"
          />
        </form>
      )}
    </div>
  );
}

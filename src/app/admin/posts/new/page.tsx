import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { PostForm } from "../PostForm";
import { POST_FORM_ERRORS } from "../errors";
import { H1, Notice } from "../../ui";

export const dynamic = "force-dynamic";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireProfile("posts.edit");
  const { error } = await searchParams;
  const categories = await (await getData()).posts.listCategories();
  return (
    <div>
      <h1 className={H1}>New Insights post</h1>
      {error && <Notice tone="error">{POST_FORM_ERRORS[error] ?? POST_FORM_ERRORS.save}</Notice>}
      <div className="mt-6">
        <PostForm canPublish={hasPerm(profile, "posts.publish")} categories={categories} />
      </div>
    </div>
  );
}

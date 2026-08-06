import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { PostForm } from "../PostForm";
import { Notice } from "../../ui";

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
      <h1 className="text-2xl font-bold">New Insights post</h1>
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
        <PostForm canPublish={hasPerm(profile, "posts.publish")} categories={categories} />
      </div>
    </div>
  );
}

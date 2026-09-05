/** What the three submit buttons of the post form ask for. */
export type PostIntent = "draft" | "publish" | "schedule";

/** Inputs the form can highlight individually. */
export type PostField =
  | "title"
  | "slug"
  | "category"
  | "hero_image_alt"
  | "cta_label"
  | "cta_url"
  | "publish_at";

/** Returned by the save action instead of a redirect, so the form keeps
 *  everything typed and can point at the field that needs attention. */
export type PostSaveError = { code: string; field?: PostField };

/** Error code → message. Shared by the browser-side check, the save action's
 *  returned errors and the `?error=` codes the delete action redirects with. */
export const POST_FORM_ERRORS: Record<string, string> = {
  "publish-denied":
    "You do not have the publish permission — nothing was saved. Ask an administrator.",
  input: "Check the language and category.",
  title: "Add a title.",
  slug: "Use lowercase letters, digits and hyphens only (e.g. gcse-revision-plan).",
  save: "This URL address (slug) already exists for this language — change it and save again.",
  cta: "Fill in both CTA fields (button text and link) or leave both empty.",
  "cta-url": "The CTA link must start with / (a page on this site) or https://.",
  alt: "Add an alt text for the featured image (or remove the image).",
  blocks: "The article content could not be read — reload the page and try again.",
  schedule: "Pick the date and time first.",
  "schedule-past": "That time is already in the past (UK time) — pick a future moment.",
};

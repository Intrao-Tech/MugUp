/** Error-code → message map shared by the new/edit post pages. */
export const POST_FORM_ERRORS: Record<string, string> = {
  "publish-denied": "You do not have the publish permission — nothing was saved. Ask an administrator.",
  input: "Check the slug (kebab-case), title and category.",
  save: "Could not save — the slug may already exist for this language.",
  cta: "Fill in both CTA fields (button text and link) or leave both empty.",
  alt: "Add an alt text for the featured image (or remove the image).",
  blocks: "The article content could not be read — reload the page and try again.",
  schedule: "Pick a valid date and time for the scheduled publication.",
  "schedule-past": "The scheduled time is in the past — pick a future moment.",
};

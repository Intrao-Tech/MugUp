"use server";

import { redirect } from "next/navigation";
import { canAcceptSubmissions, getData } from "@/lib/data";
import { formRating, formText, honeypotTripped } from "@/lib/form-data";
import { notifyNewReview } from "@/lib/notify";

/**
 * Public "leave a review" form. Reviews always land as pending — nothing is
 * shown anywhere until the team approves it in the admin panel.
 */
export async function submitReview(formData: FormData): Promise<void> {
  const locale = formData.get("locale") === "ua" ? "ua" : "en";
  const backUrl = `/${locale}/review`;

  if (honeypotTripped(formData)) redirect(`${backUrl}?sent=1`);
  if (!canAcceptSubmissions()) redirect(`${backUrl}?error=1`);

  const authorName = formText(formData, "authorName", 200);
  const quote = formText(formData, "quote", 2000);
  if (!authorName || !quote) redirect(`${backUrl}?error=1`);

  const data = await getData();
  const rating = formRating(formData);
  const { error } = await data.reviews.submitPublic({
    authorName,
    authorTag: formText(formData, "authorTag", 200) ?? "",
    quote,
    rating,
  });
  if (!error) await notifyNewReview({ authorName, quote, rating });
  redirect(`${backUrl}${error ? "?error=1" : "?sent=1"}`);
}

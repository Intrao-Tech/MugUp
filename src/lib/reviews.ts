import { getData, isBackendConfigured } from "@/lib/data";
import type { FeaturedReview } from "@/lib/data/ports";

/**
 * Approved + featured reviews for the homepage testimonials (marketing picks
 * them in the admin panel). Empty array = render the static content block
 * instead — same DB-with-static-fallback pattern as src/lib/insights.ts.
 */
export async function getFeaturedReviews(): Promise<FeaturedReview[]> {
  if (!isBackendConfigured()) return [];
  try {
    const data = await getData();
    return await data.reviews.listFeatured();
  } catch {
    // Database unreachable — the static testimonials beat a crashed page.
    return [];
  }
}

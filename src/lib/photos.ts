import type { Locale } from "@/content/types";

/**
 * Photography registry. Client photos + licensed stock (Unsplash/Pexels,
 * downloaded into /public/images/photos — never hotlinked, never AI).
 * Keys: `hero:<route>` for page heroes, `panel:<route>` for the pathway
 * panels (matched by the card href), `split:<section-id>` for 50/50
 * sections, `insights` for the featured post. A missing key renders the
 * ruled-paper ImagePlaceholder, so pages never break while photos are
 * pending. Alt text is descriptive, per locale (a11y + SEO).
 */
export interface Photo {
  src: string;
  alt: Record<Locale, string>;
  /** Object-position for the crop, e.g. "50% 30%". */
  position?: string;
}

export const PHOTOS: Record<string, Photo> = {};

export function photoFor(key: string): Photo | undefined {
  return PHOTOS[key];
}

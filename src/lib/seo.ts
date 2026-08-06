import type { Metadata } from "next";
import type { Locale, SeoMeta } from "@/content/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Per-page metadata: unique title/description, self-referencing canonical,
 * hreflang pair (en / uk) with x-default = en, own-domain og:image.
 * `path` is the locale-relative path starting with "/" ("" or "/" for home).
 * Pass `singleLocale` for content that exists in one language only (e.g. an
 * article without a translation) — hreflang must never point at a 404.
 */
export function pageMetadata(
  locale: Locale,
  path: string,
  meta: SeoMeta,
  opts?: { noindex?: boolean; singleLocale?: boolean },
): Metadata {
  const clean = path === "/" ? "" : path;
  const url = `${SITE_URL}/${locale}${clean}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: opts?.singleLocale
      ? { canonical: url }
      : {
          canonical: url,
          languages: {
            en: `${SITE_URL}/en${clean}`,
            uk: `${SITE_URL}/ua${clean}`,
            "x-default": `${SITE_URL}/en${clean}`,
          },
        },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: SITE_NAME,
      images: [{ url: `${SITE_URL}/og-image.png` }],
      locale: locale === "ua" ? "uk_UA" : "en_GB",
      type: "website",
    },
    twitter: { card: "summary_large_image" },
    ...(opts?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

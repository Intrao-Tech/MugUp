import type { MetadataRoute } from "next";
import type { Locale } from "@/content/types";
import { PROGRAMME_SLUGS } from "@/content/types";
import { getPublishedSlugSets } from "@/lib/insights";
import { SITE_URL } from "@/lib/site";

// Every indexable page with hreflang alternates. Articles are listed per
// locale they are actually published in — alternates only when the
// translation exists. Noindexed pages (legal stubs, fallback samples) are
// excluded on purpose.
const STATIC_PATHS = [
  "",
  "/about",
  "/pathways/british-education",
  ...PROGRAMME_SLUGS.map((slug) => `/pathways/british-education/${slug}`),
  "/pathways/global-integration",
  "/insights",
  "/book-assessment",
  "/contact",
  "/review",
];

function bilingualEntry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}/en${path}`,
    lastModified: new Date(),
    alternates: {
      languages: {
        en: `${SITE_URL}/en${path}`,
        uk: `${SITE_URL}/ua${path}`,
      },
    },
  };
}

function singleEntry(locale: Locale, path: string): MetadataRoute.Sitemap[number] {
  return { url: `${SITE_URL}/${locale}${path}`, lastModified: new Date() };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { en, ua } = await getPublishedSlugSets();
  const postPath = (slug: string) => `/insights/${slug}`;
  return [
    ...STATIC_PATHS.map(bilingualEntry),
    ...en.filter((slug) => ua.includes(slug)).map((slug) => bilingualEntry(postPath(slug))),
    ...en.filter((slug) => !ua.includes(slug)).map((slug) => singleEntry("en", postPath(slug))),
    ...ua.filter((slug) => !en.includes(slug)).map((slug) => singleEntry("ua", postPath(slug))),
  ];
}

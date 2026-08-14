import type { Locale, ProgrammeGroup } from "@/content/types";

/**
 * Locale-relative path of a programme page. International qualifications live
 * under Global Integration (final client doc, Aug 2026); everything else
 * stays under British Education.
 */
export function programmePath(group: ProgrammeGroup, slug: string): string {
  return group === "international-qualifications"
    ? `/pathways/global-integration/qualifications/${slug}`
    : `/pathways/british-education/${slug}`;
}

/** Prefix locale for internal locale-relative hrefs; pass externals through. */
export function localeHref(locale: Locale, href: string): string {
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  return `/${locale}${href === "/" ? "" : href}`;
}

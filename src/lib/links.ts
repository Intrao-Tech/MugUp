import type { Locale } from "@/content/types";

/** Prefix locale for internal locale-relative hrefs; pass externals through. */
export function localeHref(locale: Locale, href: string): string {
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  return `/${locale}${href === "/" ? "" : href}`;
}

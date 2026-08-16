import Link from "next/link";
import type { Locale } from "@/content/types";
import { localeHref } from "@/lib/links";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Container } from "@/components/ui/Container";

export interface Crumb {
  label: string;
  /** Locale-relative path; last crumb usually has none. */
  href?: string;
}

export function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${localeHref(locale, item.href)}` } : {}),
    })),
  };
  return (
    <Container as="nav" aria-label="Breadcrumb" className="pt-6 text-sm">
      <JsonLd data={data} />
      <ol className="flex flex-wrap gap-x-2 gap-y-1 text-muted">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="text-ink-300">
                /
              </span>
            )}
            {item.href ? (
              <Link href={localeHref(locale, item.href)} className="font-semibold hover:text-ink hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </Container>
  );
}

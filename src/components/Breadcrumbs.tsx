import Link from "next/link";
import type { Locale } from "@/content/types";
import { localeHref } from "@/lib/links";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";

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
    <nav aria-label="Breadcrumb" className="mx-auto max-w-4xl px-4 pt-6 text-sm">
      <JsonLd data={data} />
      <ol className="flex flex-wrap gap-1 text-neutral-600">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={localeHref(locale, item.href)} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-neutral-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

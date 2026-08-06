"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/content/types";

const LABELS: Record<Locale, string> = { en: "EN", ua: "УКР" };

/** Swaps the locale prefix on the current path; same page, other language. */
export function LocaleSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? "/";
  const rest = pathname.replace(/^\/(en|ua)(?=\/|$)/, "");
  return (
    <nav aria-label={label} className="flex items-center gap-2 text-sm">
      {LOCALES.map((locale) =>
        locale === current ? (
          <span key={locale} aria-current="true" className="font-bold">
            {LABELS[locale]}
          </span>
        ) : (
          <Link key={locale} href={`/${locale}${rest}`} className="underline">
            {LABELS[locale]}
          </Link>
        ),
      )}
    </nav>
  );
}

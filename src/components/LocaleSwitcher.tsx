"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/content/types";
import { cx } from "@/lib/cx";

const LABELS: Record<Locale, string> = { en: "EN", ua: "УКР" };

/** Swaps the locale prefix on the current path; same page, other language. */
export function LocaleSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? "/";
  const rest = pathname.replace(/^\/(en|ua)(?=\/|$)/, "");
  const pill = "flex min-h-9 items-center rounded-full px-3 text-sm font-bold transition-colors";
  return (
    <nav
      aria-label={label}
      className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5"
    >
      {LOCALES.map((locale) =>
        locale === current ? (
          <span key={locale} aria-current="true" className={cx(pill, "bg-ink text-canvas")}>
            {LABELS[locale]}
          </span>
        ) : (
          <Link
            key={locale}
            href={`/${locale}${rest}`}
            className={cx(pill, "text-body hover:bg-surface-alt hover:text-ink")}
          >
            {LABELS[locale]}
          </Link>
        ),
      )}
    </nav>
  );
}

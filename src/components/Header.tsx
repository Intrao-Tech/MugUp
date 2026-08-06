import Link from "next/link";
import type { CommonDict, Locale } from "@/content/types";
import { localeHref } from "@/lib/links";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

// Minimal accessible navigation: top-level links, a no-JS dropdown for
// Pathways (<details>), Book Assessment as the primary CTA, locale switcher.
export function Header({ locale, dict }: { locale: Locale; dict: CommonDict }) {
  const { nav } = dict;
  const item = "px-2 py-1 hover:underline";
  return (
    <header className="border-b border-neutral-300">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href={`/${locale}`} className="mr-auto flex items-center gap-2 font-bold">
          <img src="/images/logo.png" alt="" className="h-8 w-auto" />
          <span>{dict.siteName}</span>
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
          <Link href={`/${locale}`} className={item}>
            {nav.home}
          </Link>
          <Link href={localeHref(locale, "/about")} className={item}>
            {nav.about}
          </Link>
          <details className="group relative">
            <summary className={`${item} cursor-pointer list-none select-none`}>
              {nav.pathways} ▾
            </summary>
            <div className="absolute left-0 z-10 mt-1 flex min-w-56 flex-col border border-neutral-300 bg-white p-2">
              <Link href={localeHref(locale, "/pathways/british-education")} className={item}>
                {nav.pathwaysBritish}
              </Link>
              <Link href={localeHref(locale, "/pathways/global-integration")} className={item}>
                {nav.pathwaysGlobal}
              </Link>
            </div>
          </details>
          <Link href={localeHref(locale, "/insights")} className={item}>
            {nav.insights}
          </Link>
          {/* Contact is not in the TZ's nav list, restored per client request. */}
          <Link href={localeHref(locale, "/contact")} className={item}>
            {nav.contact}
          </Link>
          <Link
            href={localeHref(locale, "/book-assessment")}
            className="ml-2 border border-neutral-900 px-3 py-1 font-medium"
          >
            {nav.bookAssessment}
          </Link>
        </nav>
        <LocaleSwitcher current={locale} label={dict.ui.localeSwitchLabel} />
      </div>
    </header>
  );
}

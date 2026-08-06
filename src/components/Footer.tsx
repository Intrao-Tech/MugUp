import Link from "next/link";
import type { CommonDict, Locale } from "@/content/types";
import { localeHref } from "@/lib/links";
import { ORGANIZATION, SOCIALS } from "@/lib/site";

export function Footer({ locale, dict }: { locale: Locale; dict: CommonDict }) {
  const { footer } = dict;
  return (
    <footer className="mt-12 border-t border-neutral-300">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-bold">
            <img src="/images/logo.png" alt="" className="h-8 w-auto" />
            {dict.siteName}
          </p>
          <p className="mt-2 text-sm text-neutral-600">{footer.tagline}</p>
          <p className="mt-4 text-sm font-medium">{footer.addressLabel}</p>
          <p className="text-sm text-neutral-600">{ORGANIZATION.addressLine}</p>
        </div>
        {footer.groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="font-semibold">{group.title}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={localeHref(locale, link.href)} className="hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <p className="font-semibold">{footer.followHeading}</p>
        <div className="mt-2 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-neutral-600">Mug.Up Britain</p>
            <ul className="mt-1 flex gap-3">
              {SOCIALS.britain.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="hover:underline" rel="noopener">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-neutral-600">Mug.Up Global Integration</p>
            <ul className="mt-1 flex gap-3">
              {SOCIALS.global.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="hover:underline" rel="noopener">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ul className="mt-1 flex flex-wrap gap-3">
              {SOCIALS.shared.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="hover:underline" rel="noopener">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

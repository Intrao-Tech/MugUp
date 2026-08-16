import Link from "next/link";
import type { CommonDict, Locale } from "@/content/types";
import { localeHref } from "@/lib/links";
import { ORGANIZATION, SOCIALS } from "@/lib/site";
import { Container } from "@/components/ui/Container";

const SOCIAL_GROUPS = [
  { label: "Mug.Up Britain", links: SOCIALS.britain },
  { label: "Mug.Up Global Integration", links: SOCIALS.global },
  { label: null, links: SOCIALS.shared },
] as const;

export function Footer({ locale, dict }: { locale: Locale; dict: CommonDict }) {
  const { footer } = dict;
  const link = "text-sm text-body transition-colors hover:text-ink hover:underline";
  return (
    <footer className="mt-auto border-t border-line bg-surface-alt">
      <Container size="wide" className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(2,1fr)] lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <p className="flex items-center font-bold text-ink">
              <img
                src="/images/logo-nav.png"
                alt=""
                width={640}
                height={562}
                className="h-14 w-auto"
              />
              <span className="sr-only">{dict.siteName}</span>
            </p>
            <p className="mt-4 text-body">{footer.tagline}</p>
            <p className="mt-6 text-eyebrow uppercase text-muted">{footer.addressLabel}</p>
            <p className="mt-1 text-sm text-body">{ORGANIZATION.addressLine}</p>
          </div>

          {footer.groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-sm font-bold text-ink">{group.title}</p>
              <ul className="mt-3 space-y-2">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={localeHref(locale, l.href)} className={link}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <p className="text-sm font-bold text-ink">{footer.followHeading}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {SOCIAL_GROUPS.map((group, i) => (
              <div key={group.label ?? i}>
                {group.label && <p className="text-sm text-muted">{group.label}</p>}
                <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {group.links.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} className={link} rel="noopener">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

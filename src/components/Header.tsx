import Link from "next/link";
import type { CommonDict, Locale } from "@/content/types";
import { localeHref } from "@/lib/links";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Header({ locale, dict }: { locale: Locale; dict: CommonDict }) {
  const { nav } = dict;
  // Order per client (20 Aug): Home | About | British Education | …
  const links = [
    { href: `/${locale}`, label: nav.home, exact: true },
    { href: localeHref(locale, "/about"), label: nav.about },
    { href: localeHref(locale, "/pathways/british-education"), label: nav.pathwaysBritish },
    { href: localeHref(locale, "/pathways/global-integration"), label: nav.pathwaysGlobal },
    { href: localeHref(locale, "/courses"), label: nav.courses },
    { href: localeHref(locale, "/insights"), label: nav.insights },
    { href: localeHref(locale, "/contact"), label: nav.contact },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <Container size="wide" className="relative flex min-h-16 items-center gap-2 py-2 sm:gap-4">
        <Link href={`/${locale}`} className="mr-auto flex items-center rounded-lg py-1">
          <img
            src="/images/logo-nav.png"
            alt=""
            width={640}
            height={562}
            className="h-11 w-auto sm:h-12"
          />
          <span className="sr-only">{dict.siteName}</span>
        </Link>

        <MobileNav label={dict.ui.openMenu}>
          <nav
            aria-label="Main"
            className="absolute inset-x-0 top-full flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto border-b border-line bg-canvas px-4 py-4 shadow-lift sm:px-6 xl:static xl:max-h-none xl:flex-row xl:items-center xl:gap-1 xl:overflow-visible xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none"
          >
            {links.map((l) => (
              <NavLink key={l.href} href={l.href} exact={l.exact}>
                {l.label}
              </NavLink>
            ))}
            <Button
              href={localeHref(locale, "/book-assessment")}
              size="sm"
              className="mt-3 self-start xl:ml-3 xl:mt-0"
            >
              {nav.bookAssessment}
            </Button>
          </nav>
        </MobileNav>

        <LocaleSwitcher current={locale} label={dict.ui.localeSwitchLabel} />
      </Container>
    </header>
  );
}

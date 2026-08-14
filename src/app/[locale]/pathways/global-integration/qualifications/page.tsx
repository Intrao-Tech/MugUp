import Link from "next/link";
import type { Metadata } from "next";
import { getCommon, getInternationalQualsHub, getProgrammes } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, PageSections } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { localeHref, programmePath } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(
    locale,
    "/pathways/global-integration/qualifications",
    getInternationalQualsHub(locale).meta,
  );
}

export default async function InternationalQualificationsPage({ params }: Props) {
  const { locale } = await params;
  const page = getInternationalQualsHub(locale);
  const dict = getCommon(locale);
  const programmes = getProgrammes(locale).filter(
    (p) => p.group === "international-qualifications",
  );

  const startCta = page.sections.find((s) => s.id === "start-cta");
  const sections = page.sections.filter((s) => s.id !== "start-cta");

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.pathwaysGlobal, href: "/pathways/global-integration" },
          { label: page.hero.title },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} />
      <section id="programmes" className="mx-auto max-w-4xl px-4 py-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((p) => (
            <li key={p.slug} className="border border-neutral-300 p-4">
              <h2 className="font-semibold">
                <Link
                  href={localeHref(locale, programmePath(p.group, p.slug))}
                  className="hover:underline"
                >
                  {p.cardTitle}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-neutral-700">{p.cardBlurb}</p>
            </li>
          ))}
        </ul>
      </section>
      <PageSections sections={sections} locale={locale} />
      {startCta && <PageSections sections={[startCta]} locale={locale} />}
    </>
  );
}

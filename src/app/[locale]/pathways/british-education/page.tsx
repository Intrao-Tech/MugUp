import Link from "next/link";
import type { Metadata } from "next";
import { getBritishHub, getCommon, getProgrammes } from "@/content";
import type { Locale, ProgrammeGroup } from "@/content/types";
import { HeroSection, SectionView } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { localeHref } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

// Presentational group headings; promote to the common dictionary if they
// ever need to appear anywhere else.
// International qualifications are not rendered here — they live under
// Global Integration (final client doc, Aug 2026).
const HUB_GROUPS = ["education-pathways", "english-qualifications"] as const satisfies readonly ProgrammeGroup[];

const GROUP_LABELS: Record<Locale, Record<(typeof HUB_GROUPS)[number], string>> = {
  en: {
    "education-pathways": "Education Pathways",
    "english-qualifications": "English Qualifications",
  },
  ua: {
    "education-pathways": "Освітні траєкторії",
    "english-qualifications": "Кваліфікації з англійської мови",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/pathways/british-education", getBritishHub(locale).meta);
}

export default async function BritishEducationHub({ params }: Props) {
  const { locale } = await params;
  const page = getBritishHub(locale);
  const dict = getCommon(locale);
  const programmes = getProgrammes(locale);
  const groups = HUB_GROUPS;

  const finalCta = page.sections.find((s) => s.id === "final-cta");
  const sections = page.sections.filter((s) => s.id !== "final-cta");

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.pathways },
          { label: dict.nav.pathwaysBritish },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} />
      {sections.map((section) => (
        <SectionView key={section.id} section={section} locale={locale} />
      ))}
      {groups.map((group) => (
        <section key={group} id={group} className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-h2 text-ink">{GROUP_LABELS[locale][group]}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programmes
              .filter((p) => p.group === group)
              .map((p) => (
                <li key={p.slug} className="rounded-card border border-line bg-surface p-6 shadow-card">
                  <h3 className="font-semibold">
                    <Link
                      href={localeHref(locale, `/pathways/british-education/${p.slug}`)}
                      className="hover:underline"
                    >
                      {p.cardTitle}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-body">{p.cardBlurb}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
      {finalCta && <SectionView section={finalCta} locale={locale} />}
    </>
  );
}

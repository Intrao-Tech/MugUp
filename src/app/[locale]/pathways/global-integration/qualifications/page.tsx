import type { Metadata } from "next";
import { getCommon, getInternationalQualsHub, getProgrammes } from "@/content";
import type { Card as CardData, Locale } from "@/content/types";
import { HeroSection, PageSections } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GridTwo } from "@/components/Editorial";
import { SectionHeading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { programmePath } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

const ROUTE = "/pathways/global-integration/qualifications";

const PROGRAMMES_HEADING: Record<Locale, { title: string; intro: string }> = {
  en: {
    title: "Preparation Programmes",
    intro:
      "Dedicated preparation for the English-language tests we support, from academic study to visa and settlement applications.",
  },
  ua: {
    title: "Програми підготовки",
    intro:
      "Спеціалізована підготовка до мовних тестів з англійської, які ми супроводжуємо, — від академічного навчання до візових і поселенських заяв.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, ROUTE, getInternationalQualsHub(locale).meta);
}

export default async function InternationalQualificationsPage({ params }: Props) {
  const { locale } = await params;
  const page = getInternationalQualsHub(locale);
  const dict = getCommon(locale);
  const heading = PROGRAMMES_HEADING[locale];

  // The hub's own preparation pages, as design-system cards (client, 9 Sep
  // 2026 — the page was still using a hand-rolled bordered grid).
  const cards: CardData[] = getProgrammes(locale)
    .filter((p) => p.group === "international-qualifications")
    .map((p) => ({
      title: p.cardTitle,
      body: p.cardBlurb,
      href: programmePath(p.group, p.slug),
      linkLabel: `${dict.ui.explore} ${p.cardTitle}`,
    }));

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
      <HeroSection hero={page.hero} locale={locale} route={ROUTE} />
      <Section id="programmes" tone="cream">
        <SectionHeading title={heading.title} intro={heading.intro} />
        <div className="mt-10">
          <GridTwo cards={cards} locale={locale} />
        </div>
      </Section>
      <PageSections sections={sections} locale={locale} />
      {startCta && <PageSections sections={[startCta]} locale={locale} />}
    </>
  );
}

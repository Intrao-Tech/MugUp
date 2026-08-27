import type { Metadata } from "next";
import { getBritishHub, getCommon } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, SectionView, TwoUp } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

// Section order and every card (journey, boarding, UK qualifications, why,
// CTA) come from src/content/{locale}/pathways/british-education.ts — the
// old registry-driven programme grids duplicated the journey and were
// removed per client feedback (20 Aug 2026).

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/pathways/british-education", getBritishHub(locale).meta);
}

export default async function BritishEducationHub({ params }: Props) {
  const { locale } = await params;
  const page = getBritishHub(locale);
  const dict = getCommon(locale);

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.pathwaysBritish },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} route={"/pathways/british-education"} />
      {page.sections.map((section) => {
        // Client (25 Aug 2026): under the journey, boarding on the left and
        // the four UK qualifications 2×2 on the right — one band.
        if (section.id === "boarding-crosslink") {
          const right = page.sections.find((s) => s.id === "uk-qualifications");
          return right ? (
            <TwoUp key={section.id} left={section} right={right} locale={locale} tone="cream" />
          ) : null;
        }
        if (section.id === "uk-qualifications" && page.sections.some((s) => s.id === "boarding-crosslink")) {
          return null;
        }
        return <SectionView key={section.id} section={section} locale={locale} />;
      })}
    </>
  );
}

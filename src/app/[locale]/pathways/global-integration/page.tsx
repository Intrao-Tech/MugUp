import type { Metadata } from "next";
import { getCommon, getGlobalIntegration } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, PageSections } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/pathways/global-integration", getGlobalIntegration(locale).meta);
}

// Stage 1 scope: hero landing only; full track + programme sub-pages are Stage 2.
export default async function GlobalIntegrationPage({ params }: Props) {
  const { locale } = await params;
  const page = getGlobalIntegration(locale);
  const dict = getCommon(locale);
  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.pathways },
          { label: dict.nav.pathwaysGlobal },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} />
      <p className="mx-auto max-w-4xl px-4 text-sm text-neutral-500">{dict.ui.stage2Notice}</p>
      <PageSections sections={page.sections} locale={locale} />
    </>
  );
}

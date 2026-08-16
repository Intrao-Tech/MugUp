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

// Stage 2 landing ("Global integration updated v2"); language sub-pages still pending.
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
          { label: dict.nav.pathwaysGlobal },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} />
      <PageSections sections={page.sections} locale={locale} />
    </>
  );
}

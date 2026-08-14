import type { Metadata } from "next";
import { getBoardingSchools, getCommon } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, PageSections } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ locale: Locale }> };

const PATH = "/pathways/global-integration/boarding-schools";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, PATH, getBoardingSchools(locale).meta);
}

// The ONE boarding-school page (final doc §1: primary location = Global
// Integration; British Education links here and never duplicates the copy).
export default async function BoardingSchoolsPage({ params }: Props) {
  const { locale } = await params;
  const page = getBoardingSchools(locale);
  const dict = getCommon(locale);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "British Boarding Schools for International Students",
    description: page.meta.description,
    serviceType: "Educational consultancy",
    url: `${SITE_URL}/${locale}${PATH}`,
    provider: { "@type": "EducationalOrganization", name: SITE_NAME, url: SITE_URL },
    areaServed: "GB",
    availableChannel: [
      { "@type": "ServiceChannel", name: "Online worldwide" },
      { "@type": "ServiceChannel", name: `In person — ${ORGANIZATION.addressLine}` },
    ],
  };

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.pathwaysGlobal, href: "/pathways/global-integration" },
          { label: page.hero.title },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} />
      <PageSections sections={page.sections} locale={locale} />
    </>
  );
}

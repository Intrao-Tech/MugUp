import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCommon, getLanguagePage } from "@/content";
import { LANGUAGE_SLUGS, type Locale } from "@/content/types";
import { HeroSection, PageSections } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ locale: Locale; language: string }> };

export function generateStaticParams() {
  return LANGUAGE_SLUGS.map((language) => ({ language }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, language } = await params;
  const page = getLanguagePage(locale, language);
  if (!page) return {};
  return pageMetadata(locale, `/pathways/global-integration/${language}`, page.meta);
}

export default async function LanguagePage({ params }: Props) {
  const { locale, language } = await params;
  const page = getLanguagePage(locale, language);
  if (!page) notFound();
  const dict = getCommon(locale);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.cardTitle,
    description: page.meta.description,
    serviceType: "Language programme",
    url: `${SITE_URL}/${locale}/pathways/global-integration/${language}`,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    availableChannel: [
      { "@type": "ServiceChannel", name: "Online" },
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
          { label: page.cardTitle },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} />
      <PageSections sections={page.sections} locale={locale} />
    </>
  );
}

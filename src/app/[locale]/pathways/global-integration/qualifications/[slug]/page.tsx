import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCommon, getInternationalQualsHub, getProgramme, getProgrammes } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, PageSections } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return getProgrammes("en")
    .filter((p) => p.group === "international-qualifications")
    .map((p) => ({ slug: p.slug }));
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getProgramme(locale, slug);
  if (!page) return {};
  return pageMetadata(locale, `/pathways/global-integration/qualifications/${slug}`, page.meta);
}

export default async function QualificationProgrammePage({ params }: Props) {
  const { locale, slug } = await params;
  const page = getProgramme(locale, slug);
  if (!page || page.group !== "international-qualifications") notFound();
  const dict = getCommon(locale);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.cardTitle,
    description: page.meta.description,
    serviceType: "Educational programme",
    url: `${SITE_URL}/${locale}/pathways/global-integration/qualifications/${slug}`,
    provider: { "@type": "EducationalOrganization", name: SITE_NAME, url: SITE_URL },
    areaServed: "GB",
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
          {
            label: getInternationalQualsHub(locale).hero.title,
            href: "/pathways/global-integration/qualifications",
          },
          { label: page.cardTitle },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} glance={page.atAGlance} />
      <PageSections sections={page.sections} locale={locale} />
    </>
  );
}

import type { Metadata } from "next";
import { getAbout, getCommon } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, PageSections } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/about", getAbout(locale).meta);
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const page = getAbout(locale);
  const dict = getCommon(locale);
  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.about },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} statement />
      <PageSections sections={page.sections} locale={locale} />
    </>
  );
}

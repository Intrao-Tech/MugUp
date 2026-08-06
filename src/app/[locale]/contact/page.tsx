import type { Metadata } from "next";
import { getCommon, getContact } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, PageSections } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FormRenderer } from "@/components/FormRenderer";
import { pageMetadata } from "@/lib/seo";
import { canAcceptSubmissions } from "@/lib/data";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/contact", getContact(locale).meta);
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const page = getContact(locale);
  const dict = getCommon(locale);
  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.contact },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} />
      <PageSections sections={page.sections} locale={locale} />
      <section id="contact-form" className="mx-auto max-w-4xl px-4 py-8">
        <FormRenderer
          form={page.form}
          formKind="contact"
          locale={locale}
          enabled={canAcceptSubmissions()}
          notWiredNote={dict.ui.formNotWired}
          sentText={dict.ui.formSent}
          errorText={dict.ui.formError}
        />
      </section>
    </>
  );
}

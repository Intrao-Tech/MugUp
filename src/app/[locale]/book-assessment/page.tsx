import type { Metadata } from "next";
import { getBookAssessment, getCommon } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, SectionView } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FormRenderer } from "@/components/FormRenderer";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { canAcceptSubmissions } from "@/lib/data";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/book-assessment", getBookAssessment(locale).meta);
}

export default async function BookAssessmentPage({ params }: Props) {
  const { locale } = await params;
  const page = getBookAssessment(locale);
  const dict = getCommon(locale);

  // The form sits between the content sections and the FAQ.
  const faq = page.sections.find((s) => s.id === "faq");
  const sections = page.sections.filter((s) => s.id !== "faq");

  const faqBlocks = faq?.blocks.find((b) => b.type === "faq");
  const faqJsonLd =
    faqBlocks && faqBlocks.type === "faq"
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqBlocks.items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.bookAssessment },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} />
      {sections.map((section) => (
        <SectionView key={section.id} section={section} locale={locale} />
      ))}
      <section id="booking-form" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <FormRenderer
          form={page.form}
          formKind="booking"
          locale={locale}
          enabled={canAcceptSubmissions()}
          notWiredNote={dict.ui.formNotWired}
          sentText={dict.ui.formSent}
          errorText={dict.ui.formError}
        />
      </section>
      {faq && <SectionView section={faq} locale={locale} />}
    </>
  );
}

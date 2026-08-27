import type { Metadata } from "next";
import { getCommon, getGlobalIntegration } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, SectionBody, SectionView, TwoUp } from "@/components/BlockRenderer";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/Heading";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

const PAIRS: Record<string, string> = { "beyond-language": "for-employers-organisations" };

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
      <HeroSection hero={page.hero} locale={locale} route={"/pathways/global-integration"} />
      {page.sections.map((section) => {
        // Client (25 Aug 2026): journey + "More than learning a language" share
        // one screen; "Beyond language" | "For employers" sit in two columns.
        const pair = PAIRS[section.id];
        if (pair) {
          const right = page.sections.find((s) => s.id === pair);
          return right ? (
            <TwoUp key={section.id} left={section} right={right} locale={locale} tone="cream" />
          ) : null;
        }
        if (Object.values(PAIRS).includes(section.id)) return null;
        if (section.id === "how-it-works") {
          const why = page.sections.find((s) => s.id === "why-mugup-global");
          return (
            <Section key={section.id} id={section.id} className="overflow-hidden">
              <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} />
              <div className="mt-10">
                <SectionBody section={section} locale={locale} />
              </div>
              {why && (
                <div id={why.id} className="mt-16 scroll-mt-20 border-t border-ink pt-12">
                  <SectionHeading eyebrow={why.eyebrow} title={why.title} intro={why.intro} />
                  <div className="mt-10">
                    <SectionBody section={why} locale={locale} />
                  </div>
                </div>
              )}
            </Section>
          );
        }
        if (section.id === "why-mugup-global") return null;
        return <SectionView key={section.id} section={section} locale={locale} />;
      })}
    </>
  );
}

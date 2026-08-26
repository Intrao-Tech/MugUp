import type { Metadata } from "next";
import { getBritishHub, getCommon, getLanguagePages, getProgrammes } from "@/content";
import type { Card as CardData, Locale, ProgrammeGroup } from "@/content/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CatalogueRows } from "@/components/Editorial";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { programmePath } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

// The "all courses & programmes" catalogue the client asked for (Aug 2026):
// one page listing every programme, grouped by the two site areas.
const COPY: Record<
  Locale,
  {
    title: string;
    metaTitle: string;
    metaDescription: string;
    intro: string;
    groups: Record<ProgrammeGroup, string>;
    languages: string;
    internationalEducation: string;
  }
> = {
  en: {
    title: "Courses & Programmes",
    metaTitle: "All Courses & Programmes | Mug.Up Language Studio",
    metaDescription:
      "The full Mug.Up catalogue: British education programmes, UK qualifications and tests, international language tests, modern languages and international education services.",
    intro:
      "Everything we teach in one place. Pick the area that matches your goal — every programme starts with a personal assessment.",
    groups: {
      "education-pathways": "British Education",
      "english-qualifications": "UK Qualifications & Tests",
      "international-qualifications": "International Language Tests",
    },
    languages: "Languages & Destinations",
    internationalEducation: "International Education & Study Abroad",
  },
  ua: {
    title: "Курси та програми",
    metaTitle: "Усі курси та програми | Mug.Up Language Studio",
    metaDescription:
      "Повний каталог Mug.Up: програми британської освіти, кваліфікації і тести Великої Британії, міжнародні мовні тести, сучасні мови та послуги міжнародної освіти.",
    intro:
      "Усе, чого ми навчаємо, — на одній сторінці. Оберіть напрям під вашу мету: кожна програма починається з персонального оцінювання.",
    groups: {
      "education-pathways": "Британська освіта",
      "english-qualifications": "Кваліфікації та тести Великої Британії",
      "international-qualifications": "Міжнародні мовні тести",
    },
    languages: "Мови та напрямки",
    internationalEducation: "Міжнародна освіта та навчання за кордоном",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[locale];
  return pageMetadata(locale, "/courses", {
    title: copy.metaTitle,
    description: copy.metaDescription,
  });
}

/** Cards of a content section on the British hub (client-owned card lists). */
function hubCards(hub: ReturnType<typeof getBritishHub>, id: string): CardData[] {
  const section = hub.sections.find((s) => s.id === id);
  const block = section?.blocks.find((b) => b.type === "cards");
  return block && block.type === "cards" ? block.cards : [];
}

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;
  const copy = COPY[locale];
  const dict = getCommon(locale);
  const programmes = getProgrammes(locale);
  const languages = getLanguagePages(locale);
  const hub = getBritishHub(locale);
  // British Education + UK Qualifications lists mirror the British hub
  // content sections (client list, 20 Aug 2026); boarding support joins the
  // British group. The international group stays registry-driven.
  const britishCards: CardData[] = [
    ...hubCards(hub, "educational-journey"),
    ...hubCards(hub, "boarding-crosslink"),
  ];
  const ukQualCards = hubCards(hub, "uk-qualifications");

  // Client (25 Aug 2026): a catalogue — name left, description right, one
  // group after another.
  const groups: { id: string; title: string; cards: CardData[] }[] = [
    { id: "education-pathways", title: copy.groups["education-pathways"], cards: britishCards },
    { id: "english-qualifications", title: copy.groups["english-qualifications"], cards: ukQualCards },
    {
      id: "international-qualifications",
      title: copy.groups["international-qualifications"],
      cards: programmes
        .filter((p) => p.group === "international-qualifications")
        .map((p) => ({ title: p.cardTitle, body: p.cardBlurb, href: programmePath(p.group, p.slug) })),
    },
    {
      id: "languages",
      title: copy.languages,
      cards: languages.map((l) => ({ title: l.cardTitle, body: l.meta.description, href: `/pathways/global-integration/${l.slug}` })),
    },
    {
      id: "international-education",
      title: copy.internationalEducation,
      cards: [
        {
          title: "British Boarding Schools for International Students",
          href: "/pathways/global-integration/boarding-schools",
        },
      ],
    },
  ];

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.ui.breadcrumbsHome, href: "/" }, { label: copy.title }]}
      />
      <Container as="header" className="py-12 sm:py-16">
        <h1 className="text-display text-ink">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-lead">{copy.intro}</p>
      </Container>
      {groups.map((g, i) => (
        <Section key={g.id} id={g.id} tone={i % 2 === 1 ? "cream" : "default"}>
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 className="text-h2 text-ink lg:col-span-3">{g.title}</h2>
            <div className="lg:col-span-9">
              <CatalogueRows cards={g.cards} locale={locale} />
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}

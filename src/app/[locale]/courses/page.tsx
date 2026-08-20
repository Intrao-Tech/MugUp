import Link from "next/link";
import type { Metadata } from "next";
import { getBritishHub, getCommon, getLanguagePages, getProgrammes } from "@/content";
import type { Card as CardData, Locale, ProgrammeGroup } from "@/content/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cx } from "@/lib/cx";
import { localeHref, programmePath } from "@/lib/links";
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

function CardLink({
  href,
  title,
  blurb,
  locale,
}: {
  href?: string;
  title: string;
  blurb?: string;
  locale: Locale;
}) {
  return (
    <li className={cx("rounded-card border border-ink bg-surface p-6", href && "shadow-plate")}>
      <h3 className="font-semibold">
        {href ? (
          <Link href={localeHref(locale, href)} className="hover:underline">
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>
      {blurb && <p className="mt-2 text-sm text-body">{blurb}</p>}
    </li>
  );
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

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.ui.breadcrumbsHome, href: "/" }, { label: copy.title }]}
      />
      <header className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-display text-ink">{copy.title}</h1>
        <p className="mt-3 text-body">{copy.intro}</p>
      </header>
      <section id="education-pathways" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-h2 text-ink">{copy.groups["education-pathways"]}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {britishCards.map((card) => (
            <CardLink
              key={card.title}
              href={card.href}
              title={card.title}
              blurb={card.body}
              locale={locale}
            />
          ))}
        </ul>
      </section>
      <section id="english-qualifications" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-h2 text-ink">{copy.groups["english-qualifications"]}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ukQualCards.map((card) => (
            <CardLink
              key={card.title}
              href={card.href}
              title={card.title}
              blurb={card.body}
              locale={locale}
            />
          ))}
        </ul>
      </section>
      <section
        id="international-qualifications"
        className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <h2 className="text-h2 text-ink">{copy.groups["international-qualifications"]}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programmes
            .filter((p) => p.group === "international-qualifications")
            .map((p) => (
              <CardLink
                key={p.slug}
                href={programmePath(p.group, p.slug)}
                title={p.cardTitle}
                blurb={p.cardBlurb}
                locale={locale}
              />
            ))}
        </ul>
      </section>
      <section id="languages" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-h2 text-ink">{copy.languages}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((language) => (
            <CardLink
              key={language.slug}
              href={`/pathways/global-integration/${language.slug}`}
              title={language.cardTitle}
              locale={locale}
            />
          ))}
        </ul>
      </section>
      <section id="international-education" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-h2 text-ink">{copy.internationalEducation}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardLink
            href="/pathways/global-integration/boarding-schools"
            title="British Boarding Schools for International Students"
            locale={locale}
          />
        </ul>
      </section>
    </>
  );
}

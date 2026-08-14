import Link from "next/link";
import type { Metadata } from "next";
import { getCommon, getLanguagePages, getProgrammes } from "@/content";
import type { Locale, ProgrammeGroup } from "@/content/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
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
      "The full Mug.Up catalogue: British education programmes, English and international language qualifications, modern languages and international education services.",
    intro:
      "Everything we teach in one place. Pick the area that matches your goal — every programme starts with a personal assessment.",
    groups: {
      "education-pathways": "British Education",
      "english-qualifications": "English for Life & Work in the UK",
      "international-qualifications": "International Language Qualifications",
    },
    languages: "Languages & Destinations",
    internationalEducation: "International Education & Study Abroad",
  },
  ua: {
    title: "Курси та програми",
    metaTitle: "Усі курси та програми | Mug.Up Language Studio",
    metaDescription:
      "Повний каталог Mug.Up: програми британської освіти, англійські та міжнародні мовні кваліфікації, сучасні мови та послуги міжнародної освіти.",
    intro:
      "Усе, чого ми навчаємо, — на одній сторінці. Оберіть напрям під вашу мету: кожна програма починається з персонального оцінювання.",
    groups: {
      "education-pathways": "Британська освіта",
      "english-qualifications": "Англійська для життя і роботи у Британії",
      "international-qualifications": "Міжнародні мовні кваліфікації",
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
  href: string;
  title: string;
  blurb?: string;
  locale: Locale;
}) {
  return (
    <li className="border border-neutral-300 p-4">
      <h3 className="font-semibold">
        <Link href={localeHref(locale, href)} className="hover:underline">
          {title}
        </Link>
      </h3>
      {blurb && <p className="mt-2 text-sm text-neutral-700">{blurb}</p>}
    </li>
  );
}

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;
  const copy = COPY[locale];
  const dict = getCommon(locale);
  const programmes = getProgrammes(locale);
  const languages = getLanguagePages(locale);
  const groups: ProgrammeGroup[] = [
    "education-pathways",
    "english-qualifications",
    "international-qualifications",
  ];

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[{ label: dict.ui.breadcrumbsHome, href: "/" }, { label: copy.title }]}
      />
      <header className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold">{copy.title}</h1>
        <p className="mt-3 text-neutral-700">{copy.intro}</p>
      </header>
      {groups.map((group) => (
        <section key={group} id={group} className="mx-auto max-w-4xl px-4 py-6">
          <h2 className="text-2xl font-bold">{copy.groups[group]}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programmes
              .filter((p) => p.group === group)
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
      ))}
      <section id="languages" className="mx-auto max-w-4xl px-4 py-6">
        <h2 className="text-2xl font-bold">{copy.languages}</h2>
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
      <section id="international-education" className="mx-auto max-w-4xl px-4 py-6 pb-12">
        <h2 className="text-2xl font-bold">{copy.internationalEducation}</h2>
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

// Content contract for the whole site.
// Every page is data (this file's types) rendered by shared section components —
// the designer restyles components without touching content, and the future
// admin panel can replace these static files with DB rows of the same shape.

export type Locale = "en" | "ua";

export const LOCALES: Locale[] = ["en", "ua"];
export const DEFAULT_LOCALE: Locale = "en";

/** URL prefix is /ua, but the language itself is ISO "uk" (hreflang, <html lang>). */
export const HTML_LANG: Record<Locale, string> = { en: "en-GB", ua: "uk" };

export interface SeoMeta {
  /** Unique per page, <= 60 chars. */
  title: string;
  /** Unique per page, ~150 chars. */
  description: string;
}

export interface Cta {
  label: string;
  /** Locale-relative path ("/book-assessment") or absolute URL. */
  href: string;
}

export interface Hero {
  eyebrow?: string;
  /** The page's single H1. */
  title: string;
  subtitle?: string;
  body?: string[];
  ctas?: Cta[];
}

export interface Card {
  title: string;
  eyebrow?: string;
  body?: string;
  items?: string[];
  /** Path under /public, or "placeholder" for the grey X square. */
  image?: string;
  href?: string;
  linkLabel?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  credentials?: string;
  bio?: string;
  /** Path under /public; absent -> grey placeholder. */
  photo?: string;
}

export type Block =
  | { type: "lead"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "cards"; cards: Card[] }
  | { type: "steps"; steps: { title: string; body?: string }[] }
  | { type: "stats"; stats: { value: string; label: string }[] }
  | { type: "testimonials"; items: { quote: string; author: string; tag?: string }[] }
  | { type: "faq"; items: { question: string; answer: string }[] }
  | { type: "team"; members: TeamMember[] }
  | { type: "image"; alt: string; src?: string }
  | { type: "cta"; title: string; body?: string; note?: string; cta: Cta }
  | { type: "buttons"; ctas: Cta[] };

export interface Section {
  /** Stable anchor id, kebab-case, same in both locales. */
  id: string;
  /** Small uppercase kicker above the H2 (e.g. "How It Works"). */
  eyebrow?: string;
  /** Rendered as H2. */
  title?: string;
  intro?: string;
  blocks: Block[];
}

export interface Page {
  meta: SeoMeta;
  hero: Hero;
  sections: Section[];
}

/* ---------- Programmes (Pathways sub-pages) ---------- */

export type ProgrammeGroup =
  | "education-pathways"
  | "english-qualifications"
  // Per the final client doc (Aug 2026) these live under Global Integration.
  | "international-qualifications";

export const PROGRAMME_SLUGS = [
  "sats-preparation",
  "11-plus-preparation",
  "secondary-education",
  "gcse-pathways",
  "post-16-pathways",
  "university-application-support",
  "cambridge-english-qualifications",
  "ielts-preparation",
  "selt-preparation",
  "functional-skills-english-maths",
  "esol",
] as const;

export type ProgrammeSlug = (typeof PROGRAMME_SLUGS)[number];

export interface ProgrammePage extends Page {
  slug: ProgrammeSlug;
  group: ProgrammeGroup;
  /** Short name for hub cards / navigation. */
  cardTitle: string;
  cardBlurb: string;
  atAGlance: { label: string; value: string }[];
}

/* ---------- Global Integration language sub-pages ---------- */

export const LANGUAGE_SLUGS = [
  "spanish",
  "french",
  "german",
  "italian",
  "portuguese",
  "ukrainian",
] as const;

export type LanguageSlug = (typeof LANGUAGE_SLUGS)[number];

export interface LanguagePage extends Page {
  slug: LanguageSlug;
  /** Short name for hub cards / breadcrumbs, e.g. "Spain · Spanish". */
  cardTitle: string;
}

/* ---------- Forms (structure only for now; wired to Supabase later) ---------- */

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea" | "file" | "checkbox";
  required?: boolean;
  options?: string[];
  hint?: string;
}

export interface FormSpec {
  title: string;
  intro?: string;
  fields: FormField[];
  submitLabel: string;
  /** Shown while the backend is not wired up. */
  disabledNote: string;
}

export interface FormPage extends Page {
  form: FormSpec;
}

/* ---------- Insights ---------- */

export type InsightCategoryId =
  | "uk-education"
  | "english-qualifications"
  | "career-workplace"
  | "integration-uk"
  | "language-learning";

export const INSIGHT_CATEGORY_IDS: InsightCategoryId[] = [
  "uk-education",
  "english-qualifications",
  "career-workplace",
  "integration-uk",
  "language-learning",
];

export interface InsightsIndexPage extends Page {
  categories: { id: InsightCategoryId; label: string; blurb?: string }[];
}

export interface InsightPost {
  slug: string;
  title: string;
  description: string;
  category: InsightCategoryId;
  /** ISO date, e.g. "2026-08-01". */
  date: string;
  /** Sample posts are noindexed and clearly labelled in the UI. */
  sample?: boolean;
  body: Block[];
}

/* ---------- Site-wide dictionary ---------- */

export interface NavDict {
  home: string;
  about: string;
  pathways: string;
  pathwaysBritish: string;
  pathwaysGlobal: string;
  courses: string;
  insights: string;
  bookAssessment: string;
  contact: string;
}

export interface FooterDict {
  tagline: string;
  groups: { title: string; links: { label: string; href: string }[] }[];
  contactHeading: string;
  addressLabel: string;
  followHeading: string;
}

export interface UiDict {
  skipToContent: string;
  openMenu: string;
  breadcrumbsHome: string;
  atAGlance: string;
  explore: string;
  readMore: string;
  allCategories: string;
  postedIn: string;
  samplePostNotice: string;
  formNotWired: string;
  localeSwitchLabel: string;
  imagePlaceholder: string;
  stage2Notice: string;
  formSent: string;
  formError: string;
  meetFullTeam: string;
}

export interface CommonDict {
  siteName: string;
  nav: NavDict;
  footer: FooterDict;
  ui: UiDict;
}

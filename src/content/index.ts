// Static content registry. Everything is imported statically so every page is
// fully known at build time (SSG). When the admin panel lands, Insights posts
// move from these files to the database — the types stay the same.

import type {
  CommonDict,
  FormPage,
  InsightPost,
  InsightsIndexPage,
  LanguagePage,
  LanguageSlug,
  Locale,
  Page,
  ProgrammePage,
  ProgrammeSlug,
} from "./types";

import { common as enCommon } from "./en/common";
import { common as uaCommon } from "./ua/common";
import { page as enHome } from "./en/home";
import { page as uaHome } from "./ua/home";
import { page as enAbout } from "./en/about";
import { page as uaAbout } from "./ua/about";
import { page as enBookAssessment } from "./en/book-assessment";
import { page as uaBookAssessment } from "./ua/book-assessment";
import { page as enContact } from "./en/contact";
import { page as uaContact } from "./ua/contact";
import { page as enInsights } from "./en/insights";
import { page as uaInsights } from "./ua/insights";
import { posts as enPosts } from "./en/insights-posts";
import { posts as uaPosts } from "./ua/insights-posts";
import { page as enBritishHub } from "./en/pathways/british-education";
import { page as uaBritishHub } from "./ua/pathways/british-education";
import { page as enGlobal } from "./en/pathways/global-integration";
import { page as uaGlobal } from "./ua/pathways/global-integration";
import { pages as enLanguages } from "./en/pathways/global-integration-languages";
import { pages as uaLanguages } from "./ua/pathways/global-integration-languages";

import { page as enSats } from "./en/pathways/programmes/sats-preparation";
import { page as enElevenPlus } from "./en/pathways/programmes/11-plus-preparation";
import { page as enSecondary } from "./en/pathways/programmes/secondary-education";
import { page as enGcse } from "./en/pathways/programmes/gcse-pathways";
import { page as enPost16 } from "./en/pathways/programmes/post-16-pathways";
import { page as enUniversity } from "./en/pathways/programmes/university-application-support";
import { page as enCambridge } from "./en/pathways/programmes/cambridge-english-qualifications";
import { page as enIelts } from "./en/pathways/programmes/ielts-preparation";
import { page as enSelt } from "./en/pathways/programmes/selt-preparation";
import { page as enFunctional } from "./en/pathways/programmes/functional-skills-english-maths";
import { page as enEsol } from "./en/pathways/programmes/esol";

import { page as uaSats } from "./ua/pathways/programmes/sats-preparation";
import { page as uaElevenPlus } from "./ua/pathways/programmes/11-plus-preparation";
import { page as uaSecondary } from "./ua/pathways/programmes/secondary-education";
import { page as uaGcse } from "./ua/pathways/programmes/gcse-pathways";
import { page as uaPost16 } from "./ua/pathways/programmes/post-16-pathways";
import { page as uaUniversity } from "./ua/pathways/programmes/university-application-support";
import { page as uaCambridge } from "./ua/pathways/programmes/cambridge-english-qualifications";
import { page as uaIelts } from "./ua/pathways/programmes/ielts-preparation";
import { page as uaSelt } from "./ua/pathways/programmes/selt-preparation";
import { page as uaFunctional } from "./ua/pathways/programmes/functional-skills-english-maths";
import { page as uaEsol } from "./ua/pathways/programmes/esol";

const PROGRAMMES: Record<Locale, ProgrammePage[]> = {
  en: [
    enSats, enElevenPlus, enSecondary, enGcse, enPost16, enUniversity,
    enCambridge, enIelts, enSelt, enFunctional, enEsol,
  ],
  ua: [
    uaSats, uaElevenPlus, uaSecondary, uaGcse, uaPost16, uaUniversity,
    uaCambridge, uaIelts, uaSelt, uaFunctional, uaEsol,
  ],
};

export const getCommon = (locale: Locale): CommonDict =>
  locale === "ua" ? uaCommon : enCommon;

export const getHome = (locale: Locale): Page => (locale === "ua" ? uaHome : enHome);
export const getAbout = (locale: Locale): Page => (locale === "ua" ? uaAbout : enAbout);
export const getBookAssessment = (locale: Locale): FormPage =>
  locale === "ua" ? uaBookAssessment : enBookAssessment;
export const getContact = (locale: Locale): FormPage =>
  locale === "ua" ? uaContact : enContact;
export const getInsightsIndex = (locale: Locale): InsightsIndexPage =>
  locale === "ua" ? uaInsights : enInsights;
export const getBritishHub = (locale: Locale): Page =>
  locale === "ua" ? uaBritishHub : enBritishHub;
export const getGlobalIntegration = (locale: Locale): Page =>
  locale === "ua" ? uaGlobal : enGlobal;

export const getProgrammes = (locale: Locale): ProgrammePage[] => PROGRAMMES[locale];

const LANGUAGES: Record<Locale, LanguagePage[]> = { en: enLanguages, ua: uaLanguages };

export const getLanguagePages = (locale: Locale): LanguagePage[] => LANGUAGES[locale];

export const getLanguagePage = (
  locale: Locale,
  slug: string,
): LanguagePage | undefined => LANGUAGES[locale].find((p) => p.slug === (slug as LanguageSlug));

export const getProgramme = (
  locale: Locale,
  slug: string,
): ProgrammePage | undefined => PROGRAMMES[locale].find((p) => p.slug === (slug as ProgrammeSlug));

export const getPosts = (locale: Locale): InsightPost[] =>
  (locale === "ua" ? uaPosts : enPosts)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

export const getPost = (locale: Locale, slug: string): InsightPost | undefined =>
  getPosts(locale).find((p) => p.slug === slug);

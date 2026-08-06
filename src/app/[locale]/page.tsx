import Link from "next/link";
import type { Metadata } from "next";
import { getCommon, getHome } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, SectionView } from "@/components/BlockRenderer";
import { localeHref } from "@/lib/links";
import { getPublicPosts } from "@/lib/insights";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

// The Insights preview pulls from the database; ISR keeps home static.
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/", getHome(locale).meta);
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const page = getHome(locale);
  const dict = getCommon(locale);
  const posts = (await getPublicPosts(locale)).slice(0, 3);

  const finalCta = page.sections.find((s) => s.id === "final-cta");
  const sections = page.sections.filter((s) => s.id !== "final-cta");

  return (
    <>
      <HeroSection hero={page.hero} locale={locale} />
      {sections.map((section) => (
        <SectionView key={section.id} section={section} locale={locale} />
      ))}
      <section id="insights-preview" className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="text-2xl font-bold">{dict.nav.insights}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} className="border border-neutral-300 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                {new Date(post.date).toLocaleDateString(locale === "ua" ? "uk-UA" : "en-GB")}
              </p>
              <h3 className="mt-1 font-semibold">
                <Link href={localeHref(locale, `/insights/${post.slug}`)} className="hover:underline">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-neutral-700">{post.description}</p>
            </li>
          ))}
        </ul>
      </section>
      {finalCta && <SectionView section={finalCta} locale={locale} />}
    </>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { getCommon, getHome } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, SectionView } from "@/components/BlockRenderer";
import { localeHref } from "@/lib/links";
import { getPublicPosts } from "@/lib/insights";
import { getFeaturedReviews } from "@/lib/reviews";
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
  const [posts, featured] = await Promise.all([getPublicPosts(locale), getFeaturedReviews()]);

  // Marketing-picked (approved + featured) reviews replace the static
  // testimonials; with none picked, the client-supplied quotes stay. The team
  // preview is trimmed to photo/name/role (client, Aug 2026) — full details
  // stay on the About page.
  const withFeatured = page.sections.map((section) => {
    if (section.id === "results" && featured.length > 0) {
      return {
        ...section,
        blocks: section.blocks.map((block) =>
          block.type === "testimonials"
            ? {
                type: "testimonials" as const,
                items: featured.map((review) => ({
                  quote: review.quote,
                  author: review.author_name,
                  tag: review.author_tag || review.programme || undefined,
                })),
              }
            : block,
        ),
      };
    }
    if (section.id === "meet-our-team") {
      return {
        ...section,
        blocks: [
          ...section.blocks.map((block) =>
            block.type === "team"
              ? {
                  type: "team" as const,
                  members: block.members.map(({ name, role, photo }) => ({ name, role, photo })),
                }
              : block,
          ),
          {
            type: "buttons" as const,
            ctas: [{ label: dict.ui.meetFullTeam, href: "/about#our-educators" }],
          },
        ],
      };
    }
    return section;
  });

  const finalCta = withFeatured.find((s) => s.id === "final-cta");
  const sections = withFeatured.filter((s) => s.id !== "final-cta");

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

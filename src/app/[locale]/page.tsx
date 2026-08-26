import Link from "next/link";
import type { Metadata } from "next";
import { getCommon, getHome } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, SectionView } from "@/components/BlockRenderer";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { IconArrowRight } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
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
      {/* Insights: one featured post, the rest compact (client, 25 Aug 2026). */}
      <Section id="insights-preview" tone="cream">
        <SectionHeading title={dict.nav.insights} />
        {posts.length > 0 && (
          <ul className="mt-10 grid gap-10 lg:grid-cols-12">
            {posts.slice(0, 3).map((post, i) => {
              const date = new Date(post.date).toLocaleDateString(locale === "ua" ? "uk-UA" : "en-GB");
              const href = localeHref(locale, `/insights/${post.slug}`);
              return i === 0 ? (
                <li key={post.slug} className="lg:col-span-7">
                  <article className="group">
                    <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
                      <ImagePlaceholder alt={post.title} aspect="aspect-[16/9]" />
                    </Link>
                    <p className="mt-5">
                      <Chip>{date}</Chip>
                    </p>
                    <h3 className="text-h2 mt-3 text-ink">
                      <Link href={href} className="decoration-brand decoration-2 underline-offset-4 group-hover:underline">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-3 max-w-2xl text-base">{post.description}</p>
                  </article>
                </li>
              ) : (
                <li
                  key={post.slug}
                  className={cx("lg:col-span-5", i === 1 ? "lg:col-start-8" : "lg:col-start-8")}
                >
                  <article className="group border-t border-ink pt-5">
                    <p>
                      <Chip>{date}</Chip>
                    </p>
                    <h3 className="text-h3 mt-3 text-ink">
                      <Link href={href} className="decoration-brand decoration-2 underline-offset-4 group-hover:underline">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm">{post.description}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-10">
          <Link
            href={localeHref(locale, "/insights")}
            className="inline-flex items-center gap-2 text-base font-bold text-primary underline decoration-brand/40 decoration-2 underline-offset-[6px] hover:decoration-brand"
          >
            {dict.ui.readMore}
            <IconArrowRight size={18} />
          </Link>
        </p>
      </Section>
      {finalCta && <SectionView section={finalCta} locale={locale} />}
    </>
  );
}

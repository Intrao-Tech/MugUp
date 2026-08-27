import Link from "next/link";
import type { Metadata } from "next";
import { getCommon, getInsightsIndex } from "@/content";
import type { Locale } from "@/content/types";
import { HeroSection, PageSections } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { localeHref } from "@/lib/links";
import { getPublicCategories, getPublicPosts } from "@/lib/insights";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

// Posts come from the database (admin-managed); ISR keeps the page static
// and the admin actions revalidate it on publish/delete.
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "/insights", getInsightsIndex(locale).meta);
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params;
  const page = getInsightsIndex(locale);
  const dict = getCommon(locale);
  const [posts, categories] = await Promise.all([
    getPublicPosts(locale),
    getPublicCategories(locale),
  ]);

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.insights },
        ]}
      />
      <HeroSection hero={page.hero} locale={locale} visual="none" />
      <nav aria-label={dict.ui.allCategories} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap gap-3 text-sm">
          {categories.map((cat) => (
            <li key={cat.id}>
              <a href={`#category-${cat.id}`} className="rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold text-ink hover:border-brand">
                {cat.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <PageSections sections={page.sections} locale={locale} />
      {categories.map((cat) => {
        const catPosts = posts.filter((p) => p.category === cat.id);
        return (
          <section key={cat.id} id={`category-${cat.id}`} className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h2 className="text-h2 text-ink">{cat.label}</h2>
            {cat.blurb && <p className="mt-1 text-body">{cat.blurb}</p>}
            {catPosts.length > 0 ? (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {catPosts.map((post) => (
                  <li key={post.slug} className="rounded-card border border-ink bg-surface p-6 shadow-plate">
                    <p className="text-eyebrow uppercase text-muted">
                      {new Date(post.date).toLocaleDateString(locale === "ua" ? "uk-UA" : "en-GB")}
                    </p>
                    <h3 className="mt-1 font-semibold">
                      <Link
                        href={localeHref(locale, `/insights/${post.slug}`)}
                        className="hover:underline"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-body">{post.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">—</p>
            )}
          </section>
        );
      })}
    </>
  );
}

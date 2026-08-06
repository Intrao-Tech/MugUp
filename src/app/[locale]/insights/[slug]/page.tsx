import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCommon } from "@/content";
import type { Locale } from "@/content/types";
import { BlockView } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { Markdown } from "@/components/Markdown";
import { getPublicCategories, getPublicPost } from "@/lib/insights";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

// Article pages are database-driven; ISR + revalidation on publish/delete.
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublicPost(locale, slug);
  if (!post) return {};
  const otherLocale: Locale = locale === "en" ? "ua" : "en";
  const hasTranslation = Boolean(await getPublicPost(otherLocale, slug));
  return pageMetadata(
    locale,
    `/insights/${slug}`,
    { title: post.title, description: post.description },
    // Only the static fallback samples are noindexed; hreflang only when the
    // translation actually exists.
    { noindex: post.sample, singleLocale: !hasTranslation },
  );
}

export default async function InsightPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = await getPublicPost(locale, slug);
  if (!post) notFound();
  const dict = getCommon(locale);
  const category = (await getPublicCategories(locale)).find((c) => c.id === post.category);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: locale === "ua" ? "uk" : "en-GB",
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/${locale}/insights/${slug}`,
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <Breadcrumbs
        locale={locale}
        items={[
          { label: dict.ui.breadcrumbsHome, href: "/" },
          { label: dict.nav.insights, href: "/insights" },
          { label: post.title },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-8">
        {post.sample && (
          <p className="mb-4 border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
            {dict.ui.samplePostNotice}
          </p>
        )}
        <header>
          <p className="text-sm text-neutral-500">
            {new Date(post.date).toLocaleDateString(locale === "ua" ? "uk-UA" : "en-GB")}
            {category && (
              <>
                {" · "}
                {dict.ui.postedIn} {category.label}
              </>
            )}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{post.title}</h1>
        </header>
        <div className="mt-6 space-y-4">
          {post.bodyMd !== null ? (
            <Markdown source={post.bodyMd} />
          ) : (
            post.blocks?.map((block, i) => <BlockView key={i} block={block} locale={locale} />)
          )}
        </div>
      </article>
    </>
  );
}

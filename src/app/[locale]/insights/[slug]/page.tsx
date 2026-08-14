import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCommon } from "@/content";
import type { Locale } from "@/content/types";
import { BlockView } from "@/components/BlockRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { Markdown } from "@/components/Markdown";
import { PostBody } from "@/components/PostBody";
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
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/${locale}/insights/${slug}`,
    ...(post.heroImageUrl ? { image: post.heroImageUrl } : {}),
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
      {/* The body container is deliberately unconstrained: builder-v2 blocks
          carry their own width wrappers (normal / wide / full-bleed). */}
      <article className="py-8">
        <div className="mx-auto max-w-3xl px-4">
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
              {post.author && <> · {post.author}</>}
            </p>
            <h1 className="mt-2 text-3xl font-bold">{post.title}</h1>
          </header>
          {post.heroImageUrl && (
            <img src={post.heroImageUrl} alt={post.heroImageAlt} className="mt-6 w-full" />
          )}
        </div>
        {post.bodyBlocks ? (
          <div className="mt-6">
            <PostBody blocks={post.bodyBlocks} />
          </div>
        ) : (
          <div className="mx-auto mt-6 max-w-3xl space-y-4 px-4">
            {post.bodyMd !== null ? (
              <Markdown source={post.bodyMd} />
            ) : (
              post.blocks?.map((block, i) => <BlockView key={i} block={block} locale={locale} />)
            )}
          </div>
        )}
        <div className="mx-auto max-w-3xl px-4">
          {post.ctaLabel && post.ctaUrl && (
            <aside className="mt-8 border border-neutral-900 p-6 text-center">
              <a
                href={post.ctaUrl.startsWith("http") ? post.ctaUrl : `/${locale}${post.ctaUrl}`}
                className="inline-block border border-neutral-900 px-6 py-2 font-medium"
              >
                {post.ctaLabel}
              </a>
            </aside>
          )}
        </div>
      </article>
    </>
  );
}

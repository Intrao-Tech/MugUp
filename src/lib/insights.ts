import type { Block, InsightPost, Locale } from "@/content/types";
import type { PostRow } from "@/lib/db-types";
import { getInsightsIndex, getPosts as getStaticPosts } from "@/content";
import { getData, isBackendConfigured } from "@/lib/data";

// Public Insights source of truth: the database (admin-managed). The static
// sample posts only appear when no backend is configured (bare checkout),
// and stay noindexed.

export interface PublicPost {
  slug: string;
  title: string;
  description: string;
  /** Category slug; categories themselves are admin-managed. */
  category: string;
  /** ISO date shown to readers (publication date). */
  date: string;
  /** True only for the static fallback samples (noindexed). */
  sample: boolean;
  /** Static fallback posts carry structured blocks... */
  blocks: Block[] | null;
  /** ...database posts carry Markdown. */
  bodyMd: string | null;
}

export interface PublicCategory {
  id: string;
  label: string;
  blurb?: string;
}

export async function getPublicCategories(locale: Locale): Promise<PublicCategory[]> {
  if (isBackendConfigured()) {
    try {
      const data = await getData();
      const rows = await data.posts.listCategories();
      if (rows.length) {
        return rows.map((row) => ({
          id: row.slug,
          label: locale === "ua" ? row.label_ua : row.label_en,
        }));
      }
    } catch {
      // fall through to the static list
    }
  }
  return getInsightsIndex(locale).categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    blurb: cat.blurb,
  }));
}

function fromRow(row: PostRow): PublicPost {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    date: row.published_at ?? row.created_at,
    sample: false,
    blocks: null,
    bodyMd: row.body_md,
  };
}

function fromStatic(post: InsightPost): PublicPost {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    date: post.date,
    sample: true,
    blocks: post.body,
    bodyMd: null,
  };
}

export async function getPublicPosts(locale: Locale): Promise<PublicPost[]> {
  if (isBackendConfigured()) {
    try {
      const data = await getData();
      return (await data.posts.listPublished(locale)).map(fromRow);
    } catch {
      // Database unreachable — an empty listing beats a crashed page.
      return [];
    }
  }
  return getStaticPosts(locale).map(fromStatic);
}

export async function getPublicPost(locale: Locale, slug: string): Promise<PublicPost | null> {
  if (isBackendConfigured()) {
    try {
      const data = await getData();
      const row = await data.posts.getPublished(locale, slug);
      return row ? fromRow(row) : null;
    } catch {
      return null;
    }
  }
  const post = getStaticPosts(locale).find((p) => p.slug === slug);
  return post ? fromStatic(post) : null;
}

/** Published slugs per locale — the sitemap and hreflang need to know which
 *  language versions actually exist (static samples are noindexed → empty). */
export async function getPublishedSlugSets(): Promise<{ en: string[]; ua: string[] }> {
  if (!isBackendConfigured()) return { en: [], ua: [] };
  try {
    const data = await getData();
    const [en, ua] = await Promise.all([
      data.posts.listPublished("en"),
      data.posts.listPublished("ua"),
    ]);
    return { en: en.map((p) => p.slug), ua: ua.map((p) => p.slug) };
  } catch {
    return { en: [], ua: [] };
  }
}

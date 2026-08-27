import Link from "next/link";
import type { Block, Card as CardData, Hero, Locale, Section as SectionData } from "@/content/types";
import { localeHref } from "@/lib/links";
import { cx } from "@/lib/cx";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { ScrollRail } from "@/components/ScrollRail";
import {
  blockOf,
  CatalogueRows,
  ChipRow,
  ClosingBand,
  GoalRow,
  GridTwo,
  IconList,
  IconRow,
  JourneyTrack,
  PathwayPanels,
  PathwayTrack,
  SplitPhoto,
  Statement,
  TeamRail,
  TrustStrip,
  TypoStats,
  VideoPlaceholder,
} from "@/components/Editorial";
import { Button } from "@/components/ui/Button";
import { Card, STRETCHED_LINK } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Eyebrow, SectionHeading } from "@/components/ui/Heading";
import { IconArrowRight, IconCheck, IconChevronDown } from "@/components/ui/icons";
import { Section, type SectionTone } from "@/components/ui/Section";
import { photoFor } from "@/lib/photos";

/* -------------------------------------------------------------------------
   Content → design. Copy and structure come from src/content and are never
   altered here; this file decides only how each block LOOKS.
   Design rules: docs/DESIGN-SYSTEM.md. Editorial layouts: Editorial.tsx.
   ------------------------------------------------------------------------- */

/* ---------------------------------- Hero --------------------------------- */

export function HeroSection({
  hero,
  locale,
  visual = "photo",
  glance,
  statement = false,
  route,
}: {
  hero: Hero;
  locale: Locale;
  /** Locale-relative route ("/about") — looks up `hero:<route>` in the photo registry. */
  route?: string;
  /** "photo" = big editorial visual on the right (placeholder until the client supplies photography). */
  visual?: "photo" | "none";
  /** Programme facts stacked over the visual (Age · Years · Format · Assessment). */
  glance?: { label: string; value: string }[];
  /** The title is the graphic (About): display size, uppercase. */
  statement?: boolean;
}) {
  const photo = visual === "photo";
  const img = route ? photoFor(`hero:${route}`) : undefined;
  return (
    <section aria-labelledby="page-title" className="relative overflow-hidden">
      <Container
        size={photo ? "wide" : "content"}
        className={cx("relative py-10 sm:py-14", photo ? "grid gap-10 lg:grid-cols-12 lg:items-center" : "lg:py-20")}
      >
        <div className={cx("min-w-0", photo ? "lg:col-span-6 lg:py-10" : "max-w-3xl")}>
          {hero.eyebrow && <Eyebrow className="mb-4">{hero.eyebrow}</Eyebrow>}
          <h1
            id="page-title"
            className={cx("text-balance break-words text-ink", statement ? "text-statement uppercase" : "text-display")}
          >
            {hero.title}
          </h1>
          {hero.subtitle && <p className="mt-5 text-lead font-medium text-ink">{hero.subtitle}</p>}
          {hero.body?.map((p) => (
            <p key={p.slice(0, 40)} className="mt-4 max-w-prose text-base">
              {p}
            </p>
          ))}
          {hero.ctas && hero.ctas.length > 0 && (
            <p className="mt-8 flex flex-wrap gap-3">
              {hero.ctas.map((cta, i) => (
                <Button
                  key={cta.href}
                  href={localeHref(locale, cta.href)}
                  variant={i === 0 ? "primary" : "secondary"}
                  size="lg"
                >
                  {cta.label}
                  {i === 0 && <IconArrowRight />}
                </Button>
              ))}
            </p>
          )}
        </div>
        {photo && (
          <div className="relative min-w-0 lg:col-span-6">
            {img ? (
              <img
                src={img.src}
                alt={img.alt[locale]}
                width={1600}
                height={1280}
                fetchPriority="high"
                className="aspect-[4/3] w-full rounded-card object-cover lg:aspect-[5/4]"
                style={img.position ? { objectPosition: img.position } : undefined}
              />
            ) : (
              <ImagePlaceholder alt={hero.title} aspect="aspect-[4/3] lg:aspect-[5/4]" />
            )}
            {glance && glance.length > 0 && (
              <dl className="mt-4 grid grid-cols-2 gap-2 sm:absolute sm:bottom-6 sm:right-6 sm:mt-0 sm:grid-cols-1 sm:gap-0 sm:divide-y sm:divide-line sm:rounded-card sm:border sm:border-ink sm:bg-surface">
                {glance.map((g) => (
                  <div key={g.label} className="rounded-card border border-ink bg-surface px-4 py-3 sm:rounded-none sm:border-0">
                    <dt className="text-eyebrow uppercase text-muted">{g.label}</dt>
                    <dd className="mt-0.5 font-display text-h3 text-ink">{g.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}

/* --------------------------------- Pieces -------------------------------- */

function CheckList({ items, columns = true }: { items: string[]; columns?: boolean }) {
  return (
    <ul className={cx("grid gap-3", columns && "sm:grid-cols-2")}>
      {items.map((it) => (
        <li key={it} className="flex items-start gap-3 text-base">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 [[data-tone=ink]_&]:bg-white/10 [[data-tone=ink]_&]:text-accent [[data-tone=teal]_&]:bg-white/15 [[data-tone=teal]_&]:text-white">
            <IconCheck size={14} strokeWidth={3} />
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function CardItem({ card, locale }: { card: CardData; locale: Locale }) {
  const interactive = Boolean(card.href);
  return (
    <Card as="article" interactive={interactive} padded={false} className="h-full">
      {card.image === "placeholder" && (
        <ImagePlaceholder alt={card.title} aspect="aspect-video" className="rounded-none border-0 border-b" />
      )}
      {card.image && card.image !== "placeholder" && (
        <img src={card.image} alt={card.title} loading="lazy" className="aspect-video w-full border-b border-ink object-cover" />
      )}
      <div className="flex grow flex-col p-6">
        {card.eyebrow && <Eyebrow className="mb-2">{card.eyebrow}</Eyebrow>}
        <h3 className="text-h3 text-ink">
          {interactive ? (
            <Link href={localeHref(locale, card.href!)} className={STRETCHED_LINK}>
              {card.title}
            </Link>
          ) : (
            card.title
          )}
        </h3>
        {card.body && <p className="mt-3 text-base">{card.body}</p>}
        {card.items && (
          <ul className="mt-4 space-y-2">
            {card.items.map((it) => (
              <li key={it} className="flex items-start gap-2 text-sm">
                <IconCheck size={16} className="mt-1 shrink-0 text-brand" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        )}
        {interactive && (
          <p className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-bold text-primary">
            {card.linkLabel ?? card.title}
            <IconArrowRight size={16} />
          </p>
        )}
      </div>
    </Card>
  );
}

/* --------------------------------- Blocks -------------------------------- */

export function BlockView({
  block,
  locale,
  variant = "marketing",
}: {
  block: Block;
  locale: Locale;
  /** "article" = long-form reading (Insights posts): plain lists, prose measure. */
  variant?: "marketing" | "article";
}) {
  const article = variant === "article";
  switch (block.type) {
    case "lead":
      return <p className="max-w-3xl text-lead font-medium text-ink">{block.text}</p>;
    case "paragraph":
      return <p className="max-w-3xl text-base">{block.text}</p>;
    case "list":
      return article ? (
        <ul className="max-w-3xl list-disc space-y-1.5 pl-6 text-base marker:text-brand">
          {block.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      ) : (
        <CheckList items={block.items} />
      );
    case "cards":
      return (
        <div
          className={cx(
            "grid gap-6",
            block.cards.length === 2 ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {block.cards.map((card) => (
            <CardItem key={card.title} card={card} locale={locale} />
          ))}
        </div>
      );
    case "steps":
      return <PathwayTrack stops={block.steps} locale={locale} />;
    case "stats":
      return <TypoStats stats={block.stats} />;
    case "testimonials":
      // Featured reviews (any count, database-driven): one editorial quote
      // per slide in a scroll rail — arrows appear only when there is more
      // than fits (client, 21 Aug 2026).
      return (
        <ScrollRail label="Reviews" locale={locale}>
          {block.items.map((t) => (
            <li
              key={t.author + (t.tag ?? "")}
              className="w-[88%] shrink-0 snap-start border-t-2 border-ink pt-6 sm:w-[34rem] lg:w-[38rem]"
            >
              <figure className="flex h-full flex-col">
                <blockquote className="text-quote grow text-ink [hanging-punctuation:first]">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6">
                  <span className="block text-sm font-bold text-ink">{t.author}</span>
                  {t.tag && (
                    <span className="mt-1 block text-eyebrow uppercase text-muted">{t.tag}</span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ScrollRail>
      );
    case "faq":
      return (
        <div className="max-w-3xl divide-y divide-line border-y border-ink">
          {block.items.map((f) => (
            <details key={f.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-base font-bold text-ink [&::-webkit-details-marker]:hidden">
                {f.question}
                <IconChevronDown className="shrink-0 text-brand transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-2 pt-3 text-base">{f.answer}</p>
            </details>
          ))}
        </div>
      );
    case "team":
      return <TeamRail members={block.members} locale={locale} />;
    case "logos":
      return (
        <ul className="flex flex-wrap items-center gap-6">
          {block.items.map((logo) => {
            const img = <img src={logo.src} alt={logo.alt} loading="lazy" className="h-20 w-auto" />;
            return (
              <li key={logo.src}>
                {logo.href ? (
                  <Link href={localeHref(locale, logo.href)} className="block">
                    {img}
                    <span className="sr-only">{logo.alt}</span>
                  </Link>
                ) : (
                  img
                )}
              </li>
            );
          })}
        </ul>
      );
    case "image":
      return block.src ? (
        <img src={block.src} alt={block.alt} loading="lazy" className="w-full rounded-card" />
      ) : (
        <ImagePlaceholder alt={block.alt} />
      );
    case "buttons":
      return (
        <p className="flex flex-wrap gap-3">
          {block.ctas.map((cta, i) => (
            <Button
              key={cta.href + cta.label}
              href={localeHref(locale, cta.href)}
              variant={i === 0 ? "secondary" : "ghost"}
            >
              {cta.label}
              <IconArrowRight size={18} />
            </Button>
          ))}
        </p>
      );
    case "cta":
      return (
        <aside className="border-t border-line pt-8 md:flex md:items-end md:justify-between md:gap-12">
          <div className="max-w-2xl">
            <h3 className="text-h3 text-ink">{block.title}</h3>
            {block.body && <p className="mt-2">{block.body}</p>}
            {block.note && <p className="mt-2 text-sm text-muted">{block.note}</p>}
          </div>
          <p className="mt-6 shrink-0 md:mt-0">
            <Button href={localeHref(locale, block.cta.href)} variant="secondary">
              {block.cta.label}
              <IconArrowRight size={18} />
            </Button>
          </p>
        </aside>
      );
  }
}

/* --------------------------- Section layouts ----------------------------- */

/**
 * Each section id (fixed by the content contract, shared across locales
 * and pages) gets one editorial composition. Unlisted ids fall back to the
 * generic block flow. Keep this table in sync with docs/DESIGN-SYSTEM.md.
 */
type Layout =
  | "flow"
  | "panels" // two big contrasting pathway blocks
  | "icon-list" // list → open icon grid, inline CTA
  | "typo-results" // stats as typography + open list + quotes
  | "split-photo" // 50/50 photo | text
  | "icon-row" // cards → icon, title, text in one ruled row
  | "goal-row" // cards → one horizontal strip of big words
  | "rows" // cards → catalogue rows
  | "grid-2" // cards → open 2×2
  | "statement" // lead as a huge graphic + text columns + chips
  | "word-stack" // LEARN. ADAPT. GROW. ACHIEVE. + compact points
  | "founder" // photo | story, video below
  | "educators" // qualifications chips + light team rail
  | "trust-strip" // list → one ruled uppercase row
  | "partners" // paragraphs + logo + short note + links
  | "journey" // cards → pathway track with age chips
  | "closing"; // one CTA on a teal band

const LAYOUTS: Record<string, Layout> = {
  "what-we-support": "icon-list",
  "choose-your-path": "panels",
  "boarding-crosslink": "panels",
  results: "typo-results",
  "for-parents": "split-photo",
  "why-mugup": "icon-row",
  "meet-our-team": "educators",
  "mission-values": "statement",
  "philosophy-methodology": "word-stack",
  "supporting-families": "split-photo",
  "founder-story": "founder",
  "our-educators": "educators",
  "professional-standards": "trust-strip",
  partnerships: "partners",
  "educational-journey": "journey",
  "uk-qualifications": "grid-2",
  "start-with-your-goal": "goal-row",
  "explore-languages-destinations": "rows",
  "why-mugup-global": "icon-row",
  "international-education": "rows",
  "what-you-will-learn": "grid-2",
  "what-you-will-achieve": "icon-list",
  beyond: "icon-row",
  "exams-available": "rows",
  "flexible-online-exams": "icon-row",
  "final-cta": "closing",
  "start-cta": "closing",
};

const TONES: Partial<Record<Layout, SectionTone>> = {
  "typo-results": "cream",
  "icon-row": "cream",
  "trust-strip": "ink",
  closing: "teal",
  educators: "default",
};

/** Sections that are nothing but one CTA close the page on a teal band. */
function isClosing(section: SectionData) {
  return section.blocks.length === 1 && section.blocks[0].type === "cta" && !section.title;
}

function layoutFor(section: SectionData): Layout {
  if (isClosing(section)) return "closing";
  return LAYOUTS[section.id] ?? "flow";
}

const TEXT_BLOCKS = new Set<Block["type"]>(["lead", "paragraph", "list"]);

/** Generic block flow (prose gaps between prose blocks). */
function Flow({ section, locale, skip }: { section: SectionData; locale: Locale; skip?: Set<Block["type"]> }) {
  const blocks = section.blocks.filter((b) => !skip?.has(b.type));
  return (
    <>
      {blocks.map((block, i) => {
        const prev = blocks[i - 1];
        const flowing = i > 0 && TEXT_BLOCKS.has(block.type) && TEXT_BLOCKS.has(prev.type);
        return (
          <div key={`${section.id}-${block.type}-${i}`} className={cx(i > 0 && (flowing ? "mt-4" : "mt-8"))}>
            <BlockView block={block} locale={locale} />
          </div>
        );
      })}
    </>
  );
}

function Prose({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <div className={cx("space-y-4", className)}>
      {blocks.map((b, i) =>
        b.type === "paragraph" ? (
          <p key={i} className="text-base">
            {b.text}
          </p>
        ) : b.type === "lead" ? (
          <p key={i} className="text-lead font-medium text-ink">
            {b.text}
          </p>
        ) : null,
      )}
    </div>
  );
}

function Body({ section, locale, layout }: { section: SectionData; locale: Locale; layout: Layout }) {
  const { blocks } = section;
  const cards = blockOf(blocks, "cards");
  const list = blockOf(blocks, "list");
  const cta = blockOf(blocks, "cta");
  const paragraphs = blocks.filter((b) => b.type === "paragraph" || b.type === "lead");

  switch (layout) {
    case "closing": {
      const c = cta ?? { type: "cta" as const, title: section.title ?? "", cta: blockOf(blocks, "buttons")?.ctas[0] ?? { label: "", href: "/" } };
      const buttons = blockOf(blocks, "buttons")?.ctas ?? [];
      const body = c.body ?? paragraphs.map((p) => p.text).join(" ");
      return (
        <ClosingBand
          title={c.title}
          body={body || undefined}
          note={c.note}
          cta={cta ? c.cta : buttons[0] ?? c.cta}
          extra={cta ? undefined : buttons.slice(1)}
          locale={locale}
        />
      );
    }
    case "panels":
      return cards ? <PathwayPanels cards={cards.cards} locale={locale} /> : <Flow section={section} locale={locale} />;
    case "icon-list":
      return (
        <>
          {list && <IconList items={list.items} columns={list.items.length > 4 ? 3 : 2} />}
          <Flow section={section} locale={locale} skip={new Set(["list"])} />
        </>
      );
    case "typo-results":
      return <Flow section={section} locale={locale} />;
    case "split-photo":
      return (
        <SplitPhoto
          alt={photoFor(`split:${section.id}`)?.alt[locale] ?? section.title ?? section.id}
          src={photoFor(`split:${section.id}`)?.src}
          side={section.id === "for-parents" ? "right" : "left"}
        >
          {list && <CheckList items={list.items} columns={false} />}
          {paragraphs.length > 0 && <Prose blocks={paragraphs} className="mt-6" />}
        </SplitPhoto>
      );
    case "icon-row":
      return (
        <>
          {paragraphs.length > 0 && <Prose blocks={paragraphs} className="mb-10 max-w-3xl" />}
          {cards && <IconRow cards={cards.cards} />}
          {list && <IconList items={list.items} />}
        </>
      );
    case "goal-row":
      return (
        <>
          {cards && <GoalRow cards={cards.cards} />}
          {paragraphs.length > 0 && <Prose blocks={paragraphs} className="mt-6 max-w-3xl" />}
        </>
      );
    case "rows":
      return (
        <>
          {cards && <CatalogueRows cards={cards.cards} locale={locale} />}
          <Flow section={section} locale={locale} skip={new Set(["cards"])} />
        </>
      );
    case "grid-2":
      return cards ? <GridTwo cards={cards.cards} /> : <Flow section={section} locale={locale} />;
    case "statement": {
      const lead = blockOf(blocks, "lead");
      const ps = blocks.filter((b) => b.type === "paragraph");
      return (
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">{lead && <Statement text={lead.text} className="text-[clamp(2.5rem,1.25rem+4vw,4.75rem)]" />}</div>
          <div className="min-w-0">
            <Prose blocks={ps} />
            {cards && (
              <div className="mt-8">
                <ChipRow items={cards.cards.map((c) => c.title)} />
              </div>
            )}
          </div>
        </div>
      );
    }
    case "word-stack": {
      const lead = blockOf(blocks, "lead");
      const words = lead ? lead.text.split(":").pop()!.trim() : "";
      const ps = blocks.filter((b) => b.type === "paragraph");
      return (
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-5">
            {lead && <Statement text={words} className="lg:sticky lg:top-24" />}
          </div>
          <div className="min-w-0 lg:col-span-7">
            <Prose blocks={ps} className="columns-1 md:columns-2 md:gap-10 [&>p]:break-inside-avoid" />
            {cards && (
              <ul className="mt-10 divide-y divide-line border-t border-ink">
                {cards.cards.map((c) => (
                  <li key={c.title} className="grid gap-1 py-4 sm:grid-cols-12 sm:gap-6">
                    <h3 className="text-base font-bold text-ink sm:col-span-5">{c.title}</h3>
                    {c.body && <p className="text-sm sm:col-span-7">{c.body}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }
    case "founder": {
      const video = blockOf(blocks, "image");
      const ps = blocks.filter((b) => b.type === "paragraph");
      return (
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <img
              src="/images/team/ievgeniia.jpg"
              alt="Ievgeniia Angerchik"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-card object-cover object-top"
            />
          </div>
          <div className="lg:col-span-8">
            <Prose blocks={ps} className="max-w-2xl" />
            {video && (
              <div className="mt-8">
                <VideoPlaceholder alt={video.alt} />
              </div>
            )}
          </div>
        </div>
      );
    }
    case "educators": {
      const team = blockOf(blocks, "team");
      return (
        <>
          {list && <ChipRow items={list.items} />}
          {paragraphs.length > 0 && <Prose blocks={paragraphs} className="mt-4 max-w-3xl" />}
          {team && (
            <div className={cx((list || paragraphs.length > 0) && "mt-10")}>
              <TeamRail members={team.members} locale={locale} />
            </div>
          )}
          <Flow section={section} locale={locale} skip={new Set(["list", "paragraph", "lead", "team"])} />
        </>
      );
    }
    case "trust-strip":
      return (
        <>
          {list && <TrustStrip items={list.items} />}
          {paragraphs.length > 0 && <Prose blocks={paragraphs} className="mx-auto mt-6 max-w-3xl text-center text-sm" />}
        </>
      );
    case "partners": {
      const logos = blockOf(blocks, "logos");
      const buttons = blockOf(blocks, "buttons");
      const logosIdx = blocks.findIndex((b) => b.type === "logos");
      const before = blocks.filter((b, i) => b.type === "paragraph" && (logosIdx < 0 || i < logosIdx));
      const after = logosIdx >= 0 ? blocks.filter((b, i) => b.type === "paragraph" && i > logosIdx) : [];
      return (
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Prose blocks={before} />
            {buttons && (
              <div className="mt-6">
                <BlockView block={buttons} locale={locale} />
              </div>
            )}
          </div>
          {logos && (
            <div className="border-t border-ink pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <BlockView block={logos} locale={locale} />
              <Prose blocks={after} className="mt-4 text-sm" />
              {logos.items[0]?.href && (
                <p className="mt-4">
                  <Button href={localeHref(locale, logos.items[0].href)} variant="ghost">
                    {locale === "ua" ? "Докладніше" : "Learn more"}
                    <IconArrowRight size={18} />
                  </Button>
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
    case "journey":
      return cards ? <JourneyTrack stops={cards.cards} locale={locale} /> : <Flow section={section} locale={locale} />;
    case "flow":
    default:
      return <Flow section={section} locale={locale} />;
  }
}

/** A section's composition without the band/heading (for hand-composed pages). */
export function SectionBody({ section, locale }: { section: SectionData; locale: Locale }) {
  return <Body section={section} locale={locale} layout={layoutFor(section)} />;
}

export function SectionView({
  section,
  locale,
  tone,
  layout: forced,
}: {
  section: SectionData;
  locale: Locale;
  tone?: SectionTone;
  layout?: Layout;
}) {
  const layout = forced ?? layoutFor(section);
  const t = tone ?? TONES[layout] ?? "default";
  const closing = layout === "closing";
  const heading = !closing && (section.title || section.eyebrow || section.intro);
  return (
    <Section
      id={section.id}
      tone={t}
      size={layout === "panels" || layout === "journey" ? "wide" : "content"}
      pad={layout === "trust-strip" ? "sm" : closing ? "lg" : "md"}
      className="overflow-hidden"
    >
      {heading && <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} />}
      <div className={cx(heading && "mt-10")}>
        <Body section={section} locale={locale} layout={layout} />
      </div>
    </Section>
  );
}

/**
 * Two sections side by side in one band (client: British boarding | UK
 * qualifications; Global beyond-language | employers).
 */
export function TwoUp({ left, right, locale, tone = "default" }: { left: SectionData; right: SectionData; locale: Locale; tone?: SectionTone }) {
  const Col = ({ s }: { s: SectionData }) => (
    <div id={s.id} className="scroll-mt-20">
      <SectionHeading eyebrow={s.eyebrow} title={s.title} intro={s.intro} as="h2" />
      <div className="mt-8">
        <Body section={s} locale={locale} layout={layoutFor(s)} />
      </div>
    </div>
  );
  return (
    <Section tone={tone} className="overflow-hidden">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Col s={left} />
        <Col s={right} />
      </div>
    </Section>
  );
}

export function PageSections({ sections, locale }: { sections: SectionData[]; locale: Locale }) {
  return (
    <>
      {sections.map((s) => (
        <SectionView key={s.id} section={s} locale={locale} />
      ))}
    </>
  );
}

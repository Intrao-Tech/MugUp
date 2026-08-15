import Link from "next/link";
import type { Block, Card as CardData, Hero, Locale, Section as SectionData } from "@/content/types";
import { localeHref } from "@/lib/links";
import { cx } from "@/lib/cx";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { Card, STRETCHED_LINK } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { BrandRing } from "@/components/ui/decor";
import { Eyebrow, SectionHeading } from "@/components/ui/Heading";
import { IconArrowRight, IconCheck, IconChevronDown, IconQuote } from "@/components/ui/icons";
import { Section, type SectionTone } from "@/components/ui/Section";

/* -------------------------------------------------------------------------
   Content → design. Copy and structure come from src/content and are never
   altered here; this file decides only how each block LOOKS.
   Design rules: docs/DESIGN-SYSTEM.md.
   ------------------------------------------------------------------------- */

/** Home-page section tones (ids are fixed by the TZ). Unlisted sections use the heuristic below. */
const SECTION_TONES: Record<string, SectionTone> = {
  "how-it-works": "cream",
  "for-parents": "cream",
  "final-cta": "ink",
};

function toneFor(section: SectionData): SectionTone {
  if (SECTION_TONES[section.id]) return SECTION_TONES[section.id];
  // A section that is nothing but one CTA is a closing band on every page.
  if (section.blocks.length === 1 && section.blocks[0].type === "cta" && !section.title) return "ink";
  return "default";
}

/* ---------------------------------- Hero --------------------------------- */

export function HeroSection({
  hero,
  locale,
  visual,
}: {
  hero: Hero;
  locale: Locale;
  /** "owl" = brand mark + ring on the right (Home). Default = text only. */
  visual?: "owl";
}) {
  return (
    <section aria-labelledby="page-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-teal-100/70 blur-3xl"
      />
      <Container className="relative grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:items-center lg:py-24">
        <div className={cx("max-w-3xl", visual && "lg:col-span-7")}>
          {hero.eyebrow && <Eyebrow className="mb-4">{hero.eyebrow}</Eyebrow>}
          <h1 id="page-title" className="text-display text-balance text-ink">
            {hero.title}
          </h1>
          {hero.subtitle && <p className="mt-5 text-lead">{hero.subtitle}</p>}
          {hero.body?.map((p) => (
            <p key={p.slice(0, 40)} className="mt-4 max-w-prose text-base text-muted">
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
        {visual === "owl" && (
          <div className="relative hidden aspect-square lg:col-span-5 lg:block" aria-hidden="true">
            <BrandRing className="absolute inset-0 h-full w-full" />
            <picture>
              {/* The visual is lg-only; stop small screens from downloading it. */}
              <source media="(max-width: 63.99rem)" srcSet="data:," />
              <img
                src="/images/owl-mark.png"
                alt=""
                width={476}
                height={720}
                className="absolute left-1/2 top-1/2 h-[62%] w-auto -translate-x-1/2 -translate-y-1/2"
              />
            </picture>
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

const CARD_ACCENT = ["bg-brand", "bg-accent", "bg-ink"] as const;

function CardItem({ card, locale, index }: { card: CardData; locale: Locale; index: number }) {
  const interactive = Boolean(card.href);
  return (
    <Card as="article" interactive={interactive} padded={false} className="h-full">
      <span aria-hidden="true" className={cx("h-1.5 w-full", CARD_ACCENT[index % CARD_ACCENT.length])} />
      {card.image === "placeholder" && (
        <ImagePlaceholder alt={card.title} aspect="aspect-video" className="rounded-none border-0" />
      )}
      {card.image && card.image !== "placeholder" && (
        <img src={card.image} alt={card.title} loading="lazy" className="aspect-video w-full object-cover" />
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
          {block.cards.map((card, i) => (
            <CardItem key={card.title} card={card} locale={locale} index={i} />
          ))}
        </div>
      );
    case "steps":
      return (
        <ol role="list" className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {block.steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="text-h2 shrink-0 font-extrabold tabular-nums leading-none text-brand"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="border-l border-line pl-4">
                <span className="text-h3 block text-ink">{step.title}</span>
                {step.body && <p className="mt-1.5 text-base">{step.body}</p>}
              </div>
            </li>
          ))}
        </ol>
      );
    case "stats":
      return (
        <dl
          data-tone="teal"
          className="grid gap-8 rounded-card bg-teal-600 px-8 py-10 sm:grid-cols-3 sm:gap-6"
        >
          {block.stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-2">
              <dt className="text-sm font-semibold text-muted">{s.label}</dt>
              <dd className="text-stat text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "testimonials":
      return (
        <div
          className={cx(
            "grid gap-6",
            block.items.length % 3 === 0 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2",
          )}
        >
          {block.items.map((t) => (
            <Card as="figure" key={t.author + (t.tag ?? "")} className="h-full">
              <IconQuote size={28} className="text-brand" />
              {t.tag && (
                <p className="mt-4">
                  <Chip>{t.tag}</Chip>
                </p>
              )}
              <blockquote className="mt-4 grow text-base">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-sm font-bold text-ink">— {t.author}</figcaption>
            </Card>
          ))}
        </div>
      );
    case "faq":
      return (
        <div className="max-w-3xl divide-y divide-line rounded-card border border-line bg-surface">
          {block.items.map((f) => (
            <details key={f.question} className="group px-6 py-4">
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
      return (
        <ul
          className={cx(
            "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3",
            block.members.length % 4 === 0 && "xl:grid-cols-4",
          )}
        >
          {block.members.map((m) => (
            <li key={m.name} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <Card as="article" padded={false} className="h-full">
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover object-top"
                  />
                ) : (
                  <ImagePlaceholder alt={m.name} aspect="aspect-[4/5]" className="rounded-none border-0" />
                )}
                <div className="p-5">
                  <h3 className="text-h3 text-ink">{m.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-primary">{m.role}</p>
                  {m.credentials && <p className="mt-2 text-sm text-muted">{m.credentials}</p>}
                  {m.bio && <p className="mt-3 text-sm">{m.bio}</p>}
                </div>
              </Card>
            </li>
          ))}
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
        <aside className="rounded-card border border-line bg-surface-alt p-6 sm:p-8 md:flex md:items-center md:justify-between md:gap-10">
          <div className="max-w-2xl">
            <h3 className="text-h3 text-ink">{block.title}</h3>
            {block.body && <p className="mt-2 text-base">{block.body}</p>}
            {block.note && <p className="mt-3 text-sm text-muted">{block.note}</p>}
          </div>
          <p className="mt-6 shrink-0 md:mt-0">
            <Button href={localeHref(locale, block.cta.href)} size="lg">
              {block.cta.label}
              <IconArrowRight />
            </Button>
          </p>
        </aside>
      );
  }
}

/* -------------------------------- Sections ------------------------------- */

/** Closing band: one CTA, centred, big. Same DOM as the inline `cta` block. */
function ClosingCta({ block, locale }: { block: Extract<Block, { type: "cta" }>; locale: Locale }) {
  return (
    <aside className="relative mx-auto max-w-3xl text-center">
      <BrandRing className="absolute -left-24 -top-24 h-64 w-64 opacity-40 sm:-left-40" />
      <h3 className="text-h2 relative text-balance text-ink">{block.title}</h3>
      {block.body && <p className="relative mt-5 text-lead">{block.body}</p>}
      <p className="relative mt-8">
        <Button href={localeHref(locale, block.cta.href)} size="lg">
          {block.cta.label}
          <IconArrowRight />
        </Button>
      </p>
      {block.note && <p className="relative mt-4 text-sm text-muted">{block.note}</p>}
    </aside>
  );
}

export function SectionView({
  section,
  locale,
  tone,
}: {
  section: SectionData;
  locale: Locale;
  tone?: SectionTone;
}) {
  const t = tone ?? toneFor(section);
  const closing =
    t === "ink" && section.blocks.length === 1 && section.blocks[0].type === "cta" && !section.title;
  return (
    <Section id={section.id} tone={t} className="overflow-hidden">
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} />
      <div className={cx(section.title || section.intro ? "mt-10" : undefined, "space-y-10")}>
        {section.blocks.map((block, i) =>
          closing && block.type === "cta" ? (
            <ClosingCta key={`${section.id}-${i}`} block={block} locale={locale} />
          ) : (
            <BlockView key={`${section.id}-${i}`} block={block} locale={locale} />
          ),
        )}
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

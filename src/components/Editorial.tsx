import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import type { Block, Card as CardData, Cta, Locale, TeamMember } from "@/content/types";
import { localeHref } from "@/lib/links";
import { cx } from "@/lib/cx";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { ScrollRail } from "@/components/ScrollRail";
import { photoFor } from "@/lib/photos";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Heading";
import {
  IconArrowRight,
  IconBook,
  IconBriefcase,
  IconCap,
  IconChart,
  IconChat,
  IconCheck,
  IconCompass,
  IconGlobe,
  IconHome,
  IconPlay,
  IconShield,
  IconSpark,
  IconTarget,
  IconUsers,
} from "@/components/ui/icons";

/* -------------------------------------------------------------------------
   Editorial layouts (client brief, 25 Aug 2026): fewer boxed cards, more
   scale / white space / colour / photography, and ONE recurring graphic
   motif — the pathway line (`PathwayTrack`). Every layout here takes the
   same content blocks as BlockRenderer and only changes how they look.
   ------------------------------------------------------------------------- */

const ICONS: ComponentType<{ size?: number; className?: string }>[] = [
  IconCompass,
  IconBook,
  IconUsers,
  IconChart,
  IconCap,
  IconGlobe,
  IconChat,
  IconTarget,
  IconShield,
  IconSpark,
  IconHome,
  IconBriefcase,
];

/** Decorative icon for the i-th item of a list (stable per position). */
export function ListIcon({ index, size = 28, className }: { index: number; size?: number; className?: string }) {
  const Icon = ICONS[index % ICONS.length];
  return <Icon size={size} className={className} />;
}

const READ_MORE: Record<string, string> = { en: "Read more", ua: "Докладніше" };
const READ_LESS: Record<string, string> = { en: "Show less", ua: "Згорнути" };

/* ---------------------------- Pathway track ------------------------------ */

export interface TrackStop {
  title: string;
  body?: string;
  eyebrow?: string;
  href?: string;
}

/**
 * The Mug.Up signature: one continuous line running through numbered
 * stops — 01 → 02 → … — instead of N independent items. Horizontal on
 * large screens (a rail when there are many stops), vertical on phones.
 */
export function PathwayTrack({
  stops,
  locale,
  numbered = true,
  rail = false,
}: {
  stops: TrackStop[];
  locale: Locale;
  numbered?: boolean;
  rail?: boolean;
}) {
  const items = stops.map((stop, i) => {
    const last = i === stops.length - 1;
    const first = i === 0;
    return (
      <li
        key={stop.title}
        className={cx(
          "relative pl-14 pb-10 lg:pb-0 lg:pl-0 lg:pt-16",
          rail ? "w-[17rem] shrink-0 snap-start" : "",
          last && "pb-0",
        )}
      >
        {/* the line: vertical on phones, horizontal on lg */}
        <span
          aria-hidden="true"
          className={cx(
            "absolute bg-brand",
            "left-[1.1875rem] top-6 w-0.5 lg:hidden",
            last ? "hidden" : "bottom-0",
          )}
        />
        <span
          aria-hidden="true"
          className={cx(
            "absolute top-[1.1875rem] hidden h-0.5 bg-brand lg:block",
            first ? "left-1/2" : "-left-4",
            last ? "right-1/2" : "-right-4",
          )}
        />
        {/* the stop */}
        <span
          aria-hidden="true"
          className={cx(
            "absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-canvas font-display text-base font-bold tabular-nums text-ink",
            "lg:left-1/2 lg:-translate-x-1/2",
            !numbered && "bg-accent",
          )}
        >
          {numbered ? String(i + 1).padStart(2, "0") : ""}
        </span>
        <div className="lg:px-2 lg:text-center">
          {stop.eyebrow && <Eyebrow className="mb-1 text-ink">{stop.eyebrow}</Eyebrow>}
          <h3 className="text-h3 text-ink">
            {stop.href ? (
              <Link
                href={localeHref(locale, stop.href)}
                className="underline decoration-brand/50 decoration-2 underline-offset-4 hover:decoration-brand"
              >
                {stop.title}
              </Link>
            ) : (
              stop.title
            )}
          </h3>
          {stop.body && <p className="mt-1.5 text-sm">{stop.body}</p>}
        </div>
      </li>
    );
  });

  if (rail) {
    return (
      <div className="hidden lg:block">
        <ScrollRail label="Journey" locale={locale}>
          {items}
        </ScrollRail>
      </div>
    );
  }
  return (
    <ol
      role="list"
      className="lg:grid"
      style={{ gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))` }}
    >
      {items}
    </ol>
  );
}

/** Track that is a rail on desktop and a vertical list on phones. */
export function JourneyTrack({ stops, locale }: { stops: TrackStop[]; locale: Locale }) {
  return (
    <>
      <PathwayTrack stops={stops} locale={locale} numbered={false} rail />
      <div className="lg:hidden">
        <PathwayTrack stops={stops} locale={locale} numbered={false} />
      </div>
    </>
  );
}

/* --------------------------- Pathway panels ------------------------------ */

/** Two big contrasting blocks (Britain / Global): photo, big title, list, link. */
export function PathwayPanels({ cards, locale, compact = false }: { cards: CardData[]; locale: Locale; compact?: boolean }) {
  const tones = ["ink", "teal"] as const;
  return (
    // A single panel (boarding crosslink) fills its column; only a pair splits.
    <div className={cx("grid h-full overflow-hidden rounded-card", cards.length > 1 && "md:grid-cols-2")}>
      {cards.map((card, i) => {
        const tone = tones[i % tones.length];
        const img = card.href ? photoFor(`panel:${card.href}`) : undefined;
        return (
          <article
            key={card.title}
            data-tone={tone}
            className={cx(
              "relative flex flex-col",
              tone === "ink" ? "bg-ink-900" : "bg-teal-700",
              "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-[-4px] has-[a:focus-visible]:outline-ring",
            )}
          >
            {img ? (
              <img
                src={img.src}
                alt={img.alt[locale]}
                loading="lazy"
                className="aspect-[16/9] w-full border-b border-line object-cover"
                style={img.position ? { objectPosition: img.position } : undefined}
              />
            ) : (
              <ImagePlaceholder alt={card.title} aspect="aspect-[16/9]" className="rounded-none border-0 border-b border-line" />
            )}
            <div className={cx("flex grow flex-col", compact ? "p-6 sm:p-7" : "p-7 sm:p-10")}>
              {card.eyebrow && <Eyebrow className="mb-3">{card.eyebrow}</Eyebrow>}
              <h3 className={cx(compact ? "text-h3" : "text-h2", "text-ink")}>
                {card.href ? (
                  <Link
                    href={localeHref(locale, card.href)}
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                  >
                    {card.title}
                  </Link>
                ) : (
                  card.title
                )}
              </h3>
              {card.body && <p className={cx("mt-4", compact ? "text-sm" : "text-base")}>{card.body}</p>}
              {card.items && (
                <ul className={cx("mt-6 grid gap-x-6 gap-y-2", !compact && "sm:grid-cols-2")}>
                  {card.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm">
                      <IconCheck size={16} className="mt-1 shrink-0 text-accent" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
              {card.href && (
                <p className="mt-auto flex items-center gap-2 pt-8 text-base font-bold text-primary">
                  {card.linkLabel ?? card.title}
                  <IconArrowRight />
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ------------------------------ Open lists ------------------------------- */

/** Items without containers: icon, hairline, text. 2–3 columns. */
export function IconList({ items, columns = 3 }: { items: string[]; columns?: 2 | 3 }) {
  return (
    <ul className={cx("grid gap-x-10 gap-y-8", columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
      {items.map((it, i) => (
        <li key={it} className="border-t border-ink pt-4">
          <ListIcon index={i} className="text-brand" />
          <p className="mt-3 text-base font-bold text-ink">{it}</p>
        </li>
      ))}
    </ul>
  );
}

/** Cards → icon above, title, text below, separated by vertical hairlines. */
export function IconRow({ cards, columns }: { cards: CardData[]; columns?: 4 | 5 }) {
  const n = columns ?? (cards.length === 5 ? 5 : 4);
  return (
    <ul
      className={cx(
        "grid gap-y-8 sm:grid-cols-2",
        n === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4",
        "lg:divide-x lg:divide-line",
      )}
    >
      {cards.map((card, i) => (
        <li key={card.title} className="lg:px-6 lg:first:pl-0 lg:last:pr-0">
          <ListIcon index={i} size={32} className="text-brand" />
          <h3 className="text-h3 mt-4 text-ink">{card.title}</h3>
          {card.body && <p className="mt-2 text-sm">{card.body}</p>}
          {card.items && (
            <ul className="mt-3 space-y-1 text-sm">
              {card.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

/** One horizontal strip: LIVE · WORK · GROW … with a short line under each. */
export function GoalRow({ cards }: { cards: CardData[] }) {
  return (
    <ul className="grid gap-6 border-y border-ink py-8 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <li key={card.title}>
          <p className="font-display text-h2 uppercase leading-none text-primary">{card.title}</p>
          {card.body && <p className="mt-2 text-sm">{card.body}</p>}
        </li>
      ))}
    </ul>
  );
}

/** Cards as stacked rows: title as the left-hand accent, details right. */
export function CatalogueRows({ cards, locale }: { cards: CardData[]; locale: Locale }) {
  return (
    <ul className="divide-y divide-ink border-y border-ink">
      {cards.map((card) => {
        const img = card.href ? photoFor(`row:${card.href}`) : undefined;
        return (
        <li key={card.title} className="grid gap-4 py-7 md:grid-cols-12 md:gap-8">
          <div className={img ? "md:col-span-4" : "md:col-span-5"}>
            {card.eyebrow && <Eyebrow className="mb-2">{card.eyebrow}</Eyebrow>}
            <h3 className="font-display text-h2 text-ink">
              {card.href ? (
                <Link
                  href={localeHref(locale, card.href)}
                  className="decoration-brand decoration-2 underline-offset-4 hover:underline"
                >
                  {card.title}
                </Link>
              ) : (
                card.title
              )}
            </h3>
          </div>
          <div className={img ? "md:col-span-5" : "md:col-span-7"}>
            {card.body && <p className="text-base">{card.body}</p>}
            {card.items && (
              <ul className="mt-3 space-y-1.5 text-sm text-muted">
                {card.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            )}
            {card.href && (
              <p className="mt-4">
                <Button href={localeHref(locale, card.href)} variant="ghost">
                  {card.linkLabel ?? card.title}
                  <IconArrowRight size={18} />
                </Button>
              </p>
            )}
          </div>
          {img && (
            <img
              src={img.src}
              alt={img.alt[locale]}
              loading="lazy"
              className="hidden aspect-[4/3] w-full rounded-card object-cover md:col-span-3 md:block"
              style={img.position ? { objectPosition: img.position } : undefined}
            />
          )}
        </li>
        );
      })}
    </ul>
  );
}

/** Plain 2×2 grid of titled paragraphs (no boxes). */
export function GridTwo({ cards }: { cards: CardData[] }) {
  return (
    <ul className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
      {cards.map((card, i) => (
        <li key={card.title} className="border-t-2 border-ink pt-5">
          <ListIcon index={i} size={32} className="text-brand" />
          <h3 className="text-h3 mt-4 text-ink">{card.title}</h3>
          {card.body && <p className="mt-2 text-base">{card.body}</p>}
          {card.items && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {card.items.map((it) => (
                <li key={it} className="flex gap-2">
                  <IconCheck size={16} className="mt-1 shrink-0 text-brand" />
                  {it}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------- Typography blocks --------------------------- */

/** Numbers as typography: no box, big display digits, hairline dividers. */
export function TypoStats({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <dl className="grid gap-8 border-y border-ink py-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-line">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col-reverse gap-3 lg:px-6 lg:first:pl-0 lg:last:pr-0">
          <dt className="max-w-[16rem] text-sm font-semibold text-muted">{s.label}</dt>
          <dd className="font-display text-stat text-ink">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** "Education. Integration. Opportunities." as the section's graphic. */
export function Statement({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(?<=\.)\s+/);
  return (
    <p className={cx("break-words font-display text-statement uppercase text-ink", className)}>
      {parts.map((part, i) => (
        <span key={part} className="block">
          {part}
          {i === parts.length - 1 && <span className="text-brand">&nbsp;</span>}
        </span>
      ))}
    </p>
  );
}

/** Trust strip: PhD | CELTA | PGCE … in one ruled row. */
export function TrustStrip({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-y border-line py-5 font-display text-h3 uppercase tracking-wide text-ink">
      {items.map((it, i) => (
        <li key={it} className="flex items-center gap-3">
          {i > 0 && (
            <span aria-hidden="true" className="text-brand">
              |
            </span>
          )}
          {it}
        </li>
      ))}
    </ul>
  );
}

/** Compact label chips (About values). */
export function ChipRow({ items, accent = false }: { items: string[]; accent?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((it) => (
        <li key={it}>
          {accent ? (
            /* Chip's own bg-surface can win the cascade — style the accent pill directly. */
            <span className="inline-flex items-center rounded-sm bg-accent px-3 py-1.5 text-sm font-bold text-ink-900">{it}</span>
          ) : (
            <Chip className="px-3 py-1.5 text-sm normal-case">{it}</Chip>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------- Split ----------------------------------- */

/** 50/50: big photo | content (or the reverse). */
export function SplitPhoto({
  alt,
  src,
  side = "left",
  children,
}: {
  alt: string;
  src?: string;
  side?: "left" | "right";
  children: ReactNode;
}) {
  const photo = src ? (
    <img src={src} alt={alt} loading="lazy" className="aspect-[4/5] w-full rounded-card object-cover object-top lg:aspect-auto lg:h-full" />
  ) : (
    <ImagePlaceholder alt={alt} aspect="aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[28rem]" />
  );
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={cx(side === "right" && "lg:order-2")}>{photo}</div>
      <div className="flex flex-col justify-center">{children}</div>
    </div>
  );
}

/** Founder video stand-in: 16:9 ruled paper with a play mark. */
export function VideoPlaceholder({ alt }: { alt: string }) {
  return (
    <div className="relative">
      <ImagePlaceholder alt={alt} aspect="aspect-video" />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink bg-accent text-ink"
      >
        <IconPlay size={28} />
      </span>
    </div>
  );
}

/* -------------------------------- Team ----------------------------------- */

/** Light team cards: photo first, name, role; bio behind "Read more". */
export function TeamRail({ members, locale }: { members: TeamMember[]; locale: Locale }) {
  return (
    <ScrollRail label="Team" locale={locale}>
      {members.map((m) => (
        <li key={m.name} className="w-[15rem] shrink-0 snap-start sm:w-[17rem]">
          <article>
            {m.photo ? (
              <img
                src={m.photo}
                alt={m.name}
                loading="lazy"
                className="aspect-[4/5] w-full rounded-card object-cover object-top"
              />
            ) : (
              <ImagePlaceholder alt={m.name} aspect="aspect-[4/5]" className="border-0" />
            )}
            <h3 className="text-h3 mt-4 text-ink">{m.name}</h3>
            <p className="mt-1 text-sm font-semibold text-primary">{m.role}</p>
            {(m.credentials || m.bio) && (
              <details className="group mt-2 text-sm">
                <summary className="cursor-pointer list-none font-bold text-ink underline decoration-brand/50 decoration-2 underline-offset-4 [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">{READ_MORE[locale] ?? READ_MORE.en}</span>
                  <span className="hidden group-open:inline">{READ_LESS[locale] ?? READ_LESS.en}</span>
                </summary>
                {m.credentials && <p className="mt-2 text-muted">{m.credentials}</p>}
                {m.bio && <p className="mt-2">{m.bio}</p>}
              </details>
            )}
          </article>
        </li>
      ))}
    </ScrollRail>
  );
}

/* --------------------------- Closing CTA band ---------------------------- */

export function ClosingBand({
  title,
  body,
  note,
  cta,
  extra,
  locale,
}: {
  title: string;
  body?: string;
  note?: string;
  cta: Cta;
  extra?: Cta[];
  locale: Locale;
}) {
  // Reference format (client, 28 Aug 2026): smaller uppercase headline left
  // with a sun dash, body copy right, yellow button under the text.
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-5">
        <h2 className="break-words font-display text-h2 text-balance uppercase text-ink">{title}</h2>
        <span aria-hidden="true" className="mt-5 block h-1 w-14 bg-accent" />
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        {body && <p className="text-base">{body}</p>}
        {note && <p className="mt-3 text-sm text-muted">{note}</p>}
        <p className="mt-7 flex flex-wrap gap-3">
          <Button href={localeHref(locale, cta.href)} size="lg">
            {cta.label}
            <IconArrowRight />
          </Button>
          {extra?.map((c) => (
            <Button key={c.href + c.label} href={localeHref(locale, c.href)} variant="secondary" size="lg">
              {c.label}
            </Button>
          ))}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Helpers ---------------------------------- */

export function blockOf<T extends Block["type"]>(blocks: Block[], type: T) {
  return blocks.find((b): b is Extract<Block, { type: T }> => b.type === type);
}

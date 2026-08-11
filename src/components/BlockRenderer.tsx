import Link from "next/link";
import type { Block, Card, Hero, Locale, Section } from "@/content/types";
import { localeHref } from "@/lib/links";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

// Skeleton-stage renderers: semantic HTML + structural Tailwind only.
// The design developer restyles these components; content stays untouched.

export function HeroSection({ hero, locale }: { hero: Hero; locale: Locale }) {
  return (
    <header className="mx-auto max-w-4xl px-4 py-12">
      {hero.eyebrow && (
        <p className="text-sm uppercase tracking-wide text-neutral-500">{hero.eyebrow}</p>
      )}
      <h1 className="text-3xl font-bold">{hero.title}</h1>
      {hero.subtitle && <p className="mt-3 text-lg text-neutral-700">{hero.subtitle}</p>}
      {hero.body?.map((p) => (
        <p key={p.slice(0, 40)} className="mt-3 text-neutral-700">
          {p}
        </p>
      ))}
      {hero.ctas && hero.ctas.length > 0 && (
        <p className="mt-6 flex flex-wrap gap-3">
          {hero.ctas.map((cta) => (
            <Link
              key={cta.href}
              href={localeHref(locale, cta.href)}
              className="inline-block border border-neutral-900 px-5 py-2 font-medium"
            >
              {cta.label}
            </Link>
          ))}
        </p>
      )}
    </header>
  );
}

function CardItem({ card, locale }: { card: Card; locale: Locale }) {
  const body = (
    <>
      {card.image === "placeholder" && <ImagePlaceholder alt={card.title} className="mb-3" />}
      {card.image && card.image !== "placeholder" && (
        <img src={card.image} alt={card.title} loading="lazy" className="mb-3 w-full" />
      )}
      {card.eyebrow && (
        <p className="text-xs uppercase tracking-wide text-neutral-500">{card.eyebrow}</p>
      )}
      <h3 className="font-semibold">{card.title}</h3>
      {card.body && <p className="mt-2 text-sm text-neutral-700">{card.body}</p>}
      {card.items && (
        <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700">
          {card.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      )}
    </>
  );
  return (
    <article className="border border-neutral-300 p-4">
      {body}
      {card.href && (
        <p className="mt-3">
          <Link href={localeHref(locale, card.href)} className="font-medium underline">
            {card.linkLabel ?? card.title}
          </Link>
        </p>
      )}
    </article>
  );
}

export function BlockView({ block, locale }: { block: Block; locale: Locale }) {
  switch (block.type) {
    case "lead":
      return <p className="text-lg font-medium text-neutral-800">{block.text}</p>;
    case "paragraph":
      return <p className="text-neutral-700">{block.text}</p>;
    case "list":
      return (
        <ul className="list-disc space-y-1 pl-5 text-neutral-700">
          {block.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case "cards":
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {block.cards.map((card) => (
            <CardItem key={card.title} card={card} locale={locale} />
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className="list-decimal space-y-3 pl-5">
          {block.steps.map((step) => (
            <li key={step.title}>
              <span className="font-semibold">{step.title}</span>
              {step.body && <p className="text-neutral-700">{step.body}</p>}
            </li>
          ))}
        </ol>
      );
    case "stats":
      return (
        <dl className="flex flex-wrap gap-8">
          {block.stats.map((s) => (
            <div key={s.label}>
              <dt className="text-sm text-neutral-500">{s.label}</dt>
              <dd className="text-2xl font-bold">{s.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "testimonials":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {block.items.map((t) => (
            <figure key={t.author + (t.tag ?? "")} className="border border-neutral-300 p-4">
              {t.tag && (
                <p className="text-xs uppercase tracking-wide text-neutral-500">{t.tag}</p>
              )}
              <blockquote className="mt-1 text-sm text-neutral-700">“{t.quote}”</blockquote>
              <figcaption className="mt-2 text-sm font-medium">— {t.author}</figcaption>
            </figure>
          ))}
        </div>
      );
    case "faq":
      return (
        <div className="space-y-2">
          {block.items.map((f) => (
            <details key={f.question} className="border border-neutral-300 p-3">
              <summary className="cursor-pointer font-medium">{f.question}</summary>
              <p className="mt-2 text-neutral-700">{f.answer}</p>
            </details>
          ))}
        </div>
      );
    case "team":
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {block.members.map((m) => (
            <article key={m.name} className="border border-neutral-300 p-4">
              {m.photo ? (
                <img src={m.photo} alt={m.name} loading="lazy" className="mb-3 w-full" />
              ) : (
                <ImagePlaceholder alt={m.name} className="mb-3" />
              )}
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-sm text-neutral-600">{m.role}</p>
              {m.credentials && <p className="mt-1 text-xs text-neutral-500">{m.credentials}</p>}
              {m.bio && <p className="mt-2 text-sm text-neutral-700">{m.bio}</p>}
            </article>
          ))}
        </div>
      );
    case "image":
      return block.src ? (
        <img src={block.src} alt={block.alt} loading="lazy" className="w-full" />
      ) : (
        <ImagePlaceholder alt={block.alt} />
      );
    case "buttons":
      return (
        <p className="flex flex-wrap gap-3">
          {block.ctas.map((cta) => (
            <Link
              key={cta.href + cta.label}
              href={localeHref(locale, cta.href)}
              className="inline-block border border-neutral-900 px-5 py-2 font-medium"
            >
              {cta.label}
            </Link>
          ))}
        </p>
      );
    case "cta":
      return (
        <aside className="border border-neutral-900 p-6">
          <h3 className="text-xl font-semibold">{block.title}</h3>
          {block.body && <p className="mt-2 text-neutral-700">{block.body}</p>}
          <p className="mt-4">
            <Link
              href={localeHref(locale, block.cta.href)}
              className="inline-block border border-neutral-900 px-5 py-2 font-medium"
            >
              {block.cta.label}
            </Link>
          </p>
          {block.note && <p className="mt-2 text-sm text-neutral-500">{block.note}</p>}
        </aside>
      );
  }
}

export function SectionView({ section, locale }: { section: Section; locale: Locale }) {
  return (
    <section id={section.id} className="mx-auto max-w-4xl px-4 py-8">
      {section.eyebrow && (
        <p className="text-sm uppercase tracking-wide text-neutral-500">{section.eyebrow}</p>
      )}
      {section.title && <h2 className="text-2xl font-bold">{section.title}</h2>}
      {section.intro && <p className="mt-2 text-neutral-700">{section.intro}</p>}
      <div className="mt-4 space-y-6">
        {section.blocks.map((block, i) => (
          <BlockView key={`${section.id}-${i}`} block={block} locale={locale} />
        ))}
      </div>
    </section>
  );
}

export function PageSections({ sections, locale }: { sections: Section[]; locale: Locale }) {
  return (
    <>
      {sections.map((s) => (
        <SectionView key={s.id} section={s} locale={locale} />
      ))}
    </>
  );
}

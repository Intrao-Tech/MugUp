# Mug.Up design system — the visual layer, and how to stay inside it

Audience: anyone (human or AI session) touching `src/components` or
`src/app/[locale]`. The design language is small on purpose. If something you
want to build is not expressible with the tokens and primitives below, extend
**this file + `src/app/globals.css` + `src/components/ui/`** first — never
improvise a one-off class string in a page.

Hard invariants still apply (`docs/HANDOFF-DESIGN.md`): copy and structure
live in `src/content` and are frozen; one H1; section ids/hrefs unchanged;
metadata/JSON-LD/forms untouched; images only from `public/images` or
`ImagePlaceholder`.

## 0. Signature — the study card

"Mug up" means to cram — with flashcards. Every card on the site is a
**study card**: white paper, a 1px ink rule, small radius, and — when it
leads somewhere — a solid teal backplate behind it (the hard offset shadow the
old site's buttons had). Missing images render as ruled notebook paper with a
stamped label. Chips are small square labels. This is the one thing the site
should be remembered by; everything else stays quiet.

## 1. Direction in one paragraph

"Evolved Mug.Up": keep the brand equity of the old site — teal, cream, the
yellow hand-drawn ring, the owl mark — but present it with the weight of an
outcome-driven education platform (references: Crimson for results-first,
Nord Anglia for calm photography, Preply for warm rounded type, MasterClass
for clean product segmentation, Apple for the footer). Light, warm canvas;
confident geometric type; flat cards; ONE primary CTA style; numbers and
proof shown early; decoration limited to the ring and the owl.

## 2. Tokens (`src/app/globals.css`)

Architecture (Tailwind v4):

1. `@theme { … }` — the raw palette, type scale, shadows, radius. Generates
   utilities (`bg-teal-500`, `text-ink-600`) but **markup should not use the
   raw scale**; it exists so the semantic layer has values to point at.
2. `:root { --canvas … --ring }` — semantic roles as plain CSS variables.
3. `@theme inline { --color-canvas: var(--canvas); … }` — maps roles to
   utilities. Because these compile to `var(--x)`, a section can re-point
   them by cascade: `[data-tone="ink"] { --ink: #fff; … }`. That is how the
   same `text-ink` is navy on cream and white on the dark band — components
   never branch on tone.

### Semantic colour utilities (use ONLY these in markup)

| Utility | Light band | Cream band | Ink band | Teal band | Role |
| --- | --- | --- | --- | --- | --- |
| `bg-canvas` | `#FFFDF7` | – | – | – | page background |
| `bg-surface` | white | white | ink-800 | teal-700 | cards, header pill |
| `bg-surface-alt` | cream-100 | cream-200 | ink-950 | teal-800 | soft panels (cta aside, chips) |
| `text-ink` | ink-900 | ink-900 | white | white | headings, strong labels |
| `text-body` | ink-600 | ink-600 | ink-100 | white | body copy (default on `<body>`) |
| `text-muted` | ink-500 | ink-500 | ink-200 | white | secondary copy, notes |
| `border-line` | ink-200 | ink-200 | white/16 | white/22 | hairlines |
| `bg-primary` + `text-on-primary` | teal-600 / white | same | sun-400 / ink-900 | white / teal-700 | the ONE button fill |
| `text-primary` | teal-600 | teal-600 | sun-400 | white | links, eyebrows, arrow labels |
| `text-brand` / `bg-brand` | teal-500 | teal-500 | teal-300 | white | icons, numerals ≥ 2rem, accent bars |
| `bg-accent` / `text-accent` | sun-400 | sun-400 | sun-400 | sun-400 | ring, second card accent |
| `outline` (focus) | teal-600 | teal-600 | white | white | set globally, follows tone |

Contrast (verified): white on teal-600 5.0:1 · ink-600 on cream-50 ≈ 8.9:1 ·
ink-500 on cream-100 5.6:1 · sun-400 on ink-900 12.6:1 · **teal-500
`#0097B2` on white is 3.46:1 → decorative / ≥ 24px text only** (that is why
`text-brand` exists separately from `text-primary`).

Raw hex values (for reference only; do not type them into markup):
teal 50 `#F1FAFC` · 100 `#E0F4F8` · 200 `#B8E6EE` · 300 `#7FD2E1` · 500 `#0097B2` ·
600 `#007A91` · 700 `#006D82` · 800 `#005566` — ink 950 `#061225` · 900 `#0B1E3A` ·
800 `#1C2C47` · 600 `#3D4A5C` · 500 `#5B6472` · 300 `#A3AAB6` · 200 `#D3D7DE` ·
100 `#E8EAEE` — sun 400 `#FFDE59` · 300 `#FFE98A` · 100 `#FFF5CC` — cream 50
`#FFFDF7` · 100 `#FFF8E1` · 200 `#FFF1C7`. Legacy `#0002B5` deep blue is
intentionally dropped.

### Type

Font: **Onest** (variable, geometric grotesque with native Cyrillic — the
open stand-in for the legacy Geometria), loaded once in `src/lib/fonts.ts`
via `next/font/google` and applied as `brandFont.variable` on every `<html>`
(locale layout, admin layout, global 404). `--font-sans` maps to it, so plain
text is already in the brand face. Build needs network to fetch the font
(fine on Vercel); to go fully offline switch to `next/font/local`.

One class = size + line-height + tracking + weight:

| Class | Use |
| --- | --- |
| `text-display` | the page H1 (hero) |
| `text-h2` | section titles, closing-CTA title |
| `text-h3` | card / block titles |
| `text-lead` | hero subtitle, section intro |
| `text-base` | body (17px/1.65 — set on `<body>`, rarely needed explicitly) |
| `text-sm` | captions, nav, chips, notes |
| `text-eyebrow` + `uppercase` | kickers, tiny labels (`Eyebrow` component) — `tracking` is 0.06em, do NOT add `tracking-widest` (Cyrillic) |
| `text-quote` | testimonial pull-quotes (light weight, editorial scale) |
| `text-stat` | big numbers in `stats` |

Never write `text-2xl font-bold tracking-tight` combinations; if a size is
missing, add a `--text-*` token.

### Shape, elevation, motion

Radius: `rounded-card` (6px) for cards/panels/images, `rounded-full` for
buttons and the locale pill only, `rounded-lg` for inputs, `rounded-sm` for
chips. Shadows: `shadow-plate` / `shadow-plate-lg` — the solid brand
backplate on interactive cards (the "study card" signature; it inherits the
tone's `--brand`) — plus `shadow-card`/`shadow-lift` on the primary button and the mobile menu
overlay. No blurred card shadows. Motion: transitions only, no
keyframes; any transform is `motion-safe:`. Focus ring is global
(`:focus-visible`), 2px, tone-aware — do not remove outlines except on the
stretched link inside an interactive `Card` (the card shows focus instead).

## 3. Primitives (`src/components/ui/`)

| Component | Purpose / API |
| --- | --- |
| `Container` | `size="prose" \| "content" \| "wide"` (max-w 3xl / 6xl / 7xl) + horizontal padding. `as` for the tag. Every page block sits in one — never hand-write `mx-auto max-w-* px-*`. |
| `Section` | `id`, `tone="default" \| "cream" \| "ink" \| "teal"`, `pad="sm" \| "md" \| "lg"`, `size`. Sets `data-tone` (see tokens). Never place two `ink`/`teal` bands next to each other. |
| `SectionHeading` | `eyebrow, title, intro, as="h1"\|"h2"\|"h3", align`. All section titles go through it. `Eyebrow` alone for kickers. |
| `Button` | `variant="primary"` (filled pill — hero, closing band, forms) \| `"secondary"` (outlined pill — inline nudges) \| `"ghost"` (underlined arrow link — tertiary), `size="sm" \| "md" \| "lg"`; renders `<Link>` when `href` given, else `<button type>`. **Every CTA on the site is a `Button`.** Tone changes its colours automatically. |
| `Card` | **study card**: white paper, 1px ink rule, `rounded-card` (6px). `interactive` = solid brand backplate (`shadow-plate`, a hard offset shadow — no blur) + up-left nudge on hover, and stretched-link host (put ONE `<Link className={STRETCHED_LINK}>` inside — no nested anchors). `padded={false}` for media-top cards; media gets `border-b border-ink`. |
| `Chip` | small square ink-ruled label in `text-eyebrow` (dates, categories, stamps). Not clickable, never a pill. |
| `icons.tsx` | `IconCheck, IconArrowRight, IconChevronDown, IconMenu, IconClose, IconQuote` — the complete set; inline SVG lives nowhere else except `decor.tsx` and the placeholder cross in `ImagePlaceholder`. |
| `decor.tsx` | `BrandRing` — the yellow ring. The only decoration besides the ruled paper. |
| `ImagePlaceholder` | `alt`, `aspect` — ruled notebook paper (`.paper-ruled`) with a stamp label: the flashcard surface, not a grey X. |

Site chrome: `Header.tsx` (sticky, blur, full nav at `xl`, `MobileNav`
toggle below, `NavLink` marks the active section), `Footer.tsx` (Apple-style
columns on `bg-surface-alt`, socials in three labelled groups),
`Breadcrumbs.tsx`, `FormRenderer.tsx` (inputs share one `inputCls`).

Content rendering: `BlockRenderer.tsx` — `HeroSection` (`visual="owl"` on
Home only), `SectionView` (tone by id map `SECTION_TONES` or the rule "a
section that is only one CTA = ink closing band"), `BlockView` (every block
type; `variant="article"` for Insights post bodies = plain lists).

## 4. Home page section map (ids fixed by the TZ)

hero (owl + ring, one primary CTA) → `what-we-support` (check grid + cta
panel) → `choose-your-path` (2 accent-barred pathway cards, stretched links)
→ `how-it-works` (cream; numbered 3×2 grid) → `results` (teal stats strip,
check grid, testimonial quote rail, review cta rule-row) → `for-parents` (cream) →
`why-mugup` → `meet-our-team` (portrait cards; horizontal scroll-snap < sm)
→ `insights-preview` (cream) → `final-cta` (ink closing band).

## 5. Do / Don't (grep-able)

- DO colour with semantic utilities only. DON'T use `neutral-*`, `gray-*`,
  `slate-*`, raw hex, `bg-[`/`text-[` arbitrary colours, `style=`,
  `!important` in `src/components` or `src/app/[locale]`. (Admin panel is
  out of scope for this rule and keeps its own utility styling.)
- DO layout with `Container`/`Section`; DON'T hand-write `max-w-4xl px-4`.
- DO CTAs with `Button`; DON'T style `<a>`/`<Link>` as buttons.
- Social proof is an editorial **quote rail** (hairline rows, attribution
  left, quote right at `text-quote`), NOT a grid of equal cards with quote
  glyphs and tag pills — that reads as generated. Inline `cta` blocks are a
  **rule row** (hairline top, text left, outlined button right), not a filled
  box; filled pills belong to the hero, closing band and forms only.
- DO headings with `SectionHeading` / `text-h2` etc.; DON'T combine size +
  weight + tracking utilities ad hoc.
- DO keep `<img>` with `width/height` or an `aspect-*` class; hero image is
  `loading="eager" fetchPriority="high"`, everything else lazy.
- DO test both locales at 360 / 768 / 1280 / 1440 — UA copy is ~20% longer;
  the full desktop nav only fits from `xl`.

Enforcement one-liner (should print nothing):

```bash
grep -rnE "\bneutral-|\bgray-|\bslate-|\bzinc-|#[0-9a-fA-F]{3,6}\b|style=\{|!important|text-\[#|bg-\[#" src/components src/app/\[locale\] | grep -v "src/components/JsonLd"
```

## 6. Verification before handing over

```bash
npm run typecheck && npm run build          # never build while `next dev` runs
git diff --stat src/content                  # must be empty — copy is frozen
```

Then view-source a page in both locales: exactly one `<h1>`, section ids
present, metadata/JSON-LD/hreflang unchanged. Screenshots: headless Chrome
(`chrome-headless-shell --headless --screenshot --window-size=390,3000 URL`)
at 390 / 768 / 1280 / 1440 for `/en` and `/ua`.

## 7. Known follow-ups

- Pages outside Home were migrated *mechanically* (token classes swapped in
  place: `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`, `text-h2 text-ink`, one
  hand-styled secondary link on the Insights post page). They look right but
  still hand-write wrappers — when you next touch one of them, move it to
  `Section`/`Container`/`Button`; do not add new hand-written wrappers.
- Admin panel: shares `globals.css`, so it now inherits the brand font and
  the 17px base size; its colours/utilities are otherwise untouched.

- Team "carousel": implemented as CSS scroll-snap on small screens; add
  arrows only if the client asks (would need a small client component).
- Real photography for hero / pathway cards once the client supplies assets
  (replace `ImagePlaceholder` calls; keep alt text = card title).
- Admin panel keeps the skeleton styling; migrating it to these tokens is a
  separate, optional pass.

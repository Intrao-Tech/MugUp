# Design handoff — applying the visual layer

Audience: the frontend developer who will style mugupstudio.com. The site is a
finished structural skeleton: every page, both languages, navigation, SEO and
the admin panel work. Your job is the visual design on top. This file tells
you where to work and what must not break.

## Run it

```bash
npm install
npm run dev   # http://localhost:3000/en and /ua
```

No database needed for styling: without Supabase env vars the site runs fully
(forms show a disabled submit; Insights falls back to built-in sample
articles). If you want live data, follow README → "Run (local full stack)".

The admin panel (http://admin.localhost:3000, login in README) uses the same
primitives; styling it is welcome but secondary.

## Where the design lives

Everything visual is in `src/components` (+ `src/app/globals.css`, currently
just the Tailwind import). Tailwind CSS v4 — add theme tokens in CSS
(`@theme`), no config file needed. Current classes are structural minimums —
replace freely.

Component inventory:

| Component | Role |
| --- | --- |
| `Header.tsx` | top nav, Pathways dropdown (no-JS `<details>`), CTA button, locale switch |
| `Footer.tsx` | 4 link groups + address + socials (per TZ) |
| `BlockRenderer.tsx` | ALL page sections: hero, cards, steps, stats, testimonials, faq, team, cta, image |
| `ImagePlaceholder.tsx` | grey-X stand-in for images the client hasn't supplied |
| `FormRenderer.tsx` | booking + contact forms |
| `FormStatusBanner.tsx` | sent/error message after submit |
| `Markdown.tsx` | article body (headings, lists, quotes, images, links) |
| `Breadcrumbs.tsx` | breadcrumb nav (also emits JSON-LD — keep the component) |
| `LocaleSwitcher.tsx` / `ScrollToTop.tsx` | behaviour helpers |
| `src/app/admin/ui.tsx` | admin notices + filter chips |

## Hard invariants — breaking these fails the SEO audit

1. **Never edit copy in components or `src/content/`** — text changes go
   through the site owners. Section `id`s and hrefs must stay unchanged.
2. **Exactly one `<h1>` per page** (the hero title) and a logical h2/h3
   hierarchy; keep semantic landmarks (`header/nav/main/footer`).
3. Don't touch metadata, canonical/hreflang, JSON-LD (`JsonLd`,
   `Breadcrumbs`), `sitemap.ts`, `robots.ts`, `middleware.ts`.
4. Forms: keep every field's `name`, `required`, the hidden inputs and the
   honeypot block — restyle only.
5. Images: only assets from `public/images` (client-provided) or
   `ImagePlaceholder`. No AI-generated or stock imagery — client rule. Note:
   `LOGO_-01.png` in the client materials is WHITE-on-transparent (use on dark
   backgrounds only); the black variant is currently used in the header.
6. Both locales must be styled — text lengths differ (UA runs ~20% longer).
7. Keep pages server components; add `"use client"` only for genuinely
   interactive pieces.

## Reference materials

- Client copy & assets: `docs/requirements/client-materials/` (teacher photos,
  logo variants incl. EPS sources).
- Intent & reference sites (Crimson Education, Kaplan, Preply, Coursera,
  MasterClass): `docs/requirements/Mug.Up Web site structure v2.pdf`.
- Signed structure: `docs/requirements/MugUp_Technical_Specification_TZ.pdf`.

## Definition of done

Responsive desktop/tablet/mobile; last two versions of Chrome/Safari/Edge/
Firefox (TZ 6.6); both locales reviewed; `npm run build` green;
`npm run typecheck` green; spot-check with `docs/SEO-REQUIREMENTS.md`
(view-source: content present, one H1, meta intact).

Open items the design should anticipate: founder video + photo slots (About),
review CTA on Home, future "approved reviews" block on Home (data already
collected in the admin).

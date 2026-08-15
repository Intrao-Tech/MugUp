# MugUp — mugupstudio.com

Bilingual (EN/UA) marketing site + hidden admin panel for Mug.Up Language
Studio. Next.js 15 App Router, TypeScript strict, Tailwind v4, Supabase behind
a vendor-neutral port layer. Full spec: `docs/SPEC.md`. Design handoff:
`docs/HANDOFF-DESIGN.md`. Design system (tokens, primitives, rules):
`docs/DESIGN-SYSTEM.md`. SEO invariants: `docs/SEO-REQUIREMENTS.md`.

## Commands

```bash
npm run dev        # site http://localhost:3000, admin http://admin.localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run db:start   # local Supabase (Docker), applies supabase/migrations
npm run db:reset   # wipe + re-apply migrations
npm run seed:dev   # test accounts + demo data (local only, guarded)
```

Local test logins (password `admin123`): `admin@` / `manager@` / `editor@mugup.local`.
(Seed-only password — every password set through the UI must pass
`src/lib/password.ts`: 8+ chars, upper + lower + digit.)
Local emails (invites) land in Mailpit: http://localhost:54324. DB GUI: :54323.

## Architecture in one breath

- Public pages render typed content from `src/content/{en,ua}` through shared
  components in `src/components` — text never lives in components.
- All data access goes through `getData()` (`src/lib/data`, interfaces in
  `src/lib/data/ports.ts`); Supabase SDK appears ONLY under
  `src/lib/data/supabase/`. Swap backends via `DATA_BACKEND` env.
- Admin (`src/app/admin`) exists only on `ADMIN_HOST`; public site only on
  `PUBLIC_HOST`; middleware (`src/middleware.ts`) enforces both, fail-closed.
- Authorization = permission flags on `profiles` (presets in
  `src/lib/permissions.ts`), enforced in middleware → guards
  (`src/lib/auth-guard.ts`) → actions → Postgres RLS (`supabase/migrations`).
- Insights posts/categories/reviews are database-driven; public pages use ISR
  + `revalidatePath` from admin actions. Static content in `src/content` is
  the no-backend fallback.

## Rules

- Never hardcode copy in components; edit `src/content/{en,ua}` (keep section
  ids and hrefs identical across locales).
- Never import a vendor SDK outside `src/lib/data/supabase/`.
- Visual layer: only semantic tokens + `src/components/ui` primitives
  (`docs/DESIGN-SYSTEM.md`); no `neutral-*`/hex/arbitrary colours, no ad-hoc
  `max-w-*` wrappers, every CTA is `<Button>`.
- Keep SEO invariants (`docs/SEO-REQUIREMENTS.md`): one H1 per page, unique
  meta, canonical + hreflang, JSON-LD, real 404s, readable slugs.
- Images: client-provided assets or the grey `ImagePlaceholder` — never
  AI-generated, never hotlinked.
- Run ONE dev server at a time; never `next build` while dev runs (both write
  `.next` and corrupt it — symptom: phantom 404s/stale pages; fix: delete
  `.next`, restart).
- Secrets only in `.env.local` (gitignored); `.env.example` documents every
  variable.

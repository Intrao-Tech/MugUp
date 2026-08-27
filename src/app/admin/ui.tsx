import Link from "next/link";
import type { ReactNode } from "react";

/* Admin restyle: the panel shares the public site's design tokens
   (globals.css) — cream canvas, ink text, teal primary, study-card rules.
   These constants are the admin's ONE source for control styling; pages
   compose them instead of hand-writing colour classes. */

/** Text inputs / selects / textareas — mirrors the public FormRenderer. */
export const INPUT =
  "mt-1 w-full rounded-lg border border-ink-300 bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

/** Primary action — the site's filled pill (Button md sizing). */
export const BTN_PRIMARY =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-base font-bold text-on-primary transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50";

/** Secondary action — the site's outlined pill (Button sm sizing). */
export const BTN_SECONDARY =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-base font-bold text-ink transition-colors hover:bg-ink hover:text-surface disabled:pointer-events-none disabled:opacity-50";

/** Tertiary action — underlined teal link (site's ghost button). */
export const BTN_LINK =
  "text-sm font-bold text-primary underline decoration-2 decoration-brand/40 underline-offset-4 hover:text-primary-hover hover:decoration-brand";

/** Study card panel (dashboard cards, form sections, table wrappers). */
export const CARD = "rounded-card border border-ink bg-surface";

/** Page title + subsection title — the site's display face. */
export const H1 = "font-display text-h2 text-ink";
export const H2 = "font-display text-h3 text-ink";

/** Green/red feedback banner used across all admin pages. */
export function Notice({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  const styles =
    tone === "success"
      ? "border-green-400 bg-green-50 text-green-900"
      : "border-red-400 bg-red-50 text-red-800";
  return <p className={`mt-3 rounded-card border p-3 text-sm ${styles}`}>{children}</p>;
}

/** Filter chip link; the active one is inverted (ink, like the site's chips). */
export function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-sm border px-3 py-1 text-sm transition-colors ${
        active
          ? "border-ink bg-ink text-surface"
          : "border-line bg-surface text-body hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

const FEEDBACK_KEYS = ["error", "saved", "deleted", "invited", "password-issued"];

/** Query string preserving current filters, minus one-shot feedback params. */
export function buildQuery(
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const merged = { ...params, ...overrides };
  const parts = Object.entries(merged)
    .filter(([key, value]) => value && !FEEDBACK_KEYS.includes(key))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

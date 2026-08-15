import { cx } from "@/lib/cx";

/**
 * The hand-drawn yellow ring from the legacy hero, kept as the one brand
 * decoration. Purely decorative: aria-hidden, absolutely positioned by the
 * caller. Colours via currentColor so it follows the section tone.
 */
export function BrandRing({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={cx("pointer-events-none text-accent", className)}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <ellipse cx="200" cy="200" rx="178" ry="150" strokeWidth="9" transform="rotate(-14 200 200)" />
      <path
        d="M52 258c-18-62 8-142 84-186 70-40 168-34 224 26"
        strokeWidth="6"
        transform="rotate(-14 200 200)"
        opacity="0.55"
      />
    </svg>
  );
}

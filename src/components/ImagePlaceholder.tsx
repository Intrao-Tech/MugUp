import { cx } from "@/lib/cx";

/**
 * Stand-in for images the client has not supplied yet: soft brand-tinted
 * panel with a hairline cross and the alt text. Keep `role="img"` + label —
 * it is the accessible name of the missing image.
 */
export function ImagePlaceholder({
  alt,
  className = "",
  aspect = "aspect-[4/3]",
}: {
  alt: string;
  className?: string;
  /** Tailwind aspect class, e.g. "aspect-video" or "aspect-[4/5]". */
  aspect?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cx(
        "relative flex w-full items-center justify-center overflow-hidden rounded-card border border-line bg-teal-50",
        aspect,
        className,
      )}
    >
      <svg
        viewBox="0 0 100 75"
        className="absolute inset-0 h-full w-full stroke-teal-200"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <line x1="0" y1="0" x2="100" y2="75" strokeWidth="0.6" />
        <line x1="100" y1="0" x2="0" y2="75" strokeWidth="0.6" />
      </svg>
      <span className="relative rounded-full bg-surface px-3 py-1 text-eyebrow uppercase text-muted">
        {alt}
      </span>
    </div>
  );
}

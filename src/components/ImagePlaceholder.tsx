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
      className={cx("paper-ruled relative w-full overflow-hidden rounded-card border border-ink", aspect, className)}
    >
      <span className="absolute bottom-3 left-[12%] ml-3 rounded-sm border border-ink bg-surface px-2 py-0.5 text-eyebrow uppercase text-ink">
        {alt}
      </span>
    </div>
  );
}

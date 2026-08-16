import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Small uppercase kicker. Always a <p>/<span>, never a heading element. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("text-eyebrow uppercase text-primary", className)}>{children}</p>
  );
}

/**
 * Section title stack: eyebrow → H2 (or H1/H3) → intro. Use for every
 * section so the rhythm (spacing, sizes, measure) is identical everywhere.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  as: Tag = "h2",
  align = "left",
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  className?: string;
}) {
  if (!eyebrow && !title && !intro) return null;
  const size = Tag === "h1" ? "text-display" : Tag === "h2" ? "text-h2" : "text-h3";
  return (
    <div className={cx("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      {title && (
        <Tag id={id} className={cx(size, "text-balance text-ink")}>
          {title}
        </Tag>
      )}
      {intro && <p className="mt-4 text-lead text-body">{intro}</p>}
    </div>
  );
}

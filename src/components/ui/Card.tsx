import type { ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Flat card on the current surface. `interactive` adds hover lift and turns
 * the card into a "stretched-link" host: place exactly ONE
 * <Link className={STRETCHED_LINK}> inside and the whole card is clickable
 * (pseudo-element overlay: no nested anchors, one tab stop; the card shows
 * the focus state via focus-within).
 */
export function Card({
  as: Tag = "div",
  interactive = false,
  padded = true,
  className,
  children,
}: {
  as?: ElementType;
  interactive?: boolean;
  padded?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cx(
        "relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card",
        padded && "p-6",
        interactive &&
          "transition-[box-shadow,transform,border-color] duration-200 hover:border-brand hover:shadow-lift motion-safe:hover:-translate-y-0.5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Class for the single link inside an interactive Card. */
export const STRETCHED_LINK =
  "after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:outline-none";

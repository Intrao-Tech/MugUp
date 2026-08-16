import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Small rounded label (tags, categories, dates). Not a button. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-sm border border-ink bg-surface px-2 py-0.5 text-eyebrow uppercase text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

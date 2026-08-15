import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Small rounded label (tags, categories, dates). Not a button. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border border-line bg-surface-alt px-3 py-1 text-sm font-semibold text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

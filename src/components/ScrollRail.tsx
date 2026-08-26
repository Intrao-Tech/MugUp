"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconArrowRight } from "@/components/ui/icons";

/**
 * Horizontal scroll-snap rail with prev/next arrows (the Kaplan
 * "destinations" pattern the client referenced, 20 Aug 2026). Children are
 * the <li> items; the rail stays a plain scrollable list without JS.
 */
const ARROW_LABELS: Record<string, [string, string]> = {
  en: ["Scroll back", "Scroll forward"],
  ua: ["Прокрутити назад", "Прокрутити вперед"],
};

export function ScrollRail({
  label,
  locale = "en",
  className,
  children,
}: {
  /** Accessible name for the scroll region. */
  label: string;
  locale?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 8);
      setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  const arrow =
    // One quiet outline, no backplate (client, 25 Aug: the double circle read as decoration).
    "flex h-11 w-11 items-center justify-center rounded-full border border-ink bg-surface text-ink transition-colors hover:bg-ink hover:text-surface disabled:pointer-events-none disabled:opacity-30";

  const [prevLabel, nextLabel] = ARROW_LABELS[locale] ?? ARROW_LABELS.en;
  return (
    <div className={className}>
      <ul
        ref={ref}
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      {(canPrev || canNext) && (
        <p className="mt-2 flex justify-end gap-3">
          <button type="button" aria-label={prevLabel} disabled={!canPrev} onClick={() => scrollBy(-1)} className={arrow}>
            <IconArrowRight className="rotate-180" />
          </button>
          <button type="button" aria-label={nextLabel} disabled={!canNext} onClick={() => scrollBy(1)} className={arrow}>
            <IconArrowRight />
          </button>
        </p>
      )}
    </div>
  );
}

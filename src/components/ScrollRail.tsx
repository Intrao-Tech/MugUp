"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
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
  flush = false,
  children,
}: {
  /** Accessible name for the scroll region. */
  label: string;
  locale?: string;
  className?: string;
  /**
   * From lg up, sit flush inside the container instead of bleeding into the
   * gutters. Slides sized to the container then end exactly at its edge, so no
   * partial slide shows clipped text (client, 9 Sep 2026).
   */
  flush?: boolean;
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

  // Step to an exact slide edge rather than a fixed distance: iOS Safari does
  // not re-snap after a programmatic smooth scroll, so a blind scrollBy left
  // slides half-cut (client, 15 Sep 2026). Moves up to ~a viewport of slides.
  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const origin = el.getBoundingClientRect().left - el.scrollLeft + pad;
    const max = el.scrollWidth - el.clientWidth;
    const stops = Array.from(el.children, (li) =>
      Math.min(max, Math.max(0, Math.round(li.getBoundingClientRect().left - origin))),
    );
    const at = el.scrollLeft;
    const reach = el.clientWidth * 0.85;
    const target =
      dir === 1
        ? (stops.filter((s) => s > at + 4 && s <= at + reach).pop() ?? stops.find((s) => s > at + 4))
        : (stops.find((s) => s < at - 4 && s >= at - reach) ?? stops.filter((s) => s < at - 4).pop());
    if (target !== undefined) el.scrollTo({ left: target, behavior: "smooth" });
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
        className={cx(
          // scroll-padding mirrors the bleed padding so slides snap to the text
          // column, not the screen edge (client, 15 Sep 2026: first card and
          // review text sat flush against the left edge on mobile).
          "-mx-4 flex snap-x snap-mandatory scroll-px-4 items-start gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          flush ? "lg:mx-0 lg:scroll-px-0 lg:px-0" : "lg:-mx-8 lg:scroll-px-8 lg:px-8",
        )}
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

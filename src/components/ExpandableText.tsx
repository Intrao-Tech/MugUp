"use client";

import { useState } from "react";
import { cx } from "@/lib/cx";

const MORE: Record<string, [string, string]> = {
  en: ["Read more", "Show less"],
  ua: ["Читати повністю", "Згорнути"],
};

/**
 * Long testimonial quotes collapse to a few lines so one very long review
 * does not set the height of the whole carousel (client, 2 Sep 2026).
 * Short text renders as-is with no button.
 */
export function ExpandableText({
  text,
  locale = "en",
  clampAfter = 320,
}: {
  text: string;
  locale?: string;
  clampAfter?: number;
}) {
  const [open, setOpen] = useState(false);
  const long = text.length > clampAfter;
  const [more, less] = MORE[locale] ?? MORE.en;
  return (
    <>
      <span className={cx(long && !open ? "line-clamp-6" : "block")}>“{text}”</span>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="mt-3 text-sm font-bold text-primary underline decoration-brand/40 decoration-2 underline-offset-4 hover:decoration-brand"
        >
          {open ? less : more}
        </button>
      )}
    </>
  );
}

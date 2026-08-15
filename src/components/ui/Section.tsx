import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Container, type ContainerSize } from "@/components/ui/Container";

/**
 * Vertical page rhythm + colour band. `tone` sets `data-tone`, which
 * re-points the semantic colour variables (globals.css §3) — children keep
 * using text-ink / text-body / border-line and inherit the right colours.
 * Never put two `ink`/`teal` bands next to each other.
 */
export type SectionTone = "default" | "cream" | "ink" | "teal";

const TONE_BG: Record<SectionTone, string> = {
  default: "",
  cream: "bg-cream-100",
  ink: "bg-ink-900",
  teal: "bg-teal-600",
};

const PAD = {
  sm: "py-10 sm:py-12",
  md: "py-14 sm:py-20",
  lg: "py-20 sm:py-28",
} as const;

export function Section({
  id,
  tone = "default",
  pad = "md",
  size = "content",
  className,
  containerClassName,
  children,
  ...rest
}: {
  id?: string;
  tone?: SectionTone;
  pad?: keyof typeof PAD;
  size?: ContainerSize;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
}) {
  return (
    <section
      id={id}
      data-tone={tone === "default" ? undefined : tone}
      className={cx("relative", TONE_BG[tone], PAD[pad], className)}
      {...rest}
    >
      <Container size={size} className={containerClassName}>
        {children}
      </Container>
    </section>
  );
}

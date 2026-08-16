import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * The only CTA styling on the site. Renders <Link> when `href` is given,
 * otherwise <button>. Colours come from semantic tokens, so the same
 * `variant="primary"` is teal on light bands, yellow on ink, white on teal.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold text-center " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-200 " +
  "motion-safe:hover:-translate-y-px disabled:pointer-events-none disabled:opacity-50";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover shadow-card hover:shadow-lift",
  secondary: "border-2 border-ink text-ink hover:bg-ink hover:text-surface",
  ghost:
    "rounded-none px-0 text-primary underline decoration-2 decoration-brand/40 underline-offset-[6px] hover:text-primary-hover hover:decoration-brand",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-11 px-6 py-2.5 text-base",
  lg: "min-h-13 px-8 py-3.5 text-lead",
};

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type LinkProps = Common & { href: string; type?: never; disabled?: never };
type NativeProps = Common & { href?: never; type?: "button" | "submit"; disabled?: boolean };

export function Button(props: LinkProps | NativeProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = cx(BASE, VARIANT[variant], SIZE[size], className);
  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={props.type ?? "button"} disabled={props.disabled} className={cls}>
      {children}
    </button>
  );
}

import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Horizontal page rhythm. Every block of page content sits inside one of
 * these three widths — never write `mx-auto max-w-* px-*` by hand.
 *  - prose:   long-form reading (articles, legal, forms)
 *  - content: default section width
 *  - wide:    header, footer, full card grids
 */
const SIZES = {
  prose: "max-w-3xl",
  content: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export type ContainerSize = keyof typeof SIZES;

export function Container({
  size = "content",
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  size?: ContainerSize;
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cx("mx-auto w-full px-4 sm:px-6 lg:px-8", SIZES[size], className)} {...rest}>
      {children}
    </Tag>
  );
}

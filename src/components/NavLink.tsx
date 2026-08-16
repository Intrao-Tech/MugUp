"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Main-nav link that marks the current section with aria-current + brand underline. */
export function NavLink({
  href,
  exact = false,
  children,
}: {
  href: string;
  exact?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "relative flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold text-body transition-colors hover:text-ink xl:min-h-0 xl:rounded-none xl:px-1 xl:py-1",
        "xl:after:absolute xl:after:inset-x-1 xl:after:-bottom-1 xl:after:h-0.5 xl:after:rounded-full xl:after:bg-brand xl:after:opacity-0 xl:after:transition-opacity xl:hover:after:opacity-60",
        active && "bg-surface-alt text-ink xl:bg-transparent xl:after:opacity-100",
      )}
    >
      {children}
    </Link>
  );
}

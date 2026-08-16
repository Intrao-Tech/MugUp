"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { IconClose, IconMenu } from "@/components/ui/icons";

/**
 * Burger toggle for the (server-rendered) main nav passed as children.
 * Below `xl` the nav is shown only while open; at `xl+` it is always visible
 * and the button disappears (see Header.tsx nav classes). Closes on route
 * change, Escape and outside click.
 */
export function MobileNav({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const id = useId();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    // Return focus to the toggle when the menu closes under the keyboard user.
    const close = () => {
      const focusInside = wrap.current?.contains(document.activeElement);
      setOpen(false);
      if (focusInside) btn.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <div ref={wrap} className="contents">
      <button
        ref={btn}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-alt xl:hidden"
      >
        {open ? <IconClose size={24} /> : <IconMenu size={24} />}
      </button>
      <div id={id} className={cx(open ? "contents" : "hidden xl:contents")}>
        {children}
      </div>
    </div>
  );
}

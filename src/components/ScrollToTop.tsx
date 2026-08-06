"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Guarantees every navigation (new page, filter change) starts at the top of
// the page instead of inheriting the previous scroll position. In-page anchor
// jumps (#section) don't change pathname/searchParams, so they are unaffected.
export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, searchParams]);

  return null;
}

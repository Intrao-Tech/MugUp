import { Onest } from "next/font/google";

/**
 * The one brand typeface (geometric grotesque with native Cyrillic — the
 * closest open replacement for the legacy Geometria). Exposed as a CSS
 * variable and mapped to `--font-sans` in globals.css; apply `.variable` on
 * EVERY <html> root (locale layout, admin layout, global 404) or that tree
 * silently falls back to the system font.
 */
export const brandFont = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

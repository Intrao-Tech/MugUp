import { Barlow_Condensed, Onest } from "next/font/google";
import localFont from "next/font/local";

/**
 * Client-approved brand faces (docx, 20 Aug 2026):
 *  - Glacial Indifference — body. OFL, self-hosted (not on Google Fonts).
 *  - Barlow Condensed Bold — display/headings.
 * NEITHER has Cyrillic, so Onest stays in every stack as the per-glyph
 * fallback for the UA locale (and as the admin font). Apply ALL THREE
 * `.variable` classes on every <html> root (locale layout, admin layout,
 * global 404) or that tree silently falls back to the system font.
 */
export const brandFont = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export const bodyFont = localFont({
  src: [
    { path: "../fonts/glacial-indifference-400.ttf", weight: "400", style: "normal" },
    { path: "../fonts/glacial-indifference-400italic.ttf", weight: "400", style: "italic" },
    { path: "../fonts/glacial-indifference-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-glacial",
  display: "swap",
});

export const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-barlow",
  display: "swap",
});

/** The class string to put on <html>. */
export const fontVariables = `${brandFont.variable} ${bodyFont.variable} ${displayFont.variable}`;

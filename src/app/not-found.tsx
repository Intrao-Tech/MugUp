import Link from "next/link";
import { brandFont } from "@/lib/fonts";

// Global 404 for requests outside any locale (e.g. /random-page).
// Renders its own <html> because the root layout is a pass-through.
export default function NotFound() {
  return (
    <html lang="en" className={brandFont.variable}>
      <body className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-display text-ink">404 — Page Not Found</h1>
        <p className="mt-4">
          The page you are looking for does not exist. / Сторінки, яку ви шукаєте, не існує.
        </p>
        <p className="mt-6 flex justify-center gap-4">
          <Link href="/en" className="font-bold text-primary underline">
            English
          </Link>
          <Link href="/ua" className="font-bold text-primary underline">
            Українська
          </Link>
        </p>
      </body>
    </html>
  );
}

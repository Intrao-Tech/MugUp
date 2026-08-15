import Link from "next/link";

// Localized 404 boundary for unknown paths inside a valid locale.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-display text-ink">404</h1>
      <p className="mt-4 text-body">
        This page does not exist. / Такої сторінки не існує.
      </p>
      <p className="mt-6">
        <Link href="/" className="underline">
          Mug.Up
        </Link>
      </p>
    </div>
  );
}

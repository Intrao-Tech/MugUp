import Link from "next/link";
import type { ReactNode } from "react";

/** Green/red feedback banner used across all admin pages. */
export function Notice({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  const styles =
    tone === "success"
      ? "border-green-400 bg-green-50 text-green-900"
      : "border-red-400 bg-red-50 text-red-800";
  return <p className={`mt-3 border p-3 text-sm ${styles}`}>{children}</p>;
}

/** Filter chip link; the active one is inverted. */
export function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`border px-3 py-1 ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white hover:underline"
      }`}
    >
      {label}
    </Link>
  );
}

const FEEDBACK_KEYS = ["error", "saved", "deleted", "invited", "password-issued"];

/** Query string preserving current filters, minus one-shot feedback params. */
export function buildQuery(
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const merged = { ...params, ...overrides };
  const parts = Object.entries(merged)
    .filter(([key, value]) => value && !FEEDBACK_KEYS.includes(key))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

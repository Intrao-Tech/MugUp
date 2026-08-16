"use client";

import { useSearchParams } from "next/navigation";

// Reads ?sent=1 / ?error=1 after the server action redirect. Client-side so
// the page itself stays fully static.
export function FormStatusBanner({ sentText, errorText }: { sentText: string; errorText: string }) {
  const params = useSearchParams();
  if (params.get("sent")) {
    return (
      <p role="status" className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
        {sentText}
      </p>
    );
  }
  if (params.get("error")) {
    return (
      <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
        {errorText}
      </p>
    );
  }
  return null;
}

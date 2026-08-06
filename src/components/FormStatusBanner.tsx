"use client";

import { useSearchParams } from "next/navigation";

// Reads ?sent=1 / ?error=1 after the server action redirect. Client-side so
// the page itself stays fully static.
export function FormStatusBanner({ sentText, errorText }: { sentText: string; errorText: string }) {
  const params = useSearchParams();
  if (params.get("sent")) {
    return (
      <p role="status" className="border border-green-500 bg-green-50 p-3 text-sm text-green-900">
        {sentText}
      </p>
    );
  }
  if (params.get("error")) {
    return (
      <p role="alert" className="border border-red-400 bg-red-50 p-3 text-sm text-red-800">
        {errorText}
      </p>
    );
  }
  return null;
}

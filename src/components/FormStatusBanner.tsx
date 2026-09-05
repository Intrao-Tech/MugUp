"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";

// Reads ?sent=1 / ?error=1 after the server action redirect. Client-side so
// the page itself stays fully static. With `booking`, a successful send is
// followed by the appointment-scheduling step (client, 28 Aug 2026).
export function FormStatusBanner({
  sentText,
  errorText,
  booking,
}: {
  sentText: string;
  errorText: string;
  booking?: { url: string; label: string };
}) {
  const params = useSearchParams();
  if (params.get("sent")) {
    return (
      <div role="status" className="rounded-card border border-ink bg-teal-50 px-5 py-4 text-base text-ink">
        <p className="font-semibold">{sentText}</p>
        {booking && (
          <p className="mt-4">
            <Button href={booking.url} size="lg">
              {booking.label}
              <IconArrowRight />
            </Button>
          </p>
        )}
      </div>
    );
  }
  if (params.get("error")) {
    return (
      <p role="alert" className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
        {errorText}
      </p>
    );
  }
  return null;
}

// Scheduled publishing is entered as UK wall-clock time (the studio is in
// Bedford); the database stores UTC instants.

/** Zone offset of Europe/London at the given instant, in milliseconds. */
function londonOffsetMs(date: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - date.getTime();
}

/**
 * Convert a `datetime-local` value ("2026-08-14T09:30"), read as Europe/London
 * wall time, to a UTC ISO string. Returns null for malformed input.
 */
export function ukWallTimeToIso(value: string): string | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  const [y, mo, d, h, mi] = match.slice(1).map(Number);
  const utcGuess = Date.UTC(y, mo - 1, d, h, mi);
  const instant = utcGuess - londonOffsetMs(new Date(utcGuess));
  // A DST boundary can shift the offset between the guess and the real
  // instant — recompute once with the corrected instant.
  const corrected = utcGuess - londonOffsetMs(new Date(instant));
  return new Date(corrected).toISOString();
}

/** Format a stored UTC instant as UK wall time for admin display. */
export function isoToUkDisplay(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** `datetime-local` default value (UK wall time) for a stored UTC instant. */
export function isoToUkWallTime(iso: string): string {
  const date = new Date(iso);
  const shifted = new Date(date.getTime() + londonOffsetMs(date));
  return shifted.toISOString().slice(0, 16);
}

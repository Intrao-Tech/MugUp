"use client";

import { useRef, useState } from "react";
import { savePostSchedule } from "../actions";
import { BTN_SECONDARY } from "../ui";

// Client-side guard for the Schedule button: pressing it with an empty (or
// past) date used to round-trip to the server, whose error redirect threw
// away everything typed into a NEW post. Now the submit is blocked in the
// browser with an inline message and nothing is lost; the server still
// re-validates as the source of truth.

/** Current UK wall time as a datetime-local string (lexicographic compare-safe). */
function ukNow(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function ScheduleField({ initialValue }: { initialValue: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-end gap-2">
        <div>
          <label htmlFor="publish_at" className="block text-xs font-bold text-body">
            Go live at (UK time)
          </label>
          <input
            ref={input}
            id="publish_at"
            name="publish_at"
            type="datetime-local"
            defaultValue={initialValue}
            onChange={() => setError(null)}
            className="mt-1 rounded-lg border border-ink-300 bg-surface px-2 py-1.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button
          type="submit"
          formAction={savePostSchedule}
          onClick={(event) => {
            const value = input.current?.value ?? "";
            if (!value) {
              event.preventDefault();
              setError("Pick the date and time first — nothing has been lost, just set it and press Schedule again.");
              return;
            }
            if (value <= ukNow()) {
              event.preventDefault();
              setError("That time is already in the past (UK time) — pick a future moment.");
              return;
            }
            setError(null);
          }}
          className={BTN_SECONDARY}
        >
          Schedule
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

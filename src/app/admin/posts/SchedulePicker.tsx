"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { ukNowWallTime } from "@/lib/uk-time";
import { FIELD_ERROR, INPUT } from "../ui";

// Date + time picker for scheduled publishing, in the panel's own design and
// always in UK wall time (the studio's clock, whatever the member's device
// says). Replaces the browser's datetime-local control, whose calendar looks
// foreign and whose "now" is the device's zone. The value travels in a
// hidden input as "YYYY-MM-DDTHH:MM" — exactly what the save action reads.
//
// The panel is position:fixed and placed from the button's rectangle (below
// it, or above when the viewport has no room below): an absolute panel near
// the end of a short page grew the document, toggled the scrollbar and
// shifted the whole page sideways every time it opened.

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

const pad = (n: number) => String(n).padStart(2, "0");
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
/** Offset of the 1st inside a Monday-first week. */
const leadingBlanks = (year: number, month: number) => (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export function SchedulePicker({
  initialValue,
  error,
  onChange,
}: {
  /** "YYYY-MM-DDTHH:MM" in UK time, or "" for none. */
  initialValue: string;
  error?: string;
  /** Any change clears the field's error in the parent form. */
  onChange?: () => void;
}) {
  const [date, setDate] = useState(initialValue.slice(0, 10));
  const [hour, setHour] = useState(initialValue ? initialValue.slice(11, 13) : "09");
  const [minute, setMinute] = useState(initialValue ? initialValue.slice(14, 16) : "00");
  const [open, setOpen] = useState(false);
  const now = ukNowWallTime();
  const today = now.slice(0, 10);
  const [view, setView] = useState(() => {
    const base = date || today;
    return { year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) - 1 };
  });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect();
      const box = panel.current;
      if (!anchor || !box) return;
      const gap = 8;
      const fitsBelow = anchor.bottom + gap + box.offsetHeight <= window.innerHeight;
      const top = fitsBelow ? anchor.bottom + gap : Math.max(gap, anchor.top - gap - box.offsetHeight);
      const left = Math.max(gap, Math.min(anchor.left, window.innerWidth - box.offsetWidth - gap));
      setPosition({ top, left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const value = date ? `${date}T${hour}:${minute}` : "";

  function shiftMonth(delta: number) {
    setView(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks(view.year, view.month)).fill(null),
    ...Array.from({ length: daysInMonth(view.year, view.month) }, (_, i) => i + 1),
  ];

  return (
    <div ref={root} className="relative">
      <input type="hidden" name="publish_at" value={value} />
      <span id={`${id}-label`} className="block text-sm font-bold text-ink">
        Go live at (UK time)
      </span>
      <button
        ref={trigger}
        type="button"
        aria-labelledby={`${id}-label`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        onClick={() => setOpen((current) => !current)}
        className={cx(INPUT, "flex w-72 items-center justify-between text-left")}
      >
        <span className={value ? undefined : "text-muted"}>
          {value ? `${formatDay(date)}, ${hour}:${minute}` : "Pick a date and time"}
        </span>
        <span aria-hidden="true" className="text-muted">
          ▾
        </span>
      </button>
      {error && <p className={FIELD_ERROR}>{error}</p>}

      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label="Choose the date and time (UK time)"
          // Measured off-screen on the first frame, then placed.
          style={position ?? { top: -9999, left: -9999 }}
          className="fixed z-30 w-80 rounded-card border border-ink bg-surface p-3 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="rounded-lg px-2 py-1 text-lg leading-none text-ink hover:bg-surface-alt"
            >
              ‹
            </button>
            <span className="text-sm font-bold text-ink">
              {MONTHS[view.month]} {view.year}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="rounded-lg px-2 py-1 text-lg leading-none text-ink hover:bg-surface-alt"
            >
              ›
            </button>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) return <span key={`blank-${index}`} />;
              const iso = `${view.year}-${pad(view.month + 1)}-${pad(day)}`;
              const past = iso < today;
              const selected = iso === date;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={past}
                  aria-pressed={selected}
                  onClick={() => {
                    setDate(iso);
                    onChange?.();
                  }}
                  className={cx(
                    "h-9 rounded-lg text-sm transition-colors",
                    past && "cursor-not-allowed text-muted/50",
                    !past && !selected && "text-ink hover:bg-surface-alt",
                    !selected && iso === today && "border border-primary font-bold text-primary",
                    selected && "bg-primary font-bold text-on-primary",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <label htmlFor={`${id}-hour`} className="text-muted">
              Time
            </label>
            <select
              id={`${id}-hour`}
              value={hour}
              onChange={(event) => {
                setHour(event.target.value);
                onChange?.();
              }}
              className={cx(INPUT, "mt-0 w-auto py-1.5")}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span className="text-ink">:</span>
            <select
              aria-label="Minutes"
              value={minute}
              onChange={(event) => {
                setMinute(event.target.value);
                onChange?.();
              }}
              className={cx(INPUT, "mt-0 w-auto py-1.5")}
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <span>
              Now in the UK: {now.slice(11, 16)}, {formatDay(today)}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-bold text-primary hover:text-primary-hover"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

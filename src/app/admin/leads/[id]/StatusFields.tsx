"use client";

import { useState } from "react";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  LOST_REASON_LABELS,
  LOST_REASONS,
  type LeadStatus,
  type LostReason,
} from "@/lib/db-types";

// Status picker with contextual fields: the Lost reason/note inputs exist
// only while "Lost" is selected — for every other status they are neither
// visible nor submitted. Server-side validation stays the source of truth.

export function StatusFields({
  status,
  lostReason,
  lostReasonNote,
}: {
  status: LeadStatus;
  lostReason: LostReason | null;
  lostReasonNote: string;
}) {
  const [current, setCurrent] = useState<LeadStatus>(status);
  const [reason, setReason] = useState<string>(lostReason ?? "");
  const inputCls = "border border-neutral-300 p-2";

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          name="status"
          value={current}
          onChange={(event) => setCurrent(event.target.value as LeadStatus)}
          aria-label="Status"
          className={inputCls}
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {current === "lost" && (
          <select
            name="lost_reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            aria-label="Lost reason"
            className={inputCls}
          >
            <option value="">Lost reason…</option>
            {LOST_REASONS.map((r) => (
              <option key={r} value={r}>
                {LOST_REASON_LABELS[r]}
              </option>
            ))}
          </select>
        )}
      </div>
      {current === "lost" && (
        <input
          name="lost_reason_note"
          placeholder={
            reason === "other" ? "Lost note (required for “Other”)" : "Lost note (optional)"
          }
          required={reason === "other"}
          defaultValue={lostReasonNote}
          className="w-full border border-neutral-300 p-2"
        />
      )}
    </div>
  );
}

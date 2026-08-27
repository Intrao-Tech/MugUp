import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LEAD_FORM_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_SOURCES,
  LEAD_STATUS_LABELS,
  LOST_REASON_LABELS,
} from "@/lib/db-types";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { maskEmail, maskPhone } from "@/lib/pii";
import { PROGRAMME_SUGGESTIONS } from "@/lib/programmes";
import { saveLeadNotes, updateLeadDetails, updateLeadStatus } from "../../actions";
import { BTN_PRIMARY, CARD, H1, H2, INPUT, Notice } from "../../ui";
import { StatusFields } from "./StatusFields";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  save: "Could not save — try again.",
  input: "Check the fields and try again.",
  "lost-reason": "Marking an enquiry as Lost needs a reason (and a note when the reason is “Other”).",
};

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const profile = await requireProfile("leads.view");
  const { id } = await params;
  const { saved, error } = await searchParams;
  const canManage = hasPerm(profile, "leads.manage");
  const canSeePii = hasPerm(profile, "leads.pii");

  const data = await getData();
  const [lead, profiles] = await Promise.all([data.leads.get(id), data.team.listProfiles()]);
  if (!lead) notFound();

  let fileUrl: string | null = null;
  if (lead.file_path && canSeePii) {
    fileUrl = await data.files.getLeadFileUrl(lead.file_path, 600);
  }

  const inputCls = INPUT;
  const facts: [string, string][] = [
    ["Source form", LEAD_FORM_LABELS[lead.form]],
    ["Site language", lead.locale.toUpperCase()],
    ["Email", canSeePii ? lead.email : maskEmail(lead.email)],
    ["Phone", (canSeePii ? lead.phone : maskPhone(lead.phone)) ?? "—"],
    ["Who it is for", lead.who_for ?? "—"],
    ["Pathway interest", lead.pathway_interest ?? "—"],
    ["Preferred format", lead.preferred_format ?? "—"],
    ["Subject", lead.subject ?? "—"],
  ];

  return (
    <div className="max-w-2xl">
      <p className="text-sm">
        <Link
          href="/admin/leads"
          className="text-primary underline underline-offset-4 hover:text-primary-hover"
        >
          ← All enquiries
        </Link>
      </p>
      <h1 className={`mt-2 ${H1}`}>{lead.full_name}</h1>
      <p className="text-sm text-muted">
        Received {new Date(lead.created_at).toLocaleString("en-GB")} · status:{" "}
        {LEAD_STATUS_LABELS[lead.status]}
        {lead.status === "lost" && lead.lost_reason && (
          <>
            {" "}
            ({LOST_REASON_LABELS[lead.lost_reason]}
            {lead.lost_reason_note && `: ${lead.lost_reason_note}`})
          </>
        )}
      </p>
      {saved && <Notice tone="success">Saved.</Notice>}
      {error && <Notice tone="error">{ERRORS[error] ?? ERRORS.save}</Notice>}
      {!canSeePii && (
        <p className="mt-2 text-xs text-muted">
          Contact details are masked — you need the “View learner personal data” permission.
        </p>
      )}

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {lead.message &&
        (canSeePii ? (
          <section className="mt-6">
            <h2 className={H2}>Message</h2>
            <p className={`mt-1 whitespace-pre-wrap ${CARD} p-3`}>
              {lead.message}
            </p>
          </section>
        ) : (
          <p className="mt-6 text-sm text-muted">
            A message is attached — hidden without the personal-data permission.
          </p>
        ))}

      <section className="mt-6">
        <h2 className={H2}>Attached file</h2>
        {lead.file_path ? (
          fileUrl ? (
            <p className="mt-1">
              <a
                href={fileUrl}
                className="text-primary underline underline-offset-4 hover:text-primary-hover"
                target="_blank"
                rel="noopener"
              >
                Download (link valid 10 minutes)
              </a>
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">
              A file is attached; you need the “View learner personal data” permission to open it.
            </p>
          )
        ) : (
          <p className="mt-1 text-sm text-muted">None.</p>
        )}
      </section>

      {canManage && (
        <>
          <section className="mt-8 border-t border-line pt-4">
            <h2 className={H2}>Enquiry management</h2>
            <form action={updateLeadDetails} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="programme" className="block text-sm font-bold text-ink">
                    Programme
                  </label>
                  <input
                    id="programme"
                    name="programme"
                    list="programme-suggestions"
                    defaultValue={lead.programme}
                    className={inputCls}
                  />
                  <datalist id="programme-suggestions">
                    {PROGRAMME_SUGGESTIONS.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="source" className="block text-sm font-bold text-ink">
                    Lead source
                  </label>
                  <select id="source" name="source" defaultValue={lead.source ?? ""} className={inputCls}>
                    <option value="">Unknown</option>
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {LEAD_SOURCE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="owner_id" className="block text-sm font-bold text-ink">
                    Owner
                  </label>
                  <select id="owner_id" name="owner_id" defaultValue={lead.owner_id ?? ""} className={inputCls}>
                    <option value="">Unassigned</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || p.email}
                      </option>
                    ))}
                  </select>
                </div>
                {/* A closed or lost enquiry has no next step — the fields
                    only exist for statuses that still move forward. */}
                {!["closed", "lost"].includes(lead.status) && (
                  <div>
                    <label htmlFor="next_action_date" className="block text-sm font-bold text-ink">
                      Next action due
                    </label>
                    <input
                      id="next_action_date"
                      name="next_action_date"
                      type="date"
                      defaultValue={lead.next_action_date ?? ""}
                      className={inputCls}
                    />
                  </div>
                )}
              </div>
              {!["closed", "lost"].includes(lead.status) && (
                <div>
                  <label htmlFor="next_action" className="block text-sm font-bold text-ink">
                    Next action
                  </label>
                  <input
                    id="next_action"
                    name="next_action"
                    placeholder="e.g. Call back after assessment"
                    defaultValue={lead.next_action}
                    className={inputCls}
                  />
                </div>
              )}
              <button type="submit" className={BTN_PRIMARY}>
                Save management fields
              </button>
            </form>
          </section>

          <section className="mt-6">
            <h2 className={H2}>Status</h2>
            <form action={updateLeadStatus} className="mt-2 space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="back" value={`/admin/leads/${lead.id}`} />
              {/* Lost reason/note appear only while "Lost" is selected. */}
              <StatusFields
                status={lead.status}
                lostReason={lead.lost_reason}
                lostReasonNote={lead.lost_reason_note}
              />
              <button type="submit" className={BTN_PRIMARY}>
                Save status
              </button>
            </form>
          </section>

          <section className="mt-6">
            <h2 className={H2}>Internal notes</h2>
            <form action={saveLeadNotes} className="mt-2">
              <input type="hidden" name="id" value={lead.id} />
              <textarea
                name="notes"
                rows={5}
                defaultValue={lead.notes}
                className={INPUT}
              />
              <button type="submit" className={`mt-2 ${BTN_PRIMARY}`}>
                Save notes
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}

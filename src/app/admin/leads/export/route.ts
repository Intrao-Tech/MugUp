import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import {
  LEAD_FORM_LABELS,
  LEAD_FORMS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  LOST_REASON_LABELS,
  type LeadForm,
  type LeadStatus,
} from "@/lib/db-types";
import { maskEmail, maskPhone } from "@/lib/pii";

export const dynamic = "force-dynamic";

function csvCell(value: string | null | undefined): string {
  const text = value ?? "";
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * CSV export of enquiries, honouring the current list filters. Requires
 * leads.export; learner contact details are masked without leads.pii.
 * Every export is written to the activity log.
 */
export async function GET(request: Request): Promise<Response> {
  const profile = await requireProfile("leads.export");
  const params = new URL(request.url).searchParams;

  const status = LEAD_STATUSES.includes(params.get("status") as LeadStatus)
    ? (params.get("status") as LeadStatus)
    : undefined;
  const form = LEAD_FORMS.includes(params.get("form") as LeadForm)
    ? (params.get("form") as LeadForm)
    : undefined;
  const search = params.get("q")?.slice(0, 100) || undefined;

  const data = await getData();
  const [leads, profiles] = await Promise.all([
    data.leads.list({ status, form, search, sort: "newest", limit: 10000 }),
    data.team.listProfiles(),
  ]);
  const ownerName = new Map(profiles.map((p) => [p.id, p.full_name || p.email]));
  const canPii = hasPerm(profile, "leads.pii");

  const header = [
    "Date", "Form", "Name", "Email", "Phone", "Language", "Who for", "Interest",
    "Programme", "Source", "Owner", "Next action", "Next action due", "Status",
    "Lost reason", "Lost note", "Message", "Notes",
  ];
  const rows = leads.map((lead) => [
    new Date(lead.created_at).toISOString(),
    LEAD_FORM_LABELS[lead.form],
    lead.full_name,
    canPii ? lead.email : maskEmail(lead.email),
    canPii ? lead.phone : maskPhone(lead.phone),
    lead.locale,
    lead.who_for,
    lead.pathway_interest ?? lead.subject,
    lead.programme,
    lead.source ? LEAD_SOURCE_LABELS[lead.source] : "",
    lead.owner_id ? (ownerName.get(lead.owner_id) ?? "") : "",
    lead.next_action,
    lead.next_action_date,
    LEAD_STATUS_LABELS[lead.status],
    lead.lost_reason ? LOST_REASON_LABELS[lead.lost_reason] : "",
    lead.lost_reason_note,
    canPii ? lead.message : "",
    lead.notes,
  ]);

  await data.activity.record({
    actorId: profile.id,
    actorEmail: profile.email,
    action: "leads.export",
    entity: "leads",
    entityId: "",
    detail:
      `${leads.length} rows` +
      (status ? `; status=${status}` : "") +
      (form ? `; form=${form}` : "") +
      (search ? `; search="${search}"` : "") +
      (canPii ? "" : "; contact details masked"),
  });

  // BOM so Excel opens the file as UTF-8 (Ukrainian text in notes/messages).
  const body =
    "\uFEFF" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${stamp}.csv"`,
    },
  });
}

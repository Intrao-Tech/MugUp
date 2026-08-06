import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LEAD_FORM_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  type LeadRow,
} from "@/lib/db-types";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { saveLeadNotes, updateLeadStatus } from "../../actions";
import { Notice } from "../../ui";

export const dynamic = "force-dynamic";

const FIELDS: { key: keyof LeadRow; label: string }[] = [
  { key: "form", label: "Source" },
  { key: "locale", label: "Site language" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "who_for", label: "Who it is for" },
  { key: "pathway_interest", label: "Pathway interest" },
  { key: "preferred_format", label: "Preferred format" },
  { key: "subject", label: "Subject" },
];

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

  const data = await getData();
  const lead = await data.leads.get(id);
  if (!lead) notFound();

  let fileUrl: string | null = null;
  if (lead.file_path && hasPerm(profile, "files.view")) {
    fileUrl = await data.files.getLeadFileUrl(lead.file_path, 600);
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm">
        <Link href="/admin/leads" className="underline">
          ← All enquiries
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-bold">{lead.full_name}</h1>
      <p className="text-sm text-neutral-500">
        Received {new Date(lead.created_at).toLocaleString("en-GB")}
      </p>
      {saved && (
        <Notice tone="success">Saved.</Notice>
      )}
      {error && (
        <Notice tone="error">
          Could not save — try again.
        </Notice>
      )}

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <dt className="text-sm text-neutral-500">{label}</dt>
            <dd>
              {key === "form" ? LEAD_FORM_LABELS[lead.form] : String(lead[key] ?? "—") || "—"}
            </dd>
          </div>
        ))}
      </dl>

      {lead.message && (
        <section className="mt-6">
          <h2 className="font-semibold">Message</h2>
          <p className="mt-1 whitespace-pre-wrap border border-neutral-300 bg-white p-3">
            {lead.message}
          </p>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-semibold">Attached file</h2>
        {lead.file_path ? (
          fileUrl ? (
            <p className="mt-1">
              <a href={fileUrl} className="underline" target="_blank" rel="noopener">
                Download (link valid 10 minutes)
              </a>
            </p>
          ) : (
            <p className="mt-1 text-sm text-neutral-500">
              A file is attached; you need the “View uploaded files” permission to open it.
            </p>
          )
        ) : (
          <p className="mt-1 text-sm text-neutral-500">None.</p>
        )}
      </section>

      {canManage && (
        <>
          <section className="mt-6">
            <h2 className="font-semibold">Status</h2>
            <form action={updateLeadStatus} className="mt-2 flex items-center gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="back" value={`/admin/leads/${lead.id}`} />
              <select name="status" defaultValue={lead.status} className="border border-neutral-300 p-2">
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className="border border-neutral-900 px-4 py-2">
                Save
              </button>
            </form>
          </section>
          <section className="mt-6">
            <h2 className="font-semibold">Internal notes</h2>
            <form action={saveLeadNotes} className="mt-2">
              <input type="hidden" name="id" value={lead.id} />
              <textarea
                name="notes"
                rows={5}
                defaultValue={lead.notes}
                className="w-full border border-neutral-300 p-2"
              />
              <button type="submit" className="mt-2 border border-neutral-900 px-4 py-2">
                Save notes
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}

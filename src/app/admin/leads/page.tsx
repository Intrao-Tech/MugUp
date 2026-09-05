import Link from "next/link";
import {
  LEAD_FORM_LABELS,
  LEAD_FORMS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  type LeadForm,
  type LeadStatus,
} from "@/lib/db-types";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { updateLeadStatus } from "../actions";
import { BTN_LINK, BTN_SECONDARY, buildQuery, CARD, FilterChip, H1, INPUT, Notice } from "../ui";

export const dynamic = "force-dynamic";

type Search = {
  status?: string;
  form?: string;
  q?: string;
  sort?: string;
  error?: string;
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const profile = await requireProfile("leads.view");
  const params = await searchParams;
  const canManage = hasPerm(profile, "leads.manage");

  const status = LEAD_STATUSES.includes(params.status as LeadStatus)
    ? (params.status as LeadStatus)
    : undefined;
  const form = LEAD_FORMS.includes(params.form as LeadForm)
    ? (params.form as LeadForm)
    : undefined;
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const search = params.q?.slice(0, 100);

  const data = await getData();
  const [leads, profiles, ...counts] = await Promise.all([
    data.leads.list({ status, form, search, sort, limit: 200 }),
    data.team.listProfiles(),
    ...LEAD_STATUSES.map((s) => data.leads.countByStatus(s)),
  ]);
  const total = counts.reduce((sum, n) => sum + n, 0);
  const ownerName = (id: string | null) => {
    if (!id) return "—";
    const owner = profiles.find((p) => p.id === id);
    return owner ? owner.full_name || owner.email : "—";
  };
  const today = new Date().toISOString().slice(0, 10);

  const chipHref = (overrides: Record<string, string | undefined>) =>
    `/admin/leads${buildQuery(params, overrides)}`;

  const filterLabel = "w-12 shrink-0 pt-0.5 text-eyebrow uppercase text-muted";

  return (
    <div>
      <h1 className={H1}>Enquiries</h1>
      <p className="mt-1 text-base text-body">
        Everything visitors submit through the site lands here. Click a name to manage the
        enquiry — owner, next action, notes and files.
      </p>
      {params.error && <Notice tone="error">Could not save the change — try again.</Notice>}

      <div className={`mt-4 space-y-2 ${CARD} p-3 text-sm`}>
        <div className="flex flex-wrap items-start gap-2">
          <span className={filterLabel}>Status</span>
          <span className="flex flex-wrap gap-1.5">
            <FilterChip label={`All (${total})`} href={chipHref({ status: undefined })} active={!status} />
            {LEAD_STATUSES.map((s, i) => (
              <FilterChip
                key={s}
                label={`${LEAD_STATUS_LABELS[s]} (${counts[i]})`}
                href={chipHref({ status: s })}
                active={status === s}
              />
            ))}
          </span>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <span className={filterLabel}>Form</span>
          <span className="flex flex-wrap gap-1.5">
            <FilterChip label="All forms" href={chipHref({ form: undefined })} active={!form} />
            {LEAD_FORMS.map((f) => (
              <FilterChip
                key={f}
                label={LEAD_FORM_LABELS[f]}
                href={chipHref({ form: f })}
                active={form === f}
              />
            ))}
          </span>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <span className={filterLabel}>Sort</span>
          <span className="flex flex-wrap gap-1.5">
            <FilterChip label="Newest first" href={chipHref({ sort: undefined })} active={sort === "newest"} />
            <FilterChip label="Oldest first" href={chipHref({ sort: "oldest" })} active={sort === "oldest"} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2">
          <form action="/admin/leads" method="get" className="flex min-w-64 flex-1 items-center gap-2">
            {status && <input type="hidden" name="status" value={status} />}
            {form && <input type="hidden" name="form" value={form} />}
            {sort === "oldest" && <input type="hidden" name="sort" value="oldest" />}
            <input
              type="search"
              name="q"
              defaultValue={search ?? ""}
              placeholder="Search by name or email…"
              className={`${INPUT} max-w-xs`}
            />
            <button type="submit" className={BTN_SECONDARY}>
              Search
            </button>
            {search && (
              <Link href={chipHref({ q: undefined })} className={`self-center ${BTN_LINK}`}>
                Clear
              </Link>
            )}
          </form>
          {hasPerm(profile, "leads.export") && (
            <span className="ml-auto">
              <a
                href={`/admin/leads/export${buildQuery(params, {})}`}
                className={BTN_SECONDARY}
              >
                Export CSV
              </a>
              <span className="ml-2 text-muted">exports the current filter</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse bg-surface text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-2 text-eyebrow uppercase text-muted">Date</th>
              <th className="p-2 text-eyebrow uppercase text-muted">Enquiry</th>
              <th className="p-2 text-eyebrow uppercase text-muted">Source</th>
              <th className="p-2 text-eyebrow uppercase text-muted">Owner</th>
              <th className="p-2 text-eyebrow uppercase text-muted">Next action</th>
              <th className="p-2 text-eyebrow uppercase text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const overdue =
                lead.next_action_date &&
                lead.next_action_date <= today &&
                !["enrolled", "closed", "lost"].includes(lead.status);
              return (
                <tr key={lead.id} className="border-b border-line align-top">
                  <td className="p-2 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString("en-GB")}
                    <span className="block text-xs text-muted">
                      {LEAD_FORM_LABELS[lead.form]}
                    </span>
                  </td>
                  <td className="p-2">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-bold text-primary underline underline-offset-4 hover:text-primary-hover"
                    >
                      {lead.full_name}
                    </Link>
                    <span className="block text-xs text-muted">
                      {[lead.pathway_interest ?? lead.subject, lead.programme]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </span>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {lead.source ? LEAD_SOURCE_LABELS[lead.source] : "—"}
                  </td>
                  <td className="p-2">{ownerName(lead.owner_id)}</td>
                  <td className="p-2">
                    {lead.next_action || "—"}
                    {lead.next_action_date && (
                      <span
                        className={`block text-xs ${
                          overdue ? "font-bold text-red-700" : "text-muted"
                        }`}
                      >
                        due {new Date(lead.next_action_date).toLocaleDateString("en-GB")}
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    {canManage ? (
                      <form action={updateLeadStatus} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={lead.id} />
                        <select name="status" defaultValue={lead.status} className={INPUT}>
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {LEAD_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className={BTN_LINK}>
                          Save
                        </button>
                      </form>
                    ) : (
                      LEAD_STATUS_LABELS[lead.status]
                    )}
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-muted">
                  No enquiries match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

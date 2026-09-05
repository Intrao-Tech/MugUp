import Link from "next/link";
import { requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { BTN_LINK, BTN_SECONDARY, buildQuery, CARD, FilterChip, H1, INPUT } from "../ui";

export const dynamic = "force-dynamic";

type RangeKey = "today" | "7d" | "30d" | "all";

const RANGE_LABEL: Record<RangeKey, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Friendly module name from the entity slug the log stores. */
function moduleOf(entity: string): string {
  switch (entity) {
    case "lead":
      return "Enquiries";
    case "review":
      return "Reviews";
    case "post":
      return "Insights";
    case "user":
      return "Team";
    case "notification":
      return "Notifications";
    case "settings":
      return "Settings";
    default:
      return "Other";
  }
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  await requireProfile("users.manage");
  const params = await searchParams;

  // Custom from/to dates (yyyy-mm-dd) win over the range chips.
  const customFrom = DATE_RE.test(params.from ?? "") ? params.from : undefined;
  const customTo = DATE_RE.test(params.to ?? "") ? params.to : undefined;
  const range: RangeKey =
    customFrom || customTo
      ? "all"
      : (["today", "7d", "30d", "all"] as RangeKey[]).includes(params.range as RangeKey)
        ? (params.range as RangeKey)
        : "7d";

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const daysAgo = (days: number) =>
    new Date(startOfToday.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  let from: string | undefined;
  let to: string | undefined;
  if (customFrom || customTo) {
    from = customFrom ? new Date(`${customFrom}T00:00:00`).toISOString() : undefined;
    // "to" is inclusive for the user -> exclusive next midnight for the query.
    to = customTo
      ? new Date(new Date(`${customTo}T00:00:00`).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : undefined;
  } else if (range === "today") {
    from = startOfToday.toISOString();
  } else if (range === "7d") {
    from = daysAgo(6);
  } else if (range === "30d") {
    from = daysAgo(29);
  }

  const data = await getData();
  const entries = await data.activity.list({ limit: 1000, from, to });

  // Stats over the filtered window.
  const byModule = new Map<string, number>();
  const byActor = new Map<string, number>();
  const byDay = new Map<string, number>();
  for (const entry of entries) {
    const mod = moduleOf(entry.entity);
    byModule.set(mod, (byModule.get(mod) ?? 0) + 1);
    const actor = entry.actor_email || "system";
    byActor.set(actor, (byActor.get(actor) ?? 0) + 1);
    const day = entry.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const topActors = [...byActor.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const busiestDay = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];

  const chipHref = (overrides: Record<string, string | undefined>) =>
    `/admin/activity${buildQuery(params, overrides)}`;

  return (
    <div>
      <h1 className={H1}>Activity log</h1>
      <p className="mt-1 text-base text-body">
        Who changed enquiries, moderation, publishing, exports and team permissions. Written
        server-side only — entries cannot be edited or deleted from the panel.
      </p>

      <div className={`mt-4 space-y-2 ${CARD} p-3 text-sm`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(RANGE_LABEL) as RangeKey[]).map((key) => (
            <FilterChip
              key={key}
              label={RANGE_LABEL[key]}
              href={chipHref({ range: key === "7d" ? undefined : key, from: undefined, to: undefined })}
              active={range === key && !customFrom && !customTo}
            />
          ))}
        </div>
        <form
          action="/admin/activity"
          method="get"
          className="flex flex-wrap items-end gap-2 border-t border-line pt-2"
        >
          <label className="block">
            <span className="text-xs font-bold text-muted">From</span>
            <input type="date" name="from" defaultValue={customFrom} className={INPUT} />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-muted">To (inclusive)</span>
            <input type="date" name="to" defaultValue={customTo} className={INPUT} />
          </label>
          <button type="submit" className={BTN_SECONDARY}>
            Apply
          </button>
          {(customFrom || customTo) && (
            <Link href="/admin/activity" className={`self-center ${BTN_LINK}`}>
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className={`${CARD} p-3`}>
          <p className="text-eyebrow uppercase text-muted">Actions in period</p>
          <p className="mt-1 font-display text-3xl text-brand">{entries.length}{entries.length === 1000 ? "+" : ""}</p>
          {busiestDay && (
            <p className="text-xs text-muted">
              busiest day: {new Date(busiestDay[0]).toLocaleDateString("en-GB")} ({busiestDay[1]})
            </p>
          )}
        </div>
        <div className={`${CARD} p-3`}>
          <p className="text-eyebrow uppercase text-muted">By module</p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {[...byModule.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([mod, count]) => (
                <li key={mod} className="flex justify-between">
                  <span>{mod}</span>
                  <span className="font-bold text-ink">{count}</span>
                </li>
              ))}
            {byModule.size === 0 && <li className="text-muted">—</li>}
          </ul>
        </div>
        <div className={`${CARD} p-3`}>
          <p className="text-eyebrow uppercase text-muted">Most active</p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {topActors.map(([actor, count]) => (
              <li key={actor} className="flex justify-between gap-2">
                <span className="truncate">{actor}</span>
                <span className="font-bold text-ink">{count}</span>
              </li>
            ))}
            {topActors.length === 0 && <li className="text-muted">—</li>}
          </ul>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse bg-surface text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-2 text-eyebrow uppercase text-muted">Date</th>
              <th className="p-2 text-eyebrow uppercase text-muted">Who</th>
              <th className="p-2 text-eyebrow uppercase text-muted">Action</th>
              <th className="p-2 text-eyebrow uppercase text-muted">Detail</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-line align-top">
                <td className="p-2 whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleString("en-GB", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="p-2 whitespace-nowrap">{entry.actor_email || "system"}</td>
                <td className="p-2 whitespace-nowrap font-mono text-xs">{entry.action}</td>
                <td className="p-2">{entry.detail}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-muted">
                  Nothing logged in this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { LEAD_SOURCE_LABELS, LEAD_STATUSES, type LeadStatus } from "@/lib/db-types";
import type { LeadStatsRow } from "@/lib/data/ports";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { PERMISSION_LABELS, ROLE_DESCRIPTIONS } from "@/lib/permissions";
import { Notice } from "./ui";

export const dynamic = "force-dynamic";

const FUNNEL_DONE: LeadStatus[] = ["enrolled", "closed", "lost"];

function statusReached(status: LeadStatus, milestone: LeadStatus): boolean {
  // Lost/closed leads left the funnel — they never "reach" later milestones.
  if (status === "lost" || status === "closed") return false;
  return LEAD_STATUSES.indexOf(status) >= LEAD_STATUSES.indexOf(milestone);
}

function areaOf(row: LeadStatsRow): "Britain" | "Global" | "Other" {
  const interest = row.pathway_interest ?? "";
  if (/british|британ/i.test(interest)) return "Britain";
  if (/global|інтеграц/i.test(interest)) return "Global";
  return "Other";
}

function Dashboard({ rows }: { rows: LeadStatsRow[] }) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = rows.filter((r) => new Date(r.created_at) >= monthStart);
  const enrolled = thisMonth.filter((r) => r.status === "enrolled").length;
  const monthCards = [
    { value: thisMonth.length, label: "New enquiries" },
    { value: thisMonth.filter((r) => r.status !== "new").length, label: "Contacted" },
    {
      value: thisMonth.filter((r) => statusReached(r.status, "assessment_booked")).length,
      label: "Assessments booked",
    },
    { value: enrolled, label: "Enrolled" },
    {
      value: thisMonth.length ? `${Math.round((enrolled / thisMonth.length) * 100)}%` : "—",
      label: "Enquiry → enrolment",
    },
  ];

  const areas = rows.reduce<Record<string, number>>((acc, row) => {
    const area = areaOf(row);
    acc[area] = (acc[area] ?? 0) + 1;
    return acc;
  }, {});

  const sources = rows.reduce<Record<string, number>>((acc, row) => {
    if (!row.source) return acc;
    const label = LEAD_SOURCE_LABELS[row.source];
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  const topSources = Object.entries(sources)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const today = new Date().toISOString().slice(0, 10);
  const attention = [
    {
      count: rows.filter((r) => r.status === "new").length,
      label: "new enquiries not contacted",
    },
    {
      count: rows.filter(
        (r) =>
          r.next_action_date && r.next_action_date <= today && !FUNNEL_DONE.includes(r.status),
      ).length,
      label: "follow-ups due today",
    },
    {
      count: rows.filter((r) => r.status === "assessment_booked").length,
      label: "assessments awaiting outcome",
    },
  ].filter((item) => item.count > 0);

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold">This month</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {monthCards.map((card) => (
          <div key={card.label} className="border border-neutral-300 bg-white p-4">
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-sm text-neutral-600">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div>
          <h3 className="font-semibold">Enquiries by area</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {(["Britain", "Global", "Other"] as const).map((area) => (
              <li key={area} className="flex justify-between border-b border-neutral-200 py-1">
                <span>{area}</span>
                <span className="font-medium">{areas[area] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Top sources</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {topSources.map(([label, count]) => (
              <li key={label} className="flex justify-between border-b border-neutral-200 py-1">
                <span>{label}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
            {topSources.length === 0 && <li className="text-neutral-500">No sources recorded yet.</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Needs attention</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {attention.map((item) => (
              <li key={item.label} className="border-b border-neutral-200 py-1">
                <Link href="/admin/leads" className="hover:underline">
                  <span className="font-medium">{item.count}</span> {item.label}
                </Link>
              </li>
            ))}
            {attention.length === 0 && <li className="text-neutral-500">All clear.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const profile = await requireProfile();
  const { denied } = await searchParams;
  const data = await getData();

  const statsRows = hasPerm(profile, "analytics.view") ? await data.leads.statsRows() : null;

  const quickCards: { href: string; label: string; value: number; hint: string }[] = [];
  if (hasPerm(profile, "reviews.moderate")) {
    quickCards.push({
      href: "/admin/reviews",
      label: "Reviews awaiting moderation",
      value: await data.reviews.countByStatus("pending"),
      hint: "Approve before anything is published",
    });
  }
  if (hasPerm(profile, "posts.edit")) {
    quickCards.push({
      href: "/admin/posts",
      label: "Draft Insights posts",
      value: await data.posts.countByStatus("draft"),
      hint: "SEO blog content",
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome{profile.full_name ? `, ${profile.full_name}` : ""}
      </h1>
      {denied && (
        <Notice tone="error">
          You do not have access to that section. Ask an administrator if you need it.
        </Notice>
      )}
      <p className="mt-1 text-sm text-neutral-500">
        {/* Custom roles have no built-in description — show the slug as the label. */}
        {ROLE_DESCRIPTIONS[profile.role as keyof typeof ROLE_DESCRIPTIONS] ?? profile.role}
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        You can:{" "}
        {profile.permissions.length
          ? profile.permissions.map((perm) => PERMISSION_LABELS[perm].toLowerCase()).join(" · ")
          : "nothing yet — ask an administrator for access"}
      </p>

      {statsRows && <Dashboard rows={statsRows} />}

      {quickCards.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickCards.map((card) => (
            <Link key={card.href} href={card.href} className="border border-neutral-300 bg-white p-4">
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="mt-1 font-medium">{card.label}</p>
              <p className="mt-1 text-sm text-neutral-500">{card.hint}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { PERMISSION_LABELS, ROLE_DESCRIPTIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const profile = await requireProfile();
  const { denied } = await searchParams;
  const data = await getData();

  const cards: { href: string; label: string; value: number; hint: string }[] = [];
  if (hasPerm(profile, "leads.view")) {
    cards.push({
      href: "/admin/leads",
      label: "New enquiries",
      value: await data.leads.countByStatus("new"),
      hint: "Book Assessment + Contact submissions",
    });
  }
  if (hasPerm(profile, "reviews.moderate")) {
    cards.push({
      href: "/admin/reviews",
      label: "Reviews awaiting moderation",
      value: await data.reviews.countByStatus("pending"),
      hint: "Approve before anything is published",
    });
  }
  if (hasPerm(profile, "posts.edit")) {
    cards.push({
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
        <p className="mt-3 border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
          You do not have access to that section. Ask an administrator if you need it.
        </p>
      )}
      <p className="mt-1 text-sm text-neutral-500">{ROLE_DESCRIPTIONS[profile.role]}</p>
      <p className="mt-1 text-sm text-neutral-500">
        You can:{" "}
        {profile.permissions.length
          ? profile.permissions.map((perm) => PERMISSION_LABELS[perm].toLowerCase()).join(" · ")
          : "nothing yet — ask an administrator for access"}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="border border-neutral-300 bg-white p-4">
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="mt-1 font-medium">{card.label}</p>
            <p className="mt-1 text-sm text-neutral-500">{card.hint}</p>
          </Link>
        ))}
        {cards.length === 0 && (
          <p className="text-neutral-600">
            Your account has no module permissions yet — an administrator can grant them in Team.
          </p>
        )}
      </div>
    </div>
  );
}

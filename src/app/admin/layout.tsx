import { Suspense } from "react";
import { brandFont } from "@/lib/fonts";
import type { Metadata } from "next";
import Link from "next/link";
import "../globals.css";
import { ScrollToTop } from "@/components/ScrollToTop";
import { getCurrentProfile, hasPerm } from "@/lib/auth-guard";
import type { Permission } from "@/lib/permissions";
import { signOut } from "./actions";

// Internal tool: English UI, never indexed. The public site's locale layouts
// do not apply here.
export const metadata: Metadata = {
  title: "Mug.Up Admin",
  robots: { index: false, follow: false },
};

const NAV: { href: string; label: string; perm?: Permission }[] = [
  { href: "/admin/leads", label: "Enquiries", perm: "leads.view" },
  { href: "/admin/reviews", label: "Reviews", perm: "reviews.moderate" },
  { href: "/admin/posts", label: "Insights", perm: "posts.edit" },
  { href: "/admin/users", label: "Team", perm: "users.manage" },
  // The notification centre is personal — every team member has one.
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/activity", label: "Activity", perm: "users.manage" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  return (
    <html lang="en" className={brandFont.variable}>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <header className="border-b border-neutral-300 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <Link href="/admin" className="mr-auto font-bold">
              Mug.Up Admin
            </Link>
            {profile && (
              <>
                <nav aria-label="Admin" className="flex flex-wrap gap-3 text-sm">
                  {NAV.filter((item) => !item.perm || hasPerm(profile, item.perm)).map((item) => (
                    <Link key={item.href} href={item.href} className="hover:underline">
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <Link href="/admin/account" className="text-sm text-neutral-600 hover:underline">
                  Settings <span className="text-neutral-400">({profile.email})</span>
                </Link>
                <form action={signOut}>
                  <button type="submit" className="text-sm underline">
                    Sign out
                  </button>
                </form>
              </>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

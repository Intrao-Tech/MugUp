import { Suspense } from "react";
import { fontVariables } from "@/lib/fonts";
import type { Metadata } from "next";
import Link from "next/link";
import "../globals.css";
import { NavLink } from "@/components/NavLink";
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
    <html lang="en" className={fontVariables}>
      <body className="min-h-screen bg-canvas text-body antialiased">
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
          <div className="mx-auto flex min-h-16 max-w-5xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-2">
            <Link href="/admin" className="mr-auto flex items-center gap-2 py-1">
              <img
                src="/images/logo-nav.png"
                alt=""
                width={640}
                height={562}
                className="h-11 w-auto"
              />
              <span className="font-display text-lg text-ink">Admin</span>
            </Link>
            {profile && (
              <>
                <nav aria-label="Admin" className="flex flex-wrap items-center">
                  {NAV.filter((item) => !item.perm || hasPerm(profile, item.perm)).map((item) => (
                    <NavLink key={item.href} href={item.href}>
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <Link
                  href="/admin/account"
                  className="px-1 text-sm font-semibold text-muted transition-colors hover:text-ink"
                >
                  Settings <span className="font-normal">({profile.email})</span>
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-sm text-primary underline underline-offset-4 hover:text-primary-hover"
                  >
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

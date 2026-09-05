import Link from "next/link";
import {
  NOTIFICATION_EVENT_LABELS,
  NOTIFICATION_EVENT_PERMISSION,
  type NotificationEvent,
} from "@/lib/db-types";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { markAllNotificationsRead, openNotification } from "../actions";
import { BTN_SECONDARY, H1, H2 } from "../ui";

export const dynamic = "force-dynamic";

/** Entries without a stored deep link (or with a future unknown event) still
 *  open the right module page. */
const MODULE_FALLBACK: Record<NotificationEvent, string> = {
  lead_booking: "/admin/leads",
  lead_contact: "/admin/leads",
  lead_partnership: "/admin/leads",
  review_new: "/admin/reviews",
  post_published: "/admin/posts",
};

export default async function NotificationsPage() {
  const me = await requireProfile();
  const canManage = hasPerm(me, "users.manage");

  const data = await getData();
  // Members inherit their ROLE's event set (configured in Team → Roles);
  // additionally an event only reaches someone who can OPEN its target —
  // the member's own permission flags are the final filter.
  const myEvents = (await data.notifications.eventsForRole(me.role)).filter((event) =>
    hasPerm(me, NOTIFICATION_EVENT_PERMISSION[event]),
  );
  const feed = await data.notifications.feed(myEvents, 100);
  const readIds = new Set(await data.notifications.readIds(me.id, feed.map((f) => f.id)));
  const unread = feed.filter((item) => !readIds.has(item.id));

  return (
    <div className="max-w-2xl">
      <h1 className={H1}>
        Notifications
        {unread.length > 0 && (
          <span className="ml-2 inline-block rounded-sm border border-ink bg-ink px-2 py-0.5 align-middle font-sans text-sm font-bold text-surface">
            {unread.length} new
          </span>
        )}
      </h1>
      <p className="mt-1 text-base text-body">
        Website events for your role land here. Click an entry to open it; it counts as read
        only once you have.
        {canManage && (
          <>
            {" "}
            Which role receives what is configured in{" "}
            <Link
              href="/admin/users"
              className="text-primary underline underline-offset-4 hover:text-primary-hover"
            >
              Team → Roles
            </Link>
            .
          </>
        )}
      </p>

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={H2}>Latest</h2>
          {unread.length > 0 && (
            <form action={markAllNotificationsRead}>
              {unread.map((item) => (
                <input key={item.id} type="hidden" name="ids" value={item.id} />
              ))}
              <button type="submit" className={BTN_SECONDARY}>
                Mark all as read
              </button>
            </form>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {feed.map((item) => {
            const isNew = !readIds.has(item.id);
            return (
              <form key={item.id} action={openNotification}>
                <input type="hidden" name="id" value={item.id} />
                <input
                  type="hidden"
                  name="href"
                  value={item.href || MODULE_FALLBACK[item.event] || "/admin"}
                />
                {/* The whole card is the button: opens the event and only
                    then marks this entry as read. */}
                <button
                  type="submit"
                  className={`block w-full rounded-card border p-3 text-left transition-colors hover:border-ink ${
                    isNew ? "border-ink bg-surface-alt" : "border-line bg-surface"
                  }`}
                >
                  <span className="flex flex-wrap items-baseline gap-2 text-xs text-muted">
                    {isNew && (
                      <span className="rounded-sm bg-ink px-1.5 py-0.5 font-bold text-surface">NEW</span>
                    )}
                    <span>{NOTIFICATION_EVENT_LABELS[item.event] ?? item.event}</span>
                    <span>
                      {new Date(item.created_at).toLocaleString("en-GB", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    <span className="ml-auto text-primary underline underline-offset-4">open →</span>
                  </span>
                  <span className="mt-1 block font-bold text-ink">{item.title}</span>
                  {item.detail && (
                    <span className="block text-sm text-body">{item.detail}</span>
                  )}
                </button>
              </form>
            );
          })}
          {feed.length === 0 && (
            <p className="text-sm text-muted">
              {myEvents.length === 0
                ? "Your role does not receive any notifications — an administrator configures which role gets what in Team → Roles."
                : "Nothing yet — new events will appear here."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import {
  NOTIFICATION_EVENT_LABELS,
  NOTIFICATION_EVENT_PERMISSION,
  type NotificationEvent,
} from "@/lib/db-types";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import { markAllNotificationsRead, openNotification } from "../actions";

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
      <h1 className="text-2xl font-bold">
        Notifications
        {unread.length > 0 && (
          <span className="ml-2 align-middle border border-neutral-900 bg-neutral-900 px-2 py-0.5 text-sm font-medium text-white">
            {unread.length} new
          </span>
        )}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Website events for your role land here. Click an entry to open it; it counts as read
        only once you have.
        {canManage && (
          <>
            {" "}
            Which role receives what is configured in{" "}
            <Link href="/admin/users" className="underline">
              Team → Roles
            </Link>
            .
          </>
        )}
      </p>

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Latest</h2>
          {unread.length > 0 && (
            <form action={markAllNotificationsRead}>
              {unread.map((item) => (
                <input key={item.id} type="hidden" name="ids" value={item.id} />
              ))}
              <button type="submit" className="border border-neutral-400 px-3 py-1 text-sm hover:border-neutral-900">
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
                  className={`block w-full border bg-white p-3 text-left hover:border-neutral-900 ${
                    isNew ? "border-neutral-900" : "border-neutral-200"
                  }`}
                >
                  <span className="flex flex-wrap items-baseline gap-2 text-xs text-neutral-500">
                    {isNew && (
                      <span className="bg-neutral-900 px-1.5 py-0.5 font-medium text-white">NEW</span>
                    )}
                    <span>{NOTIFICATION_EVENT_LABELS[item.event] ?? item.event}</span>
                    <span>
                      {new Date(item.created_at).toLocaleString("en-GB", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    <span className="ml-auto underline">open →</span>
                  </span>
                  <span className="mt-1 block font-medium">{item.title}</span>
                  {item.detail && (
                    <span className="block text-sm text-neutral-600">{item.detail}</span>
                  )}
                </button>
              </form>
            );
          })}
          {feed.length === 0 && (
            <p className="text-sm text-neutral-500">
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

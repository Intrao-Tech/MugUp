import {
  NOTIFICATION_EVENT_LABELS,
  NOTIFICATION_EVENTS,
  type NotificationEvent,
} from "@/lib/db-types";
import { hasPerm, requireProfile } from "@/lib/auth-guard";
import { getData } from "@/lib/data";
import {
  markNotificationsSeen,
  saveMemberNotificationEvents,
  saveOwnNotificationEvents,
} from "../actions";
import { Notice } from "../ui";

export const dynamic = "force-dynamic";

function EventCheckboxes({ checked }: { checked: NotificationEvent[] }) {
  return (
    <fieldset className="space-y-1 text-sm">
      <legend className="sr-only">Notification types</legend>
      {NOTIFICATION_EVENTS.map((event) => (
        <label key={event} className="flex items-center gap-2">
          <input
            type="checkbox"
            name="events"
            value={event}
            defaultChecked={checked.includes(event)}
          />
          {NOTIFICATION_EVENT_LABELS[event]}
        </label>
      ))}
    </fieldset>
  );
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const me = await requireProfile();
  const { error, saved } = await searchParams;
  const canManage = hasPerm(me, "users.manage");

  const data = await getData();
  const mySubscription = await data.notifications.getSubscription(me.id);
  const myEvents = mySubscription?.events ?? [];
  const lastSeen = mySubscription?.last_seen ?? new Date(0).toISOString();
  const feed = await data.notifications.feed(myEvents, 100);
  const unseen = feed.filter((item) => item.created_at > lastSeen).length;

  const [profiles, subscriptions] = canManage
    ? await Promise.all([data.team.listProfiles(), data.notifications.listSubscriptions()])
    : [[], []];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">
        Notifications
        {unseen > 0 && (
          <span className="ml-2 align-middle border border-neutral-900 bg-neutral-900 px-2 py-0.5 text-sm font-medium text-white">
            {unseen} new
          </span>
        )}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Website events land here — you see the types ticked in “What I get notified about”.
      </p>
      {saved && <Notice tone="success">Saved.</Notice>}
      {error && (
        <Notice tone="error">
          {error === "input" ? "Something was wrong with the input." : "Could not save — try again."}
        </Notice>
      )}

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Latest</h2>
          {unseen > 0 && (
            <form action={markNotificationsSeen}>
              <button type="submit" className="border border-neutral-400 px-3 py-1 text-sm hover:border-neutral-900">
                Mark all as read
              </button>
            </form>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {feed.map((item) => {
            const isNew = item.created_at > lastSeen;
            return (
              <article
                key={item.id}
                className={`border bg-white p-3 ${isNew ? "border-neutral-900" : "border-neutral-200"}`}
              >
                <p className="flex flex-wrap items-baseline gap-2 text-xs text-neutral-500">
                  {isNew && <span className="bg-neutral-900 px-1.5 py-0.5 font-medium text-white">NEW</span>}
                  <span>{NOTIFICATION_EVENT_LABELS[item.event] ?? item.event}</span>
                  <span>
                    {new Date(item.created_at).toLocaleString("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </p>
                <p className="mt-1 font-medium">{item.title}</p>
                {item.detail && <p className="text-sm text-neutral-600">{item.detail}</p>}
              </article>
            );
          })}
          {feed.length === 0 && (
            <p className="text-sm text-neutral-500">
              {myEvents.length === 0
                ? "You are not subscribed to any notification types yet — tick some below."
                : "Nothing yet — new events will appear here."}
            </p>
          )}
        </div>
      </section>

      <section className="mt-8 border border-neutral-300 bg-white p-4">
        <h2 className="text-lg font-semibold">What I get notified about</h2>
        <form action={saveOwnNotificationEvents} className="mt-3 space-y-3">
          <EventCheckboxes checked={myEvents} />
          <button type="submit" className="border border-neutral-900 px-4 py-2 font-medium">
            Save
          </button>
        </form>
      </section>

      {canManage && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Team subscriptions</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Configure what each team member sees in their Notifications section.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {profiles.map((profile) => {
              const sub = subscriptions.find((s) => s.profile_id === profile.id);
              return (
                <form
                  key={profile.id}
                  action={saveMemberNotificationEvents}
                  className="space-y-2 border border-neutral-300 bg-white p-4"
                >
                  <input type="hidden" name="profile_id" value={profile.id} />
                  <h3 className="font-semibold">
                    {profile.full_name || profile.email}
                    {profile.id === me.id && (
                      <span className="ml-2 text-xs font-normal text-neutral-500">you</span>
                    )}
                  </h3>
                  <EventCheckboxes checked={sub?.events ?? []} />
                  <button type="submit" className="border border-neutral-900 px-3 py-1 text-sm">
                    Save
                  </button>
                </form>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

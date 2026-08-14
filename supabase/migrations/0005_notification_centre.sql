-- In-admin notification centre + admin-editable settings.
--
-- Feedback pivot: notifications are shown INSIDE the admin panel (feed +
-- per-member subscriptions), not sent by email — email remains only as an
-- optional env-gated copy for enquiries/reviews (src/lib/notify.ts).
-- The email-routing table from 0004 is superseded and dropped.

drop table if exists public.notification_recipients;

-- ---------------------------------------------------------------------------
-- Global admin settings (key/value). First key: session_timeout_minutes —
-- idle time before an admin session is signed out (middleware enforces it).
-- ---------------------------------------------------------------------------
create table public.admin_settings (
  key text primary key,
  value text not null
);

insert into public.admin_settings (key, value) values ('session_timeout_minutes', '15');

alter table public.admin_settings enable row level security;

create policy "settings: team read"
on public.admin_settings for select
to authenticated
using (true);

create policy "settings: managers write"
on public.admin_settings for all
using (public.has_perm('users.manage'))
with check (public.has_perm('users.manage'));

-- ---------------------------------------------------------------------------
-- Notification feed. Rows are written by the app with the service key only;
-- every signed-in team member may read (the UI filters to their events).
-- Event slugs live in src/lib/db-types.ts.
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  title text not null,
  detail text not null default ''
);

create index notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

create policy "notifications: team read"
on public.notifications for select
to authenticated
using (true);
-- No insert/update/delete policies: writes happen via the service role.

-- ---------------------------------------------------------------------------
-- Who sees which events. A member manages their own row; team managers
-- manage everyone's. last_seen powers the NEW badge.
-- ---------------------------------------------------------------------------
create table public.notification_subscriptions (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  events text[] not null default '{}',
  last_seen timestamptz not null default now()
);

alter table public.notification_subscriptions enable row level security;

create policy "subscriptions: own read"
on public.notification_subscriptions for select
using (profile_id = auth.uid());

create policy "subscriptions: own insert"
on public.notification_subscriptions for insert
with check (profile_id = auth.uid());

create policy "subscriptions: own update"
on public.notification_subscriptions for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "subscriptions: managers all"
on public.notification_subscriptions for all
using (public.has_perm('users.manage'))
with check (public.has_perm('users.manage'));

-- Table-level grants (plain-SQL application needs them; RLS narrows rows).
grant select, insert, update on public.admin_settings to authenticated;
grant select, insert, update, delete on public.admin_settings to service_role;
grant select on public.notifications to authenticated;
grant select, insert, update, delete on public.notifications to service_role;
grant select, insert, update, delete on public.notification_subscriptions to authenticated, service_role;

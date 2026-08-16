-- Configurable notification routing: which inbox receives which event.
-- Managed on /admin/notifications (users.manage). Read at send time with the
-- service key (public form actions have no user session). Known event slugs
-- live in src/lib/db-types.ts (lead_booking / lead_contact /
-- lead_partnership / review_new); unknown slugs are filtered in the actions.

create table public.notification_recipients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  events text[] not null default '{}'
);

alter table public.notification_recipients enable row level security;

create policy "notifications: managers all"
on public.notification_recipients for all
using (public.has_perm('users.manage'))
with check (public.has_perm('users.manage'));

grant select, insert, update, delete
  on public.notification_recipients
  to authenticated, service_role;

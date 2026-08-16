-- Notification routing moves from per-member subscriptions to PER ROLE:
-- an administrator decides which role receives which events; members simply
-- inherit their role's set and cannot configure it themselves.
-- (Per-entry read state in notification_reads is unchanged.)

drop table if exists public.notification_subscriptions;

create table public.notification_role_events (
  role_slug text primary key,
  events text[] not null default '{}'
);

alter table public.notification_role_events enable row level security;

-- Everyone needs to read their own role's set; only team managers write.
create policy "role events: team read"
on public.notification_role_events for select
to authenticated
using (true);

create policy "role events: managers write"
on public.notification_role_events for all
using (public.has_perm('users.manage'))
with check (public.has_perm('users.manage'));

grant select, insert, update, delete on public.notification_role_events to authenticated, service_role;

-- Sensible defaults for the built-in roles (editable in the admin panel).
insert into public.notification_role_events (role_slug, events) values
  ('admin', '{lead_booking,lead_contact,lead_partnership,review_new,post_published}'),
  ('manager', '{lead_booking,lead_contact,lead_partnership,review_new}'),
  ('editor', '{review_new,post_published}');

-- 1) Clickable notifications: each feed entry carries the admin URL it opens.
alter table public.notifications add column href text not null default '';

-- 2) Per-item read state (replaces the coarse last_seen approach): an entry
--    counts as read for a member only once THEY opened it (or hit
--    "mark all as read").
create table public.notification_reads (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  notification_id uuid not null references public.notifications (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (profile_id, notification_id)
);

alter table public.notification_reads enable row level security;

create policy "notification reads: own all"
on public.notification_reads for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

grant select, insert, delete on public.notification_reads to authenticated;
grant select, insert, update, delete on public.notification_reads to service_role;

-- 3) First-login password change: invited/reset accounts get a generated
--    temporary password and MUST set their own before using the panel
--    (enforced by the middleware; cleared on successful password change).
alter table public.profiles add column must_change_password boolean not null default false;

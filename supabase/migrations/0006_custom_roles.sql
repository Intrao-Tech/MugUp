-- Custom roles: admins can define their own named permission presets next to
-- the built-in admin/manager/editor. A role stays a display preset — access
-- is always enforced by the per-profile permission flags (has_perm).

-- profiles.role was locked to the three built-ins; custom role slugs now
-- live there too, so the check goes away.
alter table public.profiles drop constraint profiles_role_check;

create table public.custom_roles (
  slug text primary key,
  name text not null unique,
  permissions text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.custom_roles enable row level security;

create policy "roles: team read"
on public.custom_roles for select
to authenticated
using (true);

create policy "roles: managers write"
on public.custom_roles for all
using (public.has_perm('users.manage'))
with check (public.has_perm('users.manage'));

grant select, insert, update, delete on public.custom_roles to authenticated, service_role;

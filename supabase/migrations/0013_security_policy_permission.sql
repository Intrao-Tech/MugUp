-- Separate permission for the team-wide two-factor policy (client request,
-- 5 Sep 2026): "Require two-factor authentication for everyone" is no longer
-- part of users.manage but its own flag, security.policy, so it can be
-- granted (or withheld) independently of account management.
--
-- Same pattern as 0011: update the built-in role row, then UNION the flag
-- onto every admin profile (per-user fine-tuning is preserved).

update public.roles
set permissions = (
  select array_agg(distinct p)
  from unnest(permissions || '{security.policy}'::text[]) as p
)
where slug = 'admin';

update public.profiles
set permissions = (
  select array_agg(distinct p)
  from unnest(permissions || '{security.policy}'::text[]) as p
)
where role = 'admin';

-- admin_settings writes: the two-factor policy key needs security.policy,
-- every other key keeps needing users.manage (e.g. the inactivity timeout).
drop policy "settings: managers write" on public.admin_settings;

create policy "settings: managers write"
on public.admin_settings
for all
to authenticated
using (
  case
    when key = 'mfa_required' then public.has_perm('security.policy')
    else public.has_perm('users.manage')
  end
)
with check (
  case
    when key = 'mfa_required' then public.has_perm('security.policy')
    else public.has_perm('users.manage')
  end
);

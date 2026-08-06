-- Promote the first account to full admin.
-- 1. Supabase dashboard -> Authentication -> Add user (email + password,
--    tick "Auto confirm user"). The on_auth_user_created trigger creates an
--    empty profile automatically.
-- 2. Replace the email below and run this in the SQL editor.

update public.profiles
set
  full_name   = 'Admin',
  role        = 'admin',
  permissions = array[
    'leads.view', 'leads.manage', 'files.view',
    'reviews.moderate', 'posts.edit', 'posts.publish', 'users.manage'
  ]
where email = 'admin@example.com';

-- Verify:
-- select email, role, permissions from public.profiles;

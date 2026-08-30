-- Client request (30 Aug 2026): the manager role also gets the editor's
-- capabilities — writing/publishing Insights and moderating reviews.
-- Mirrors a role-editor save: update the role row, then apply to every
-- member with the role. Profiles get a UNION (not a replace) so per-user
-- fine-tuning that added extra flags is preserved.

update public.roles
set
  permissions = (
    select array_agg(distinct p)
    from unnest(permissions || '{posts.edit,posts.publish,reviews.moderate}'::text[]) as p
  ),
  name = 'Manager — enquiries, personal data, exports, the dashboard, articles and reviews'
where slug = 'manager';

update public.profiles
set permissions = (
  select array_agg(distinct p)
  from unnest(permissions || '{posts.edit,posts.publish,reviews.moderate}'::text[]) as p
)
where role = 'manager';

-- 0010 removed review_new from the manager's notification defaults only
-- because the role lacked reviews.moderate; the permission now exists, so
-- restore the originally intended routing.
update public.notification_role_events
set events = array_append(events, 'review_new')
where role_slug = 'manager' and not ('review_new' = any (events));

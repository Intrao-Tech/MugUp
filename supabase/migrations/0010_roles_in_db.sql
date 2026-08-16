-- One role editor for EVERYTHING: the built-in roles move into the database
-- so admin/manager/editor are editable exactly like custom ones (name stays
-- fixed for built-ins; permissions and notification events are editable and
-- saving applies to every member with the role). The app guards the
-- footguns: the admin role can never lose users.manage, built-ins cannot be
-- deleted, and a notification event requires the matching permission.

alter table public.custom_roles rename to roles;

alter table public.roles add column built_in boolean not null default false;

insert into public.roles (slug, name, permissions, built_in) values
  (
    'admin',
    'Admin — full access to everything, including the team',
    '{leads.view,leads.manage,leads.export,leads.pii,posts.edit,posts.publish,reviews.moderate,analytics.view,users.manage}',
    true
  ),
  (
    'manager',
    'Manager — enquiries, personal data, exports and the dashboard',
    '{leads.view,leads.manage,leads.export,leads.pii,analytics.view}',
    true
  ),
  (
    'editor',
    'Editor — articles and reviews, no access to enquiries',
    '{posts.edit,posts.publish,reviews.moderate}',
    true
  );

-- The manager role had review_new routed to it but no reviews.moderate
-- permission — clicking the notification hit "access denied". Events now
-- require the matching permission; fix the seeded data accordingly.
update public.notification_role_events
set events = array_remove(events, 'review_new')
where role_slug = 'manager';

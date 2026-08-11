-- MugUp admin panel — CRM upgrade (client feedback round, Aug 2026):
--   * Enquiries: pipeline statuses, lost reason, lead source, owner,
--     next action + due date, programme, partnership form type.
--   * Reviews: programme, audience, featured flag; public read of approved.
--   * Posts: author, featured image + alt, CTA, scheduled publishing.
--   * Categories: renamed labels + two new categories.
--   * Permissions: files.view -> leads.pii; new leads.export / analytics.view.
--   * Activity log table.

-- ---------------------------------------------------------------------------
-- Leads: CRM fields
-- ---------------------------------------------------------------------------
alter table public.leads
  add column programme        text not null default '',
  add column source           text,
  add column owner_id         uuid references public.profiles (id) on delete set null,
  add column next_action      text not null default '',
  add column next_action_date date,
  add column lost_reason      text,
  add column lost_reason_note text not null default '';

alter table public.leads
  add constraint leads_source_check check (source in (
    'google_search', 'instagram', 'facebook', 'tiktok', 'telegram', 'referral',
    'event', 'flyer', 'school', 'partner', 'facebook_groups', 'other'
  ));

alter table public.leads
  add constraint leads_lost_reason_check check (lost_reason in (
    'price', 'timing', 'no_suitable_programme', 'no_response',
    'chose_another_provider', 'location', 'not_ready_yet', 'other'
  ));

-- Pipeline statuses replace the original five; existing rows are mapped
-- conservatively (in_progress -> contacted, converted -> enrolled).
alter table public.leads drop constraint leads_status_check;
update public.leads set status = 'contacted' where status = 'in_progress';
update public.leads set status = 'enrolled'  where status = 'converted';
alter table public.leads
  add constraint leads_status_check check (status in (
    'new', 'contacted', 'assessment_booked', 'assessment_completed',
    'offer', 'programme_recommended', 'enrolled', 'closed', 'lost'
  ));

-- Third enquiry type: partnership (Contact form with the Partnership subject,
-- or a future dedicated form).
alter table public.leads drop constraint leads_form_check;
alter table public.leads
  add constraint leads_form_check check (form in ('booking', 'contact', 'partnership'));

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ---------------------------------------------------------------------------
-- Reviews: targeting fields + featured flag; approved reviews become public
-- ---------------------------------------------------------------------------
alter table public.reviews
  add column programme text not null default '',
  add column audience  text,
  add column featured  boolean not null default false;

alter table public.reviews
  add constraint reviews_audience_check check (audience in (
    'parent', 'adult_learner', 'student', 'corporate_client'
  ));

-- The site shows approved reviews (e.g. featured testimonials on the
-- homepage). Only approved rows are ever visible to anonymous visitors.
create policy "reviews: public read approved"
  on public.reviews for select
  to anon
  using (status = 'approved');

grant select on public.reviews to anon;

-- ---------------------------------------------------------------------------
-- Posts: author, featured image, CTA, scheduled publishing
-- ---------------------------------------------------------------------------
alter table public.posts
  add column author         text not null default '',
  add column hero_image_url text,
  add column hero_image_alt text not null default '',
  add column cta_label      text not null default '',
  add column cta_url        text not null default '';

alter table public.posts drop constraint posts_status_check;
alter table public.posts
  add constraint posts_status_check check (status in ('draft', 'scheduled', 'published'));

-- A scheduled post goes live by itself once its publication time passes
-- (public pages re-render via ISR, so no cron is needed).
drop policy "posts: public read published" on public.posts;
create policy "posts: public read live"
  on public.posts for select
  to anon
  using (
    status = 'published'
    or (status = 'scheduled' and published_at is not null and published_at <= now())
  );

-- ---------------------------------------------------------------------------
-- Insights categories: client's updated list. Existing slugs are kept (they
-- are stable anchors on the public site); only labels change.
-- ---------------------------------------------------------------------------
update public.post_categories set label_en = 'British Education',
  label_ua = 'Британська освіта', sort = 10 where slug = 'uk-education';
update public.post_categories set label_en = 'Languages & Learning',
  label_ua = 'Мови та навчання', sort = 20 where slug = 'language-learning';
update public.post_categories set label_en = 'Qualifications & Exams',
  label_ua = 'Кваліфікації та іспити', sort = 30 where slug = 'english-qualifications';
update public.post_categories set label_en = 'Career & Workplace',
  label_ua = 'Кар''єра та робота', sort = 40 where slug = 'career-workplace';
update public.post_categories set label_en = 'Life & Integration',
  label_ua = 'Життя та інтеграція', sort = 50 where slug = 'integration-uk';

insert into public.post_categories (slug, label_en, label_ua, sort) values
  ('international-baccalaureate', 'International Baccalaureate (IB)', 'Міжнародний бакалаврат (IB)', 60),
  ('boarding-schools',            'Boarding Schools',                 'Школи-пансіони',              70)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Permissions: files.view folds into leads.pii (view learner personal data);
-- new leads.export and analytics.view. Admins get the full set.
-- ---------------------------------------------------------------------------
update public.profiles
  set permissions = array_replace(permissions, 'files.view', 'leads.pii');

update public.profiles
  set permissions = permissions || '{leads.export,analytics.view}'
  where 'leads.manage' = any (permissions)
    and not ('leads.export' = any (permissions));

update public.profiles
  set permissions = '{leads.view,leads.manage,leads.export,leads.pii,reviews.moderate,posts.edit,posts.publish,analytics.view,users.manage}'
  where role = 'admin';

-- Attachments now require the personal-data permission.
drop policy "lead files: view" on storage.objects;
create policy "lead files: view"
  on storage.objects for select
  using (bucket_id = 'lead-files' and public.has_perm('leads.pii'));

-- Enquiry viewers need team names for the Owner field (assign / display).
create policy "profiles: enquiry viewers read"
  on public.profiles for select
  using (public.has_perm('leads.view'));

-- ---------------------------------------------------------------------------
-- Activity log (enquiry changes, exports, file access, permission changes,
-- publishing). Rows are written by the server via the service role only;
-- team accounts can never insert, update or delete audit entries.
-- ---------------------------------------------------------------------------
create table public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  actor_id    uuid references public.profiles (id) on delete set null,
  -- Denormalised so entries survive account deletion.
  actor_email text not null default '',
  action      text not null,
  entity      text not null default '',
  entity_id   text not null default '',
  detail      text not null default ''
);

alter table public.activity_log enable row level security;

create policy "activity: user managers read"
  on public.activity_log for select
  using (public.has_perm('users.manage'));

create index activity_log_created_at_idx on public.activity_log (created_at desc);

grant select on public.activity_log to authenticated;
grant select, insert on public.activity_log to service_role;

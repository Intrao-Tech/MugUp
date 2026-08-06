-- MugUp admin panel — initial schema.
-- Apply in the Supabase SQL editor (or `supabase db push`).
-- Security model:
--   * RLS is enabled on every table; there are NO anonymous policies.
--   * Public form submissions are inserted by the server using the service
--     role key, so the tables are never writable from the browser.
--   * Team access is driven by permission flags on profiles (see has_perm).

-- ---------------------------------------------------------------------------
-- Profiles (one row per team account)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  -- Display preset; enforcement uses the permissions array below.
  role        text not null default 'editor' check (role in ('admin', 'manager', 'editor')),
  permissions text[] not null default '{}',
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create an (empty-permission) profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Permission check used by all policies.
create or replace function public.has_perm(p text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and p = any (permissions)
  );
$$;

create policy "profiles: read own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: user managers read all"
  on public.profiles for select
  using (public.has_perm('users.manage'));

create policy "profiles: user managers update"
  on public.profiles for update
  using (public.has_perm('users.manage'))
  with check (public.has_perm('users.manage'));

-- Inserts/deletes happen via the service role (account creation flow) only.

-- ---------------------------------------------------------------------------
-- Leads (Book Assessment + Contact submissions)
-- ---------------------------------------------------------------------------
create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  form             text not null check (form in ('booking', 'contact')),
  locale           text not null default 'en' check (locale in ('en', 'ua')),
  full_name        text not null,
  email            text not null,
  phone            text,
  who_for          text,
  pathway_interest text,
  preferred_format text,
  subject          text,
  message          text,
  file_path        text,
  status           text not null default 'new'
                   check (status in ('new', 'contacted', 'in_progress', 'converted', 'closed')),
  notes            text not null default ''
);

alter table public.leads enable row level security;

create policy "leads: view"
  on public.leads for select
  using (public.has_perm('leads.view'));

create policy "leads: manage"
  on public.leads for update
  using (public.has_perm('leads.manage'))
  with check (public.has_perm('leads.manage'));

-- ---------------------------------------------------------------------------
-- Reviews (moderated before any future publication on the site)
-- ---------------------------------------------------------------------------
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  author_name  text not null,
  author_tag   text not null default '',
  quote        text not null,
  -- website = submitted through the public form; google/other = imported
  -- manually by the team from external review platforms.
  source       text not null default 'website'
               check (source in ('website', 'google', 'other')),
  rating       integer check (rating between 1 and 5),
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected')),
  moderated_by uuid references public.profiles (id),
  moderated_at timestamptz
);

alter table public.reviews enable row level security;

create policy "reviews: moderators all"
  on public.reviews for all
  using (public.has_perm('reviews.moderate'))
  with check (public.has_perm('reviews.moderate'));

-- ---------------------------------------------------------------------------
-- Insights categories (admin-managed; the TZ's five are seeded below)
-- ---------------------------------------------------------------------------
create table public.post_categories (
  slug       text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label_en   text not null,
  label_ua   text not null,
  sort       integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.post_categories enable row level security;

create policy "categories: public read"
  on public.post_categories for select
  using (true);

create policy "categories: editors manage"
  on public.post_categories for all
  using (public.has_perm('posts.edit'))
  with check (public.has_perm('posts.edit'));

insert into public.post_categories (slug, label_en, label_ua, sort) values
  ('uk-education',           'UK Education',           'Освіта у Великій Британії', 10),
  ('english-qualifications', 'English Qualifications', 'Кваліфікації з англійської', 20),
  ('career-workplace',       'Career & Workplace',     'Кар''єра та робота',         30),
  ('integration-uk',         'Integration in the UK',  'Інтеграція у Британії',      40),
  ('language-learning',      'Language Learning',      'Вивчення мов',               50);

-- ---------------------------------------------------------------------------
-- Insights posts (SEO blog; drafts + published)
-- ---------------------------------------------------------------------------
create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  slug         text not null,
  locale       text not null default 'en' check (locale in ('en', 'ua')),
  category     text not null references public.post_categories (slug)
               on update cascade on delete restrict,
  title        text not null,
  description  text not null default '',
  body_md      text not null default '',
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by   uuid references public.profiles (id),
  unique (slug, locale)
);

alter table public.posts enable row level security;

create policy "posts: editors read"
  on public.posts for select
  using (public.has_perm('posts.edit') or public.has_perm('posts.publish'));

create policy "posts: editors write"
  on public.posts for insert
  with check (public.has_perm('posts.edit'));

create policy "posts: editors update"
  on public.posts for update
  using (public.has_perm('posts.edit'))
  with check (public.has_perm('posts.edit'));

create policy "posts: editors delete"
  on public.posts for delete
  using (public.has_perm('posts.edit'));

-- The public site (anonymous visitors) reads published posts only.
create policy "posts: public read published"
  on public.posts for select
  to anon
  using (status = 'published');

-- Publishing (status -> 'published') additionally requires posts.publish;
-- enforced in the application layer on top of these policies.

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Storage: private bucket for files attached to enquiries
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('lead-files', 'lead-files', false)
on conflict (id) do nothing;

create policy "lead files: view"
  on storage.objects for select
  using (bucket_id = 'lead-files' and public.has_perm('files.view'));

-- Uploads go through the service role; no anon/authenticated insert policy.

-- Public bucket for images embedded in Insights posts (uploaded by editors
-- via the server; readable by everyone through the public object URL).
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Table-level grants (RLS still decides which ROWS are visible).
-- Needed when this file is applied as plain SQL: anon gets nothing at all;
-- authenticated (team) and service_role get table access narrowed by RLS.
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete
  on public.profiles, public.leads, public.reviews, public.posts,
     public.post_categories
  to authenticated, service_role;

grant execute on function public.has_perm(text) to authenticated;

-- Anonymous visitors: published posts + category labels only (RLS above).
grant usage on schema public to anon;
grant select on public.posts, public.post_categories to anon;

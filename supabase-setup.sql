-- Students Uran secure admin + live content schema
-- Run this in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('universities','scholarships','updates','guides')),
  title text not null,
  slug text,
  subtitle text,
  body text,
  city text,
  institution_type text,
  study_level text,
  funding_type text,
  tags jsonb not null default '[]'::jsonb,
  url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists site_content_section_published_idx on public.site_content(section, published);
create unique index if not exists site_content_guide_slug_idx on public.site_content(slug) where section='guides' and slug is not null;
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at before update on public.site_content for each row execute function public.set_updated_at();
alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;
-- Public can only read published resources.
drop policy if exists "Public can read published content" on public.site_content;
create policy "Public can read published content" on public.site_content for select using (published = true);
-- Only authenticated accounts explicitly listed in admin_users can manage content.
drop policy if exists "Admins can read all content" on public.site_content;
create policy "Admins can read all content" on public.site_content for select to authenticated using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "Admins can insert content" on public.site_content;
create policy "Admins can insert content" on public.site_content for insert to authenticated with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "Admins can update content" on public.site_content;
create policy "Admins can update content" on public.site_content for update to authenticated using (exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "Admins can delete content" on public.site_content;
create policy "Admins can delete content" on public.site_content for delete to authenticated using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
-- Admins can check their own admin membership only. Do not allow public users to grant themselves access.
drop policy if exists "Admins can view own membership" on public.admin_users;
create policy "Admins can view own membership" on public.admin_users for select to authenticated using (user_id=auth.uid());

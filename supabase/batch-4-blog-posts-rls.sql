-- =============================================================================
-- Dammas Express — Batch 4: blog_posts RLS (published rows only)
-- =============================================================================
--
-- Run each PART separately in the Supabase SQL editor, in order. The editor
-- shows only the last statement's result, so each query is its own run.
--
-- Problem: the only blog_posts policy is
--   "Public read blog_posts"  SELECT  roles {public}  using (true)
-- The anon key ships in the browser bundle by design, so anyone could query
-- /rest/v1/blog_posts directly and read unpublished drafts (n8n posts land as
-- drafts).
--
-- Fix: same policy name and role, condition narrowed to is_published = true.
--
-- Why this is safe for the site:
--   * Every anon read of blog_posts is in src/lib/data.ts (getPublishedPosts,
--     getPublishedPostSummaries, getPostBySlug) and already filters
--     is_published = true, so the public pages, sitemap and the n8n GET feed
--     see exactly the same rows as before.
--   * The dashboard (/api/blog, dashboard overview, src/lib/actions/blog.ts)
--     and the n8n POST slug check use the service role key, which bypasses RLS.
--   * The app does not use Supabase Auth, so no "authenticated" session relies
--     on the old policy.
--
-- Not touched: table schema, data, and every other table's policies
-- (inquiries, routes, fleet, services).


-- =============================================================================
-- PART 1 — PREVIEW (read-only)
-- =============================================================================

-- 1a. Current blog_posts policies. Expected before: one row,
--     "Public read blog_posts", SELECT, {public}, qual = true.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'blog_posts';

-- 1b. RLS is enabled on the table (expected: true).
select relrowsecurity
from pg_class
where oid = 'public.blog_posts'::regclass;

-- 1c. How many rows are currently exposed that should not be.
select is_published, count(*)
from blog_posts
group by is_published;


-- =============================================================================
-- PART 2 — APPLY
-- =============================================================================

begin;

drop policy if exists "Public read blog_posts" on public.blog_posts;

create policy "Public read blog_posts"
  on public.blog_posts
  for select
  to public
  using (is_published = true);

commit;


-- =============================================================================
-- PART 3 — VERIFY
-- =============================================================================

-- 3a. Expected: one row, SELECT, {public}, qual = (is_published = true).
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'blog_posts';

-- 3b. Simulate the anon role. Expected: no rows with is_published = false.
--     (Run all four lines together; the rollback undoes the role switch.)
begin;
set local role anon;
select is_published, count(*) from blog_posts group by is_published;
rollback;


-- =============================================================================
-- ROLLBACK (only if something breaks) — restores the previous policy exactly.
-- =============================================================================
-- begin;
-- drop policy if exists "Public read blog_posts" on public.blog_posts;
-- create policy "Public read blog_posts" on public.blog_posts
--   for select to public using (true);
-- commit;

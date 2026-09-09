-- LDA Dashboard: RLS policies
--
-- 0001_init.sql enabled RLS on every table with zero policies (service-role only --
-- today's dashboard queries everything through the service-role key, which bypasses
-- RLS entirely, so none of this changes current app behavior). This migration opens
-- two things up:
--
--   1. Public read (SELECT) access, for the `anon` role, on the content tables the
--      public website -- a separate project, reading this same Supabase project with
--      its anon/publishable key -- needs to display: activities, project summaries
--      (+ their dated entries), project activities, publications.
--   2. Full read/write access for admin dashboard users, gated by `admin_allowlist` via
--      the is_admin() helper below, as defense-in-depth in case anything ever queries
--      Postgres with a signed-in user's session instead of the service-role key.
--
-- Deliberately left OUT of public SELECT: `admin_allowlist` (the allowlist itself) and
-- `questions` (Q&A submissions carry the asker's full_name/email -- PII). `questions`
-- only gets admin (is_admin()) policies here. If the public site needs to list answered
-- questions or submit new ones, that needs its own narrower policy/view that excludes
-- PII -- don't just widen these policies to "anon, authenticated" for that table without
-- confirming with the user first.

-- ---------------------------------------------------------------------------
-- is_admin(): true if the currently authenticated user's email is in admin_allowlist.
-- SECURITY DEFINER so it can read admin_allowlist even though admin_allowlist itself
-- has no SELECT policy for the authenticated role.
-- ---------------------------------------------------------------------------
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
     select exists (
          select 1
          from admin_allowlist
          where email = auth.jwt() ->> 'email'
     );
$$;

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------
create policy "activities_public_read" on activities
     for select
     to anon, authenticated
     using (true);

create policy "activities_admin_insert" on activities
     for insert
     to authenticated
     with check (is_admin());

create policy "activities_admin_update" on activities
     for update
     to authenticated
     using (is_admin())
     with check (is_admin());

create policy "activities_admin_delete" on activities
     for delete
     to authenticated
     using (is_admin());

-- ---------------------------------------------------------------------------
-- project_summaries
-- ---------------------------------------------------------------------------
create policy "project_summaries_public_read" on project_summaries
     for select
     to anon, authenticated
     using (true);

create policy "project_summaries_admin_insert" on project_summaries
     for insert
     to authenticated
     with check (is_admin());

create policy "project_summaries_admin_update" on project_summaries
     for update
     to authenticated
     using (is_admin())
     with check (is_admin());

create policy "project_summaries_admin_delete" on project_summaries
     for delete
     to authenticated
     using (is_admin());

-- ---------------------------------------------------------------------------
-- project_summary_entries (dated entries shown alongside a project summary)
-- ---------------------------------------------------------------------------
create policy "project_summary_entries_public_read" on project_summary_entries
     for select
     to anon, authenticated
     using (true);

create policy "project_summary_entries_admin_insert" on project_summary_entries
     for insert
     to authenticated
     with check (is_admin());

create policy "project_summary_entries_admin_update" on project_summary_entries
     for update
     to authenticated
     using (is_admin())
     with check (is_admin());

create policy "project_summary_entries_admin_delete" on project_summary_entries
     for delete
     to authenticated
     using (is_admin());

-- ---------------------------------------------------------------------------
-- project_activities
-- ---------------------------------------------------------------------------
create policy "project_activities_public_read" on project_activities
     for select
     to anon, authenticated
     using (true);

create policy "project_activities_admin_insert" on project_activities
     for insert
     to authenticated
     with check (is_admin());

create policy "project_activities_admin_update" on project_activities
     for update
     to authenticated
     using (is_admin())
     with check (is_admin());

create policy "project_activities_admin_delete" on project_activities
     for delete
     to authenticated
     using (is_admin());

-- ---------------------------------------------------------------------------
-- publications
-- ---------------------------------------------------------------------------
create policy "publications_public_read" on publications
     for select
     to anon, authenticated
     using (true);

create policy "publications_admin_insert" on publications
     for insert
     to authenticated
     with check (is_admin());

create policy "publications_admin_update" on publications
     for update
     to authenticated
     using (is_admin())
     with check (is_admin());

create policy "publications_admin_delete" on publications
     for delete
     to authenticated
     using (is_admin());

-- ---------------------------------------------------------------------------
-- questions (Q&A) -- admin-only, no public policy (see note at top of file).
-- No admin insert/delete policy: questions are created by the public site's own
-- backend (service-role-equivalent, bypasses RLS) and "deleted" only means the
-- existing archive-via-update flow, covered by the update policy below.
-- ---------------------------------------------------------------------------
create policy "questions_admin_read" on questions
     for select
     to authenticated
     using (is_admin());

create policy "questions_admin_update" on questions
     for update
     to authenticated
     using (is_admin())
     with check (is_admin());

-- admin_allowlist: intentionally left with no policies -- stays service-role only.

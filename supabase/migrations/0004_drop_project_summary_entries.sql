-- LDA Dashboard: drop project_summary_entries.
--
-- This table was a one-way snapshot: a row was INSERTed once, when a project activity
-- was created (see project-activity-form.tsx), holding a copy of that activity's first
-- paragraph as `description`. It has no column linking it back to the project_activities
-- row it was copied from, so editing (or clearing) an activity's content afterward could
-- never update or delete the corresponding entry -- the public site kept rendering
-- whatever text existed at creation time, forever.
--
-- Replacement: the public site now reads the short description directly off
-- project_activities (first element of `paragraphs`, per project) instead of this table.
-- Dropping the table also drops its policies (project_summary_entries_public_read,
-- project_summary_entries_admin_insert/update/delete from 0002_rls_policies.sql).

drop table if exists project_summary_entries;

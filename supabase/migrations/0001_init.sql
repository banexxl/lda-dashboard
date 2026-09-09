-- LDA Dashboard: initial Supabase schema
-- Replaces the MongoDB `LDA_DB` database. Run this once against a fresh Supabase project
-- (SQL editor or `supabase db push`). No data migration — this creates empty tables.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
     new.updated_at = now();
     return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_allowlist — replaces the Mongo `Auth` collection.
-- Checked by src/app/auth/callback/route.ts after Google OAuth sign-in.
-- ---------------------------------------------------------------------------
create table admin_allowlist (
     email      text primary key,
     created_at timestamptz not null default now()
);

alter table admin_allowlist enable row level security;
-- No policies: only the service-role key (used server-side in the auth callback) can read
-- this table. No anon/authenticated client ever queries it directly.

-- ---------------------------------------------------------------------------
-- activities — news/blog-style posts ("Activities" nav item)
-- ---------------------------------------------------------------------------
create table activities (
     id                 uuid primary key default gen_random_uuid(),
     title              text not null,
     activity_url       text not null unique,
     author             text,
     published_date     timestamptz,
     status             text not null default 'to-do'
                              check (status in ('completed', 'in-progress', 'to-do')),
     category           text not null default 'other'
                              check (category in ('economy', 'democracy', 'eu-integrations', 'culture',
                                                   'intercultural-dialogue', 'migrations', 'youth', 'other')),
     descriptions       text[] not null default '{}',
     quill_editor_data  text,
     gallery            text[] not null default '{}',
     cover_url          text,
     links              text[] not null default '{}',
     list               text[] not null default '{}',
     list_title         text,
     favorited          boolean not null default false,
     favorited_number   integer,
     locale             text not null default 'sr' check (locale in ('sr', 'en')),
     created_at         timestamptz not null default now(),
     updated_at         timestamptz not null default now()
);

create trigger activities_set_updated_at
     before update on activities
     for each row execute function set_updated_at();

alter table activities enable row level security;

-- ---------------------------------------------------------------------------
-- project_summaries — top-level projects ("Projects" nav item)
-- ---------------------------------------------------------------------------
create table project_summaries (
     id                          uuid primary key default gen_random_uuid(),
     title                       text not null,
     project_summary_url         text not null unique,
     project_summary_cover_url   text,
     status                      text not null default 'to-do'
                                      check (status in ('completed', 'in-progress', 'to-do')),
     category                    text not null default 'other'
                                      check (category in ('economy', 'democracy', 'eu-integrations', 'culture',
                                                           'intercultural-dialogue', 'migrations', 'youth', 'other')),
     project_start_date_time     timestamptz,
     project_end_date_time       timestamptz,
     organizers                  text[] not null default '{}',
     locations                   text[] not null default '{}',
     applicants                  text[] not null default '{}',
     donators                    text[] not null default '{}',
     publications                text[] not null default '{}',
     links                       text[] not null default '{}',
     gallery                     text[] not null default '{}',
     locale                      text not null default 'sr' check (locale in ('sr', 'en')),
     created_at                  timestamptz not null default now(),
     updated_at                  timestamptz not null default now()
);

create trigger project_summaries_set_updated_at
     before update on project_summaries
     for each row execute function set_updated_at();

alter table project_summaries enable row level security;

-- ---------------------------------------------------------------------------
-- project_summary_entries — dated description/subtitle entries attached to a project
-- summary. Replaces the old Mongo `$push` into mismatched parallel-array field names
-- (projectSummaryDescriptions[] / projectSummarySubtitleURLs[] / projectSummarySubtitles[]
-- vs. a singular projectSummaryDateTime) with a proper child table.
-- ---------------------------------------------------------------------------
create table project_summary_entries (
     id                  uuid primary key default gen_random_uuid(),
     project_summary_id  uuid not null references project_summaries(id) on delete cascade,
     description         text,
     subtitle            text,
     subtitle_url        text,
     entry_date_time     timestamptz,
     sort_order          integer not null default 0,
     created_at          timestamptz not null default now()
);

create index project_summary_entries_project_summary_id_idx
     on project_summary_entries (project_summary_id);

alter table project_summary_entries enable row level security;

-- ---------------------------------------------------------------------------
-- project_activities — activities under a project ("Project Activities" nav item).
-- Renamed off the Mongo collection literally named `Projects` (naming mismatch with the
-- "Project Activities" page/service that targeted it). project_summary_id is a real FK,
-- replacing the old slug-based `projectSummaryURL` string reference.
-- ---------------------------------------------------------------------------
create table project_activities (
     id                       uuid primary key default gen_random_uuid(),
     project_summary_id       uuid references project_summaries(id) on delete set null,
     title                    text not null,
     sub_title                text,
     title_eng                text,
     sub_title_eng            text,
     has_translation          boolean not null default false,
     paragraphs               text[] not null default '{}',
     paragraphs_eng           text[] not null default '{}',
     quill_editor_data        text,
     content_html             text,
     content_html_eng         text,
     project_url              text not null unique,
     published                timestamptz,
     status                   text not null default 'to-do'
                                    check (status in ('completed', 'in-progress', 'to-do')),
     category                 text not null default 'other'
                                    check (category in ('economy', 'democracy', 'eu-integrations', 'culture',
                                                         'intercultural-dialogue', 'migrations', 'youth', 'other')),
     gallery                  text[] not null default '{}',
     links                    text[] not null default '{}',
     list                     text[] not null default '{}',
     list_title               text,
     favorited                boolean not null default false,
     favorited_number         integer,
     organizers               text[] not null default '{}',
     sub_organizers           text[] not null default '{}',
     applicants               text[] not null default '{}',
     donators                 text[] not null default '{}',
     locations                text[] not null default '{}',
     publications             text[] not null default '{}',
     show_project_details     boolean not null default false,
     show_list                boolean not null default false,
     show_list_on_bottom      boolean not null default false,
     locale                   text not null default 'sr' check (locale in ('sr', 'en')),
     created_at               timestamptz not null default now(),
     updated_at               timestamptz not null default now()
);

create index project_activities_project_summary_id_idx
     on project_activities (project_summary_id);

create trigger project_activities_set_updated_at
     before update on project_activities
     for each row execute function set_updated_at();

alter table project_activities enable row level security;

-- ---------------------------------------------------------------------------
-- publications — downloadable files (mostly PDFs)
-- ---------------------------------------------------------------------------
create table publications (
     id                                uuid primary key default gen_random_uuid(),
     publication_title                 text not null,
     publication_url                   text not null,
     publication_image_url             text,
     publication_uploaded_date_time    timestamptz not null default now(),
     created_at                        timestamptz not null default now()
);

alter table publications enable row level security;

-- ---------------------------------------------------------------------------
-- questions — public Q&A inbox. Renamed off the literal Mongo collection name `Q&A`.
-- DELETE archives (archived = true) rather than removing the row, same as before.
-- ---------------------------------------------------------------------------
create table questions (
     id                  uuid primary key default gen_random_uuid(),
     full_name           text,
     email               text not null,
     question            text not null,
     answer              text,
     question_date_time  timestamptz,
     answer_date_time    timestamptz,
     archived            boolean not null default false,
     created_at          timestamptz not null default now()
);

alter table questions enable row level security;

-- ---------------------------------------------------------------------------
-- Storage bucket — replaces the `lda-su` S3 bucket. Public read (files are served
-- directly to the public website), writes only via the service-role key server-side.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('lda-media', 'lda-media', true)
on conflict (id) do nothing;

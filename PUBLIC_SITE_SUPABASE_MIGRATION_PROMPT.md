# Prompt: migrate lda-subotica.org from MongoDB to Supabase

Paste everything below into a fresh Claude Code session opened in the **public website**
repo (lda-subotica.org — a separate codebase from the admin dashboard this was written
from). This is a self-contained briefing; the session that receives it has no memory of
how the dashboard migration was done.

---

## Context

The LDA Subotica admin dashboard (a separate repo, `lda-dashboard.vercel.app`) used to
write all content into a MongoDB database (`LDA_DB`) that this public site also read
directly. The dashboard has now been fully migrated off MongoDB onto Supabase (Postgres).
As of the dashboard migration, **new and edited content is being saved to Supabase, not
MongoDB** — so this site needs to switch its read (and possibly write) path from Mongo to
Supabase, or it will silently stop seeing updates.

**Scope of this task**: only the read (and where noted, write) path for content. This site
has no login/admin features, so there is nothing to do about authentication — Supabase
Auth is not part of this task at all. Every table below is either fully public-readable
(via Row Level Security policies already in place) or needs a narrow, unauthenticated
write path discussed below.

**First step before writing any code**: explore this repo to find every place it currently
talks to MongoDB (look for a Mongo connection string / driver usage, a `LDA_DB` reference,
or collection names `Activities`, `Projects`, `ProjectSummaries`, `Publications`, `Q&A`,
`Auth`). Map each usage to the equivalent Supabase table/columns below before changing
anything — don't assume this site's structure; verify it by reading the actual code first.
Also identify this site's tech stack (framework, SSR vs static, hosting) since that
determines how the Supabase client should be wired in — nothing here assumes Next.js.

## Supabase project connection details

```
NEXT_PUBLIC_SUPABASE_URL=https://gjbpohuzolliyuljsgqu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_zkvx9zpXgDYfvBiAQVYroQ_Re-hALeN
```

Both of these are safe to embed in client-side/browser code — the publishable key is
RLS-scoped to the `anon` role and can only do what the policies below explicitly allow.
There is **no service-role/secret key in this prompt on purpose** — this site should never
need one; if a task seems to require it, stop and flag that rather than requesting one.

Use `@supabase/supabase-js` (the plain JS client) to query Postgres via PostgREST — there
is no user session to manage, so `@supabase/ssr` is not needed unless this site's framework
specifically requires it for some other reason.

```js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
```

## What's publicly readable right now (RLS already configured)

These 5 tables already grant `SELECT` to the `anon` role (see
`supabase/migrations/0002_rls_policies.sql` in the dashboard repo if you want the exact
policy SQL) — you can query them directly from browser or server code with the
publishable key above, no further Supabase-side setup needed:

- `activities`
- `project_summaries`
- `project_summary_entries`
- `project_activities`
- `publications`

**`questions` and `admin_allowlist` are NOT publicly readable** — RLS blocks anon access
entirely on both. See the "Q&A: needs a decision" section below before touching that one.

## Schema (Postgres, snake_case) and how it maps from the old Mongo shape

All tables use `id uuid` (was Mongo's `_id` ObjectId — now a UUID) as primary key, plus
`created_at timestamptz` (and `updated_at` where the entity is ever edited by the
dashboard). Every other Mongo field was renamed from camelCase to snake_case — if this
site's current code reads `doc.activityURL`, `doc.publishedDate`, etc., every one of those
needs updating to the names below.

### `activities` (was Mongo collection `Activities`)
| Postgres column | old Mongo field | type / notes |
|---|---|---|
| `id` | `_id` | uuid |
| `title` | `title` | text |
| `activity_url` | `activityURL` | text, unique (the slug) |
| `author` | `author` | text |
| `published_date` | `publishedDate` | timestamptz |
| `status` | `status` | text: `completed` \| `in-progress` \| `to-do` |
| `category` | `category` | text — see "category values" note below |
| `descriptions` | `descriptions` | text[] |
| `quill_editor_data` | `quillEditorData` | text (rich HTML; body is either this or `descriptions`) |
| `gallery` | `gallery` | text[] of image URLs |
| `cover_url` | `coverURL` | text |
| `links` | `links` | text[] |
| `list` / `list_title` | `list` / `listTitle` | text[] / text |
| `favorited` / `favorited_number` | `favorited` / `favoritedNumber` | boolean / int |
| `locale` | `locale` | text, `sr` or `en` |

**Category values note**: most rows use one of `economy, democracy, eu-integrations,
culture, intercultural-dialogue, migrations, youth, other`. A handful of old rows
(pre-2020ish) carry legacy values that predate that taxonomy: `alda, dan-evrope,
eu-info-point, evropski-gradovi-interkulturalnosti, mladi,
mladi-volontiranje-u-inostranstvu, mladi-volontiranje-u-subotici`. Don't assume category
is always one of the 8 "current" values — handle/display the legacy ones too (or ask the
user for site-side display labels for them).

### `project_summaries` (was Mongo collection `ProjectSummaries`)
| Postgres column | old Mongo field |
|---|---|
| `id` | `_id` |
| `title` | `title` |
| `project_summary_url` | `projectSummaryURL` (unique slug) |
| `project_summary_cover_url` | `projectSummaryCoverURL` |
| `status` / `category` | same enums as `activities` (current 8-value taxonomy only, no legacy values here) |
| `project_start_date_time` / `project_end_date_time` | `projectStartDateTime` / `projectEndDateTime` |
| `organizers` / `locations` / `applicants` / `donators` / `publications` / `links` / `gallery` | same names, all text[] |
| `locale` | `locale` |

### `project_summary_entries` (new table — replaces a buggy Mongo `$push` pattern)
Dated sub-entries shown alongside a project summary (added automatically when a project
activity is created under it). Old Mongo `ProjectSummaries` docs held these as 4 parallel
arrays on the summary doc itself (`projectSummaryDescriptions[]`,
`projectSummarySubtitleURLs[]`, `projectSummaryDateTime[]` — despite the singular name it
was an array — and `projectSummarySubtitles[]`, all indexed in parallel). That's now a
proper child table:

| Postgres column | old Mongo field (index `i` into the parallel arrays) |
|---|---|
| `id` | n/a (new) |
| `project_summary_id` | FK to `project_summaries.id` (was implicit via the parent doc) |
| `description` | `projectSummaryDescriptions[i]` |
| `subtitle` | `projectSummarySubtitles[i]` |
| `subtitle_url` | `projectSummarySubtitleURLs[i]` |
| `entry_date_time` | `projectSummaryDateTime[i]` |
| `sort_order` | derived from array index `i` |

If this site rendered those parallel arrays anywhere, it now needs a join/second query
against this table instead, ordered by `sort_order`.

### `project_activities` (was Mongo collection literally named `Projects` — a known
naming mismatch: the "Project Activities" section of the site/dashboard stored into a
collection called `Projects`, not `ProjectActivities`)
| Postgres column | old Mongo field |
|---|---|
| `id` | `_id` |
| `project_summary_id` | **structural change**: was `projectSummaryURL`, a slug string prefixed `/pregled-projekta/<slug>`. Now a real uuid FK to `project_summaries.id` — no more string parsing needed, just join. Nullable: a few historical rows have no resolvable parent (`NULL`). |
| `title` / `sub_title` | `title` / `subTitle` |
| `title_eng` / `sub_title_eng` | `title_eng` / `subTitle_eng` |
| `has_translation` | `hasTranslation` |
| `paragraphs` / `paragraphs_eng` | same names, text[] (body is either these or the quill/html fields) |
| `quill_editor_data` | `quillEditorData` |
| `content_html` / `content_html_eng` | `contentHtml` / `contentHtmlEng` |
| `project_url` | `projectURL` (unique slug) |
| `published` | `published` |
| `status` / `category` | same enums, current 8-value taxonomy (one old junk value `"/"` was normalized to `other` during migration, nothing to handle here) |
| `gallery` / `links` / `list` / `list_title` | same names |
| `favorited` / `favorited_number` | same names |
| `organizers` / `sub_organizers` / `applicants` / `donators` / `locations` / `publications` | `organizers` / `subOrganizers` / ... (rest same names) |
| `show_project_details` / `show_list` / `show_list_on_bottom` | `showProjectDetails` / `showList` / `showListOnBottom` |
| `locale` | `locale` |

### `publications` (was Mongo collection `Publications`)
| Postgres column | old Mongo field |
|---|---|
| `id` | `_id` |
| `publication_title` | `publicationTitle` |
| `publication_url` | `publicationURL` |
| `publication_image_url` | `publicationImageURL` |
| `publication_uploaded_date_time` | `publicationUploadedDateTime` |

### `questions` (was Mongo collection literally named `Q&A`) — needs a decision, see below
| Postgres column | old Mongo field |
|---|---|
| `id` | `_id` |
| `full_name` | `fullName` |
| `email` | `email` |
| `question` / `answer` | same names |
| `question_date_time` / `answer_date_time` | `questionDateTime` / `answerDateTime` |
| `archived` | `archived` — **type change**: was a Mongo number (`0`/`1`), is now a real Postgres `boolean` |

## Q&A: needs a decision before you touch it

In the old Mongo-backed setup, the admin dashboard's API had no "create question" endpoint
— new questions were written directly into the `Q&A` collection by **this site's own
backend** (i.e., whatever handles the public "Postavi pitanje" / ask-a-question form).
If that's still how it works, this site needs a way to `INSERT` into `questions`, but the
RLS policies currently only allow the admin dashboard (via its service-role key) to
`SELECT`/`UPDATE` — there is no public insert policy.

Two ways to handle it, don't guess which — confirm with the user first:
1. **This site has its own backend/server route** (not just static/client-side): use a
   server-side Supabase client there with a service-role key of its own (ask the user to
   generate one in the Supabase dashboard — do not reuse the dashboard project's key
   blindly without confirming that's intended), keeping it off the client entirely.
2. **This site is fully static/client-side** with no backend: the fix is a narrow RLS
   policy allowing `anon` to `INSERT` (not `SELECT`) into `questions` — ask the user
   before adding this policy, since it changes the security posture of that table.

Also confirm whether this site ever **displays** answered questions publicly (a public
FAQ-style list) — if so, that's a separate, deliberately-scoped read policy to design (it
would need to exclude `full_name`/`email`, which are PII), not a blanket anon `SELECT`.
Don't add one without the user explicitly asking for it.

## File/image URLs

`gallery`, `cover_url`, `publication_url`, etc. are already full URLs — some point at
Supabase Storage (`https://gjbpohuzolliyuljsgqu.supabase.co/storage/v1/object/public/lda-media/...`),
a handful (fewer than 10, across ~500 total rows) still point at the old S3 bucket
(`https://lda-su.s3.eu-central-1.amazonaws.com/...`) because the original file is gone
(404/403) or too large — this is expected and doesn't need fixing here. Just render
whatever URL is stored; don't assume a single hostname.

## Verification

- Confirm row counts match expectations after wiring up reads: 147 `activities`, 29
  `project_summaries`, 284 `project_summary_entries`, 273 `project_activities`, 49
  `publications`, 3 `questions`.
- Spot-check that category/status values render sensibly for both current and legacy
  values (see the category note above).
- If you touch the Q&A submission flow, test it end-to-end against a throwaway row and
  confirm it appears correctly in the admin dashboard's Questions section afterward.

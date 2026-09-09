# Data model

Database: `LDA_DB` (MongoDB, native driver, connected via `MONGODB_URI`). No schema
migrations/ODM — the Yup schemas in each `*-type.ts` file are the closest thing to a
canonical schema, but they run client-side only (API routes do minimal/inconsistent
server-side validation — see `known-issues.md`).

## Collections

### `Activities` — news/blog-style posts (site's "Activities" section)
Type: `src/sections/activities/activity-type.ts`
- `title`, `activityURL` (slug), `author`, `publishedDate`, `status` (`completed` |
  `in-progress` | `to-do`), `category` (`economy` | `democracy` | `eu-integrations` |
  `culture` | `intercultural-dialogue` | `migrations` | `youth` | `other`)
- Body content is **either** `descriptions: string[]` (paragraph list) **or**
  `quillEditorData: string` (rich HTML) — Yup validates that at least one is non-empty.
- `gallery: string[]`, `coverURL: string`, `links: string[]` — all S3 URLs.
- `list`/`listTitle` — optional bullet list rendered alongside the body.
- `favorited` / `favoritedNumber` — feature/pin flag + a manually-set popularity number.
- `locale` defaults `'sr'`.

### `Projects` (⚠ collection name, not `ProjectActivities`) — activities under a project
Type: `src/sections/project-activities/project-activity-type.ts`
- Everything `Activities` has, plus **parallel English fields**: `title_eng`,
  `subTitle_eng`, `paragraphs_eng`, `contentHtmlEng`, gated by `hasTranslation: boolean`.
- `projectSummaryURL` — foreign key (by URL/slug, not `_id`) back to `ProjectSummaries`.
- `paragraphs: string[]` **or** `quillEditorData`/`contentHtml` for body (same or/pattern as Activities).
- `organizers`, `subOrganizers`, `applicants`, `donators`, `locations`, `publications` — all `string[]`.
- `showProjectDetails`, `showList`, `showListOnBottom` — display toggles for the public site.

### `ProjectSummaries` — top-level projects
Type: `src/sections/project-summaries/project-summary-type.ts`
- `title`, `projectSummaryURL`, `projectSummaryCoverURL`, `status`, `category` (same enums as above).
- `projectStartDateTime` / `projectEndDateTime`.
- `organizers`, `locations`, `applicants`, `donators`, `publications`, `links` — `string[]`.
- Several description/subtitle array fields are commented out in the schema (dead/paused feature — don't resurrect without checking why they were disabled).
- Gets updated (PUT) as a side effect when a Project Activity is added — see `architecture.md`.

### `Publications` — downloadable files (mostly PDFs)
Services: `src/utils/publication-services.ts`, API: `src/pages/api/publications-api.ts`
- `publicationTitle`, `publicationURL` (S3 URL), `publicationImageURL`, `publicationUploadedDateTime`.
- Rows are created either directly via `/publications` page, or automatically when a file
  is uploaded through `PUT /api/aws-s3.ts` (see cross-entity coupling in `architecture.md`).

### `Q&A` — public-facing question inbox
Services: `src/utils/questions-services.ts`, API: `src/pages/api/questions-api.ts`
- Questions presumably come in from the public site (no POST handler exists in this repo's
  `questions-api.ts` — only GET/PUT/DELETE — so question *creation* happens elsewhere,
  likely the public website's own backend writing directly to this collection).
- `answer`, `answerDateTime` — set when an admin answers via PUT; triggers an email to
  `updatedQuestion.email` unless `archived` is truthy.
- DELETE archives (`archiveQuestion`) rather than removing the document.

### `Auth` — admin allowlist (not a NextAuth adapter collection, a manual gate)
Services: `src/utils/user-services.ts`
- Just needs an `email` field; presence of a matching doc is what allows Google sign-in
  through `signIn` callback in `[...nextauth].ts`. Adding an admin = inserting a document
  here manually (there's no UI for it in this repo).

## Enums shared across content types

```ts
type Category = 'economy' | 'democracy' | 'eu-integrations' | 'culture'
  | 'intercultural-dialogue' | 'migrations' | 'youth' | 'other'
type Status = 'completed' | 'in-progress' | 'to-do'
type Locale = 'sr' | 'en'
```
Defined redundantly in each `*-type.ts` (`ActivityCategory`, `ProjectCategory`, etc.) —
they're structurally identical but not shared via a common module. If you add a category,
you likely need to update it in more than one file — grep for the existing values first.

## IDs and foreign keys

- Mongo `_id` (ObjectId) is the primary key everywhere, but cross-collection references
  (`projectSummaryURL`, `activityURL`, `projectURL`) are **by URL/slug string**, not by
  `_id`. There's no referential integrity — renaming a URL slug will silently break the
  link from child records.

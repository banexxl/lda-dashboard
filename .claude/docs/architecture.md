# Architecture

## What this app is

A single Next.js app that is *both* the admin dashboard UI and its own backend API. It
manages content for the public LDA Subotica website (which is a separate site — this repo
only produces the admin tool; it uploads assets to S3 and writes to MongoDB that the
public site presumably reads from).

## Request flow

```
Browser (MUI/React page)
   -> fetch('/api/<name>-api', { method: GET|POST|PUT|DELETE })
   -> src/middleware.ts checks NextAuth JWT (via getToken), 401s if missing on /api/*
   -> src/pages/api/<name>-api.ts route handler
   -> src/utils/<name>-services.ts (opens MongoClient, queries LDA_DB, closes client)
   -> MongoDB Atlas (or wherever MONGODB_URI points)
```

File uploads go through a separate path:

```
Browser -> base64-encodes file client-side
   -> POST/PUT /api/aws-s3.ts (bodyParser sizeLimit raised to 10MB)
   -> decodes base64, builds S3 key as `${year}/${month}/${day}/${title}/${fileName}`
   -> uploads via @aws-sdk/lib-storage Upload, ACL public-read
   -> returns the public S3 URL, which is then stored on the entity's *URL / gallery fields
```

## Auth flow (NextAuth, `src/pages/api/auth/[...nextauth].ts`)

- Google provider only.
- `signIn` callback: rejects unless `profile.email_verified`, email ends with `@gmail.com`,
  **and** a matching document exists in the `Auth` collection (`UserServices().getUserByEmail`).
  There is no self-registration UI — new admins must be inserted into `Auth` directly in MongoDB.
- `session` callback re-fetches the user from `Auth` by email and stamps `session.user.id`.
- Session `maxAge` is 1 hour (short-lived).
- `src/middleware.ts` (Edge middleware, matches everything except `_next/static`,
  `_next/image`, `favicon.ico`) additionally: always allows `/api/auth/*`; 401-JSONs any
  other `/api/*` call without a valid token; allows `/auth/*` (the login page itself) and
  static asset prefixes; redirects everything else to `/auth/login?callbackUrl=...` when unauthenticated.
- `src/hooks/use-auth-guard.tsx` (`withAuthGuard` HOC) is a *client-side* second layer —
  shows a spinner while `useSession` resolves and hard-redirects to `/auth/login` if
  unauthenticated. Pages that render user-specific/admin UI should wrap with this even
  though middleware also protects the route, since middleware alone won't stop a
  client-rendered flash of protected content.

## Pages <-> feature module mapping

| Route | Page file | Feature module (`src/sections/...`) | API route | Mongo collection |
|---|---|---|---|---|
| `/project-summaries` | `pages/project-summaries.tsx` | `sections/project-summaries/` | `api/project-summaries-api.ts` | `ProjectSummaries` |
| `/project-activities` | `pages/project-activities.tsx` | `sections/project-activities/` | `api/project-activities-api.ts` | `Projects` |
| `/activities` | `pages/activities.tsx` | `sections/activities/` | `api/activities-api.ts` | `Activities` |
| `/publications` | `pages/publications.tsx` | *(no dedicated sections dir; logic inline in the page)* | `api/publications-api.ts` | `Publications` |
| `/questions` | `pages/questions.tsx` | *(no dedicated sections dir; logic inline in the page)* | `api/questions-api.ts` | `Q&A` |

Note the naming mismatch: the "Project Activities" nav item / page maps to the `Projects`
Mongo collection and `project-activity-services.ts`, while "Projects" (`/project-summaries`)
maps to `ProjectSummaries`. Read the collection name, not the page name, when tracing data.

## Cross-entity coupling

- Adding a **Project Activity** also PUTs a summary blurb onto the parent **Project
  Summary** (`project-activity-form.tsx` chains two fetches: POST to
  `project-activities-api` then PUT to `project-summaries-api`).
- Uploading a file via `PUT /api/aws-s3.ts` also inserts a row into the `Publications`
  collection (`projectActivitiesServices().addPublicationToPublicationsDB`) — so the
  "Publications" list is partly populated as a side effect of file uploads elsewhere, not
  only through `/publications`.
- Answering a question (`PUT /api/questions-api.ts`) fires an async (non-blocking, fire
  and forget via `void sendNotification()`) email to the asker via Nodemailer/SMTP env vars.
- Deleting a question is actually an **archive** (`archiveQuestion`), not a hard delete.

## Layouts

- `src/layouts/dashboard/layout.tsx` + `side-nav.tsx` + `top-nav.tsx` + `account-popover.tsx`
  — the authenticated shell. Nav items are defined in `src/layouts/dashboard/config.tsx`.
- `src/layouts/auth/layout.tsx` — used only by `/auth/login`.
- Pages opt into a layout via the Next.js Pages Router convention
  `Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>` (see `_app.tsx`,
  which calls `Component.getLayout ?? (page => page)`).

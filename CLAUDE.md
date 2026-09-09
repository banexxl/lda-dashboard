# LDA Dashboard

Admin dashboard for **LDA Subotica** (an NGO) to manage content shown on their public
website (lda-subotica.org): projects, project activities, news/activities, publications
(PDFs), and a public Q&A inbox. Deployed at lda-dashboard.vercel.app.

Read `.claude/docs/` before making non-trivial changes — it has the full architecture,
data model, and known issues. Summary below.

## Tech stack

- **Next.js 15** (Pages Router, not App Router) + **React 19**, TypeScript, `src/` layout with `@/*` path alias.
- **MUI v5** (`@mui/material`) for all UI, theme in `src/theme/`.
- **MongoDB** (native driver, no ODM) — database `LDA_DB`. Every service function opens its own `MongoClient` connection and closes it (no shared/pooled client — see known issues).
- **NextAuth v4**, Google OAuth only, gated to `@gmail.com` addresses that already exist in the `Auth` collection (self-service signup is not possible).
- **AWS S3** for file storage (images, galleries, publication PDFs) via `@aws-sdk/client-s3`.
- **Formik + Yup** for all forms/validation. **SweetAlert2** for toasts/confirmations. **react-quilljs** for rich text.
- **Nodemailer** for outbound email (Q&A answer notifications) — `resend` is a dependency but currently unused.

## Structure

- `src/pages/` — routed pages (Pages Router) + `src/pages/api/*` — API routes.
- `src/sections/<feature>/` — feature-specific forms/tables/search + a `*-type.ts` (Yup schema + TS type + initial values).
- `src/utils/*-services.ts` — MongoDB data-access functions, one file per collection-ish concern.
- `src/layouts/dashboard/` — sidebar/topnav shell; `src/layouts/auth/` — login layout.
- `src/middleware.ts` — route protection (redirects unauthenticated users to `/auth/login`, 401s unauthenticated API calls).

## Conventions actually used in this repo

- Indentation is **5-space** in most files (not 2/4) — match the surrounding file, don't reformat.
- API routes are REST-ish single-file handlers switching on `req.method` (GET/POST/PUT/DELETE), not resource-based routing.
- Service files return `-1` or `{ message }` objects on error instead of throwing — callers must check for these sentinel values, not exceptions.
- Yup schemas + TS types + `initial*` default objects live together in each feature's `*-type.ts` file.
- User-facing strings are a mix of Serbian and English (this is a bilingual sr/en site) — match the language already used in the file you're editing.

## Before you touch auth, payments, deploy config, or env vars

Ask first — this is a live production app for a real organization.

See `.claude/docs/known-issues.md` for a list of pre-existing bugs/risks (including an
**unresolved git merge conflict currently committed in `package.json`**) — don't assume
something is your bug to fix unless asked.

# Environment & setup

## Required environment variables

Collected by grepping `process.env.*` across `src/`. There is no `.env.example` in the
repo — create one if you add new vars, since onboarding currently relies on tribal
knowledge.

| Variable | Used by | Purpose |
|---|---|---|
| `MONGODB_URI` | all `src/utils/*-services.ts`, `src/pages/api/activities-api.ts` | MongoDB Atlas (or other) connection string |
| `NEXTAUTH_SECRET` | `src/middleware.ts`, NextAuth | JWT signing secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | `src/pages/api/auth/[...nextauth].ts` | Google OAuth app credentials |
| `AWS_S3_ACCESS_KEY_ID` / `AWS_S3_SECRET_KEY` | `src/pages/api/aws-s3.ts` | S3 upload credentials |
| `AWS_REGION` | `src/pages/api/aws-s3.ts` | S3 bucket region (bucket lives at `eu-central-1`, see `next.config.js` remote pattern) |
| `AWS_S3_BUCKET_NAME` | `src/pages/api/aws-s3.ts` | Target bucket (`lda-su` per the configured image remote pattern) |
| `EMAIL_SERVER_HOST` / `EMAIL_SERVER_USER` / `EMAIL_SERVER_PASSWORD` | `src/pages/api/questions-api.ts` | SMTP creds for Nodemailer (Q&A answer notifications), port hardcoded to 587 |
| `BASE_URL` | `src/pages/publications.tsx` | referenced client-side; confirm intended use before relying on it |

`.env`, `.env.local`, etc. are gitignored — ask the user for values rather than guessing;
never commit real secrets into any file this repo tracks.

## Scripts (`package.json`)

- `npm run dev` — `next` (dev server)
- `npm run build` — `next build`
- `npm start` — `next start`
- `npm run export` — `next export` (static export; check whether this is actually still
  used given the app relies on API routes + middleware, which are incompatible with a
  static export — likely a stale script)
- `npm run lint` / `npm run lint-fix` — `next lint`

⚠ `package.json` currently has committed, unresolved merge-conflict markers — see
`known-issues.md`. `npm install` will fail until that's fixed.

## Deployment

Deployed on Vercel at lda-dashboard.vercel.app (per `package.json` `homepage` field).
Standard Vercel + Next.js deploy — push to the branch Vercel is watching (confirm which
branch before assuming `main` auto-deploys to production).

## Runtime notes

- Next.js 15 Pages Router (`src/pages`), not the App Router — don't introduce
  `src/app/*` conventions (Server Components, `layout.tsx` at the app level, etc.), they
  won't be picked up.
- `next.config.js` restricts `next/image` remote hosts to: `lh3.googleusercontent.com`
  (Google profile pictures), `utfs.io`, and `lda-su.s3.eu-central-1.amazonaws.com` (the
  S3 bucket). Add new hosts here before using `next/image` with a new external source.
- TypeScript `target` is `es5` with `strict: true`; path alias `@/*` → `src/*`.

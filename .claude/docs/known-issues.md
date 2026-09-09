# Known issues / risks

Found during a codebase read on 2026-09-09. Don't silently "fix" these as drive-by
cleanup — flag/confirm with the user first, since some may be intentional or already
tracked elsewhere.

## 🔴 Unresolved git merge conflict committed in `package.json`

`package.json` lines ~36-40 currently contain literal, committed Git conflict markers:

```
<<<<<<< HEAD
    "nodemailer": "^9.0.3",
=======
    "nodemailer": "^9.0.1",
>>>>>>> origin/dependabot/npm_and_yarn/npm_and_yarn-8ef348f35d
```

This landed in commit `d91c56b` ("Merge remote-tracking branch
'origin/dependabot/npm_and_yarn/npm_and_yarn-8ef348f35d'") on `main`. The file is invalid
JSON right now — `npm install` / `npm ci` / any tooling that parses `package.json` will
fail until this is resolved. **This should be fixed as a priority** — pick one
`nodemailer` version (check `package-lock.json` for what's actually installed) and remove
the conflict markers.

## No connection pooling for MongoDB

Every service function (`ActivitiesServices`, `projectActivitiesServices`, etc.) does
`new MongoClient(process.env.MONGODB_URI!)` / `MongoClient.connect(...)` per call and
closes it in a `finally` (or, in a few spots, not at all — e.g.
`project-activity-services.ts`'s read functions never call `client.close()`). Under load
this opens/closes many connections instead of reusing a cached client, and the ones that
don't close leak connections. If touching these files, prefer following the existing
per-call pattern for consistency rather than introducing a shared client in isolation —
but a shared cached-client helper (the standard Next.js + Mongo pattern) would be a
reasonable improvement to propose.

## Inconsistent server-side validation

Some API routes re-validate with explicit checks and typed errors (`publications-api.ts`,
`questions-api.ts`), others (`activities-api.ts`, `project-activities-api.ts`) just spread
`request.body` straight into MongoDB with no server-side schema check — they rely entirely
on the client-side Yup schema, which is trivially bypassable by anyone who can hit the API
directly (and the API is only gated by "is logged in", not by role/permission).

## Error handling swallows errors inconsistently

Several service functions return sentinel values on error (`-1`, `{ message: error.message
}`, `[]`) instead of throwing, and a few `catch` blocks call `alert(...)` (a browser-only
global) inside what is actually server-side API route code (`activities-api.ts` PUT/DELETE
handlers) — `alert` does not exist in the Node/Edge runtime and would itself throw if ever
reached.

## `resend` dependency is unused

`resend` is in `package.json` dependencies but nothing in `src/` imports it — only
`nodemailer` is actually used for email (`questions-api.ts`). Either dead weight or a
half-migrated integration; confirm before removing.

## Naming mismatches to watch for

- The "Project Activities" page/nav item stores into the `Projects` Mongo collection; the
  "Projects" page (`/project-summaries`) stores into `ProjectSummaries`. See
  `architecture.md`'s table.
- `src/utils/activity-services.ts` name doesn't match the `ActivitiesServices` export in
  other files' import style — check exact casing/name when importing.

## Cross-collection references are string-based, not `_id`-based

`projectSummaryURL`, `projectURL`, `activityURL` are slugs used as de-facto foreign keys
with no enforced integrity. Renaming a URL/slug on a parent record will silently orphan
children that reference the old value. Worth confirming with the user before doing any
bulk slug-renaming work.

## Session lifetime is short (1 hour)

`session.maxAge` in `[...nextauth].ts` is `1 * 60 * 60`. If a user reports being logged
out mid-work, this is why — not necessarily a bug, but worth knowing before "fixing" it.

#!/usr/bin/env node
// One-off helper: clears the tables populated by migrate-mongo-to-supabase.mjs so it
// can be re-run cleanly after a fix. Does NOT touch admin_allowlist or questions.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
     console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY in .env.');
     process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
     auth: { autoRefreshToken: false, persistSession: false },
});

const NEVER_MATCHES = '00000000-0000-0000-0000-000000000000';

// Order matters: project_activities before project_summaries (FK), entries before
// summaries too (though cascade would handle it, being explicit here).
const TABLES = ['project_activities', 'project_summary_entries', 'project_summaries', 'activities', 'publications'];

async function main() {
     for (const table of TABLES) {
          const { error, count } = await supabase.from(table).delete({ count: 'exact' }).neq('id', NEVER_MATCHES);
          if (error) {
               console.error(`! failed to clear ${table}: ${error.message}`);
               process.exit(1);
          }
          console.log(`cleared ${table}: ${count ?? '?'} rows deleted`);
     }
}

main();

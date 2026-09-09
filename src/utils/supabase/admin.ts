import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Privileged client for the data-access layer (src/utils/*-services.ts) and the
// storage route handler, using Supabase's secret key. Bypasses RLS — every table has
// RLS enabled with no policies, so this is the only client that can read/write them.
// Never import this into anything that runs in the browser.
export function createAdminClient() {
     return createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SECRET_KEY!,
          {
               auth: {
                    autoRefreshToken: false,
                    persistSession: false,
               },
          }
     );
}

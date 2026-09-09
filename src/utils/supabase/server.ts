import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Session-aware client for Server Components / Route Handlers — reads the signed-in
// user's cookies via the publishable key. Use this to check *who* is signed in.
export async function createClient() {
     const cookieStore = await cookies();

     return createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          {
               cookies: {
                    getAll() {
                         return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                         try {
                              cookiesToSet.forEach(({ name, value, options }) =>
                                   cookieStore.set(name, value, options)
                              );
                         } catch {
                              // Called from a Server Component render — cookies can't be set here.
                              // The session is still refreshed on every request by src/middleware.ts.
                         }
                    },
               },
          }
     );
}

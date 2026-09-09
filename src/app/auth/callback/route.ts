import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

// Supabase Auth has no NextAuth-style `signIn` callback, so the admin allowlist check
// (email must end with @gmail.com AND exist in admin_allowlist) happens here, right after
// the OAuth code exchange, mirroring the old [...nextauth].ts signIn callback.
export async function GET(request: Request) {
     const { searchParams, origin } = new URL(request.url);
     const code = searchParams.get('code');
     const next = searchParams.get('next') ?? '/';

     if (code) {
          const supabase = await createClient();
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (!error && data.user) {
               const email = data.user.email ?? '';
               const isGmail = email.toLowerCase().endsWith('@gmail.com');
               let allowed = false;

               if (isGmail) {
                    const admin = createAdminClient();
                    const { data: allowlistRow } = await admin
                         .from('admin_allowlist')
                         .select('email')
                         .eq('email', email)
                         .maybeSingle();
                    allowed = !!allowlistRow;
               }

               if (allowed) {
                    return NextResponse.redirect(`${origin}${next}`);
               }

               await supabase.auth.signOut();
          }
     }

     return NextResponse.redirect(`${origin}/auth/login?error=AccessDenied`);
}

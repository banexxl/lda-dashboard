// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function proxy(req: NextRequest) {
     const { pathname } = req.nextUrl;

     // Always allow the OAuth callback route.
     if (pathname.startsWith('/auth/callback')) {
          return NextResponse.next();
     }

     const { supabaseResponse, user } = await updateSession(req);

     // Protect all API routes.
     if (pathname.startsWith('/api')) {
          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
          return supabaseResponse;
     }

     // Allow the login page.
     if (pathname.startsWith('/auth')) {
          return supabaseResponse;
     }

     if (!user) {
          const loginUrl = req.nextUrl.clone();
          loginUrl.pathname = '/auth/login';
          loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
          return NextResponse.redirect(loginUrl);
     }

     return supabaseResponse;
}

export const config = {
     matcher: [
          '/api/:path*',
          '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js)$).*)',
     ],
};

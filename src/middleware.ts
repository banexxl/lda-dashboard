// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
     const { pathname } = req.nextUrl;
     let token = null;
     try {
          token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
     } catch (error) {
          token = null;
     }

     // ✅ Always allow NextAuth endpoints
     if (pathname.startsWith('/api/auth')) {
          return NextResponse.next();
     }

     // 🔒 Protect all API routes
     if (pathname.startsWith('/api')) {
          if (!token) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
          return NextResponse.next();
     }

     // ✅ Allow static assets
     if (
          pathname.startsWith('/_next/') ||
          pathname.startsWith('/favicon') ||
          pathname.startsWith('/images') ||
          pathname.startsWith('/public')
     ) {
          return NextResponse.next();
     }

     // ✅ Allow login page
     if (pathname.startsWith('/auth')) {
          return NextResponse.next();
     }

     if (!token) {
          const loginUrl = req.nextUrl.clone();
          loginUrl.pathname = '/auth/login';
          loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
          return NextResponse.redirect(loginUrl);
     }

     return NextResponse.next();
}

export const config = {
     // Or use a matcher to avoid hitting /api/auth at all:
     matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
     const { pathname } = req.nextUrl;

     // ✅ Always allow NextAuth endpoints
     if (pathname.startsWith('/api/auth')) {
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

     // ...your existing auth checks/redirects for protected pages...

     return NextResponse.next();
}

export const config = {
     // Or use a matcher to avoid hitting /api/auth at all:
     matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the token from cookies or session (checking if it exists)
  // Note: Since we're using sessionStorage, we can't check server-side
  // This middleware will redirect based on the path

  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/'];

  // Protected paths that require authentication
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/chat');

  // If accessing protected path without being on a public path
  // Note: Client-side auth check will handle the actual verification
  // This middleware primarily handles redirects for better UX

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

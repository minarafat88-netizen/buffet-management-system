import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/services/session';

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const sessionUser = await verifySessionToken(sessionToken);
  const path = request.nextUrl.pathname;

  if (!sessionUser) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/audit-logs/:path*',
    '/debts/:path*',
    '/expenses/:path*',
    '/inventory/:path*',
    '/products/:path*',
    '/profits/:path*',
    '/purchases/:path*',
  ],
};
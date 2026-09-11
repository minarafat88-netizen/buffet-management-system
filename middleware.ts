import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('buffet_session_token')?.value;
  const path = request.nextUrl.pathname;

  // حماية مسارات الإدارة واللوحة الرئيسية
  if (path.startsWith('/admin') || (path === '/' && !sessionToken)) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/products/:path*', '/purchases/:path*'],
};
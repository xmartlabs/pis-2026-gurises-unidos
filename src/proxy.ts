import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  hasSessionExpired,
  SESSION_EXPIRATION_COOKIE,
  SESSION_EXPIRATION_REASON,
} from '@/lib/auth/session-expiration';

const PUBLIC_ROUTES = ['/', '/login'];

export const proxy = auth((request) => {
  if (request.auth || PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.nextUrl);
  const expirationCookie = request.cookies.get(SESSION_EXPIRATION_COOKIE)?.value;

  if (hasSessionExpired(expirationCookie)) {
    loginUrl.searchParams.set('reason', SESSION_EXPIRATION_REASON);
  }

  const response = NextResponse.redirect(loginUrl);

  if (expirationCookie) {
    response.cookies.delete(SESSION_EXPIRATION_COOKIE);
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!api/auth(?:/|$)|_next/static/|_next/image$|images/project-placeholders/|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|manifest\\.webmanifest$|(?:.+/)?(?:icon|apple-icon|opengraph-image|twitter-image)\\d*(?:\\.\\w+)?$).*)',
  ],
};

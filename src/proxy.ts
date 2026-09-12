import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const PUBLIC_ROUTES = ['/', '/login'];

export const proxy = auth((request) => {
  if (request.auth || PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/login', request.nextUrl));
});

export const config = {
  matcher: [
    '/((?!api/auth(?:/|$)|_next/static/|_next/image$|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|manifest\\.webmanifest$|(?:.+/)?(?:icon|apple-icon|opengraph-image|twitter-image)\\d*(?:\\.\\w+)?$).*)',
  ],
};

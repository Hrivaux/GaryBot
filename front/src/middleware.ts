import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  if (!token && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/accueil', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /**
     * Applique le middleware à toutes les routes
     * sauf les fichiers statiques et l'API de Next.js
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)',
  ],
};

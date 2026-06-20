import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_generation_key_32_chars');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/static') ||
    pathname.match(/\.(json|png|ico|jpg|webmanifest)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('chronox_session')?.value;

  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', request.url));
    try {
      const { payload } = await jose.jwtVerify(token, SECRET);
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/game') || pathname.startsWith('/chat')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
      await jose.jwtVerify(token, SECRET);
    } catch {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('chronox_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/game/:path*', '/chat/:path*'],
};

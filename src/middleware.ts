import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Hanya jalankan middleware untuk route /admin dan turunannya
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Ambil token dari cookie
    const adminToken = request.cookies.get('admin_token')?.value;

    // Jika tidak ada token (belum login), redirect ke halaman login
    if (!adminToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

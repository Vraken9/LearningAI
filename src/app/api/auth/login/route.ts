import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Validasi sederhana: hardcoded password untuk MVP
    // Dalam produksi, sebaiknya gunakan environment variable (e.g., process.env.ADMIN_PASSWORD)
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === ADMIN_PASSWORD) {
      // Set cookie auth
      const cookieStore = await cookies();
      cookieStore.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Password salah' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal' },
      { status: 500 }
    );
  }
}

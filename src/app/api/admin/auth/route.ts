// ============================================
// Radha Bali - Admin Authentication API Route
// POST: Login with progressive lockout cooldown
// GET: Verify session
// DELETE: Logout
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_CREDENTIALS,
  checkLockout,
  recordFailedAttempt,
  resetAttempts,
  createSessionToken,
  verifySessionToken,
} from '@/lib/admin-auth';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1';
}

// GET: Check session status
export async function GET(req: NextRequest) {
  const token = req.cookies.get('radha_admin_session')?.value;
  const result = verifySessionToken(token);

  if (!result.valid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: result.email,
  });
}

// POST: Authenticate Admin
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const identifier = `${ip}:${email.trim().toLowerCase()}`;

    // 1. Check if currently locked out
    const lockoutStatus = checkLockout(identifier);
    if (lockoutStatus.isLocked) {
      return NextResponse.json(
        {
          error: `Akses ditangguhkan sementara demi keamanan. Silakan tunggu ${lockoutStatus.retryAfterSeconds} detik sebelum mencoba kembali.`,
          retryAfterSeconds: lockoutStatus.retryAfterSeconds,
          isLocked: true,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(lockoutStatus.retryAfterSeconds),
          },
        }
      );
    }

    // 2. Validate credentials
    const isEmailMatch = email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
    const isPasswordMatch = password === ADMIN_CREDENTIALS.password;

    if (!isEmailMatch || !isPasswordMatch) {
      // Record failure and calculate new lockout status
      const updatedStatus = recordFailedAttempt(identifier);

      if (updatedStatus.isLocked) {
        return NextResponse.json(
          {
            error: `Terlalu banyak percobaan gagal. Akses dikunci selama ${updatedStatus.retryAfterSeconds} detik demi alasan keamanan.`,
            retryAfterSeconds: updatedStatus.retryAfterSeconds,
            isLocked: true,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(updatedStatus.retryAfterSeconds),
            },
          }
        );
      }

      return NextResponse.json(
        {
          error: `Email atau kata sandi tidak valid. Sisa percobaan: ${updatedStatus.attemptsRemaining} kali sebelum jeda waktu diberlakukan.`,
          attemptsRemaining: updatedStatus.attemptsRemaining,
          isLocked: false,
        },
        { status: 401 }
      );
    }

    // 3. Success: Reset failed attempts & issue session cookie
    resetAttempts(identifier);
    const token = createSessionToken(email.trim().toLowerCase());

    const response = NextResponse.json({
      success: true,
      message: 'Autentikasi admin berhasil.',
      user: email.trim().toLowerCase(),
    });

    response.cookies.set({
      name: 'radha_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses autentikasi.' },
      { status: 500 }
    );
  }
}

// DELETE: Logout
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesi admin telah diakhiri.',
  });

  response.cookies.delete('radha_admin_session');
  return response;
}

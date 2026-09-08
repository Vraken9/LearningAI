// ============================================
// Radha Bali - Admin Authentication & Lockout Security
// Rate limiting, progressive cooldown delay, and secure session management
// ============================================

import crypto from 'crypto';

// Admin credentials (configurable via .env or secure defaults)
export const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@radhabali.com',
  password: process.env.ADMIN_PASSWORD || 'RadhaBali#2026!SecureGate',
};

const SESSION_SECRET = process.env.SESSION_SECRET || 'radha_bali_super_secure_session_secret_2026';
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Lockout tracking entry
interface AttemptRecord {
  failures: number;
  lockedUntil: number; // timestamp ms
  lastAttempt: number;
}

// In-memory lockout cache (keyed by client IP + email)
const attemptsMap = new Map<string, AttemptRecord>();

// Clean up stale attempt records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attemptsMap.entries()) {
    if (now - record.lastAttempt > 30 * 60 * 1000 && record.lockedUntil < now) {
      attemptsMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface LockoutStatus {
  isLocked: boolean;
  retryAfterSeconds: number;
  attemptsRemaining: number;
}

/**
 * Checks if client is currently in lockout cooldown
 */
export function checkLockout(identifier: string): LockoutStatus {
  const record = attemptsMap.get(identifier);
  const now = Date.now();

  if (!record) {
    return {
      isLocked: false,
      retryAfterSeconds: 0,
      attemptsRemaining: 5,
    };
  }

  if (record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      isLocked: true,
      retryAfterSeconds,
      attemptsRemaining: 0,
    };
  }

  // Lockout expired, reset if failures reached limit
  if (record.failures >= 5) {
    record.failures = 3; // soft decay after long lockout
  }

  const attemptsRemaining = Math.max(0, 5 - record.failures);
  return {
    isLocked: false,
    retryAfterSeconds: 0,
    attemptsRemaining,
  };
}

/**
 * Records a failed login attempt and calculates progressive cooldown
 */
export function recordFailedAttempt(identifier: string): LockoutStatus {
  const now = Date.now();
  const record = attemptsMap.get(identifier) || {
    failures: 0,
    lockedUntil: 0,
    lastAttempt: now,
  };

  record.failures += 1;
  record.lastAttempt = now;

  let cooldownMs = 0;
  if (record.failures >= 5) {
    // 5+ failures: 5 minutes lockout (300 seconds)
    cooldownMs = 300 * 1000;
  } else if (record.failures >= 3) {
    // 3-4 failures: 30 seconds cooldown
    cooldownMs = 30 * 1000;
  }

  record.lockedUntil = now + cooldownMs;
  attemptsMap.set(identifier, record);

  const retryAfterSeconds = Math.ceil(cooldownMs / 1000);
  const attemptsRemaining = Math.max(0, 5 - record.failures);

  return {
    isLocked: cooldownMs > 0,
    retryAfterSeconds,
    attemptsRemaining,
  };
}

/**
 * Resets failed attempts after successful login
 */
export function resetAttempts(identifier: string): void {
  attemptsMap.delete(identifier);
}

/**
 * Creates signed session token: base64(email:timestamp:signature)
 */
export function createSessionToken(email: string): string {
  const timestamp = Date.now();
  const payload = `${email}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

/**
 * Verifies session token integrity and validity
 */
export function verifySessionToken(token: string | undefined): { valid: boolean; email?: string } {
  if (!token) return { valid: false };

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email, timestampStr, signature] = decoded.split(':');

    if (!email || !timestampStr || !signature) {
      return { valid: false };
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE_MS) {
      return { valid: false }; // expired
    }

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`${email}:${timestampStr}`)
      .digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: true, email };
    }
  } catch {
    // Token malformed
  }

  return { valid: false };
}

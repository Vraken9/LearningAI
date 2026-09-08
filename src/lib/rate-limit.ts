// ============================================
// Radha Bali - Rate Limiting
// Sliding window rate limiter using Supabase
// ============================================

import { getServerSupabaseClient } from './supabase';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const supabase = getServerSupabaseClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  try {
    // Get current rate limit entry
    const { data: rawData } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('key', key)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = rawData as any;

    if (!existing || new Date(existing.window_start) < windowStart) {
      // Window expired or no entry — reset
      await supabase.from('rate_limits').upsert({
        key,
        count: 1,
        window_start: now.toISOString(),
      } as Record<string, unknown>);

      return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - 1,
        resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS),
      };
    }

    // Window still active
    const newCount = (existing.count || 0) + 1;

    if (newCount > MAX_REQUESTS_PER_WINDOW) {
      const resetAt = new Date(new Date(existing.window_start).getTime() + RATE_LIMIT_WINDOW_MS);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Increment counter
    await supabase
      .from('rate_limits')
      .update({ count: newCount } as Record<string, unknown>)
      .eq('key', key);

    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - newCount,
      resetAt: new Date(new Date(existing.window_start).getTime() + RATE_LIMIT_WINDOW_MS),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW,
      resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS),
    };
  }
}

// Get client identifier from request headers
export function getClientKey(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
  return `rate_limit:${ip}`;
}

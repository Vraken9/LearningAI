// ============================================
// Radha Bali - Response Caching
// Hash-based caching using Supabase
// ============================================

import { getServerSupabaseClient } from './supabase';
import type { ChatResponse } from './types';

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

// Create a hash of the input for cache key
async function hashKey(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getCachedResponse(message: string): Promise<ChatResponse | null> {
  try {
    const supabase = getServerSupabaseClient();
    const key = await hashKey(message);

    const { data, error } = await supabase
      .from('cache')
      .select('response, expires_at, hit_count')
      .eq('key', key)
      .single();

    if (error || !data) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = data as any;

    // Check expiry
    if (new Date(row.expires_at) < new Date()) {
      // Expired — delete and return null
      await supabase.from('cache').delete().eq('key', key);
      return null;
    }

    // Increment hit count (fire and forget)
    supabase
      .from('cache')
      .update({ hit_count: (row.hit_count || 0) + 1 })
      .eq('key', key)
      .then(() => {});

    return row.response as ChatResponse;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCachedResponse(
  message: string,
  response: ChatResponse,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<void> {
  try {
    const supabase = getServerSupabaseClient();
    const key = await hashKey(message);

    await supabase.from('cache').upsert({
      key,
      response: response as unknown,
      hit_count: 0,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + ttlMs).toISOString(),
    } as Record<string, unknown>);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

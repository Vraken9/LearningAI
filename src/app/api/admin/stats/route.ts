// ============================================
// Radha Bali - Admin API Routes
// GET /api/admin/stats - Dashboard statistics
// ============================================

import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServerSupabaseClient();

    // Fetch stats in parallel
    const [
      productsResult,
      activeProductsResult,
      documentsResult,
      conversationsResult,
      conversationsTodayResult,
      cacheResult,
    ] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('documents').select('id', { count: 'exact', head: true }),
      supabase.from('conversations').select('id', { count: 'exact', head: true }),
      supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase.from('cache').select('key, hit_count'),
    ]);

    // Calculate cache hit rate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cacheEntries = (cacheResult.data || []) as any[];
    const totalHits = cacheEntries.reduce((sum: number, e: { hit_count: number }) => sum + (e.hit_count || 0), 0);
    const cacheHitRate = cacheEntries.length > 0 ? Math.round((totalHits / Math.max(totalHits + cacheEntries.length, 1)) * 100) : 0;

    return NextResponse.json({
      total_products: productsResult.count || 0,
      active_products: activeProductsResult.count || 0,
      total_documents: documentsResult.count || 0,
      total_conversations: conversationsResult.count || 0,
      conversations_today: conversationsTodayResult.count || 0,
      cache_entries: cacheEntries.length,
      cache_hit_rate: cacheHitRate,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

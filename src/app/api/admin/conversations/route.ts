// ============================================
// Radha Bali - Admin Conversations API
// View conversation history
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase';

// GET - List conversations
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('conversations')
      .select('id, session_id, message_count, last_activity, created_at, metadata', { count: 'exact' })
      .order('last_activity', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      conversations: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Admin conversations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

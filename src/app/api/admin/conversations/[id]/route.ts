// ============================================
// Radha Bali - Admin Conversation Detail API
// GET /api/admin/conversations/[id]
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServerSupabaseClient();

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation: data });
  } catch (error) {
    console.error('Conversation detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

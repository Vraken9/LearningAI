// ============================================
// Radha Bali - GET /api/health
// Health check endpoint
// ============================================

import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const status = {
    status: 'ok' as 'ok' | 'error',
    timestamp: new Date().toISOString(),
    services: {
      database: false,
      gemini: false,
    },
  };

  // Check database connectivity
  try {
    const supabase = getServerSupabaseClient();
    const { error } = await supabase.from('products').select('id').limit(1);
    status.services.database = !error;
  } catch {
    status.services.database = false;
  }

  // Check Gemini API key presence
  status.services.gemini = !!process.env.GEMINI_API_KEY;

  // Overall status
  status.status = status.services.database && status.services.gemini ? 'ok' : 'error';

  const httpStatus = status.status === 'ok' ? 200 : 503;
  return NextResponse.json(status, { status: httpStatus });
}

// ============================================
// Radha Bali - POST /api/embed
// Admin endpoint to embed documents
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/gemini';
import { getServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access via service key header
    const authHeader = request.headers.get('authorization');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { texts, metadata = {}, source_type = 'guide', title = '' } = body as {
      texts: string[];
      metadata?: Record<string, unknown>;
      source_type?: string;
      title?: string;
    };

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts array is required' }, { status: 400 });
    }

    const supabase = getServerSupabaseClient();
    let successCount = 0;

    for (let i = 0; i < texts.length; i++) {
      try {
        const embedding = await generateEmbedding(texts[i]);

        const { error } = await supabase.from('documents').insert({
          title: title || `Document ${i + 1}`,
          content: texts[i],
          metadata,
          embedding: JSON.stringify(embedding),
          chunk_index: i,
          source_type,
        } as Record<string, unknown>);

        if (!error) successCount++;
      } catch (err) {
        console.error(`Error embedding text ${i}:`, err);
      }

      // Rate limit delay
      if (i < texts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      total: texts.length,
    });
  } catch (error) {
    console.error('Embed API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

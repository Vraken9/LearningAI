// ============================================
// Radha Bali - Admin Documents API
// CRUD operations for knowledge base documents
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/gemini';

// GET - List all documents
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const source_type = searchParams.get('source_type') || '';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('documents')
      .select('id, title, content, metadata, source_type, chunk_index, created_at', { count: 'exact' });

    if (source_type) {
      query = query.eq('source_type', source_type);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      documents: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Admin documents GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new document with embedding
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    const body = await request.json();
    const { title, content, source_type, metadata } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Generate embedding
    let embedding: number[] | null = null;
    try {
      embedding = await generateEmbedding(content);
    } catch (err) {
      console.error('Failed to generate embedding:', err);
      // Continue without embedding — can be re-embedded later
    }

    const insertData: Record<string, unknown> = {
      title: title || 'Untitled',
      content,
      source_type: source_type || 'guide',
      metadata: metadata || {},
      chunk_index: 0,
    };

    if (embedding) {
      insertData.embedding = JSON.stringify(embedding);
    }

    const { data, error } = await supabase
      .from('documents')
      .insert(insertData)
      .select('id, title, content, metadata, source_type, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      document: data,
      embedded: !!embedding,
    }, { status: 201 });
  } catch (error) {
    console.error('Admin documents POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a document (re-embeds content)
export async function PUT(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Re-generate embedding if content changed
    if (updates.content) {
      try {
        const embedding = await generateEmbedding(updates.content);
        updates.embedding = JSON.stringify(embedding);
      } catch (err) {
        console.error('Failed to re-generate embedding:', err);
      }
    }

    const { data, error } = await supabase
      .from('documents')
      .update(updates as Record<string, unknown>)
      .eq('id', id)
      .select('id, title, content, metadata, source_type, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ document: data });
  } catch (error) {
    console.error('Admin documents PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Hard delete a document
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin documents DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

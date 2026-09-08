// ============================================
// Radha Bali - GET /api/products
// Public products listing endpoint
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get('category');
    const destination = searchParams.get('destination');
    const limit = parseInt(searchParams.get('limit') || '20');
    const featured = searchParams.get('featured');

    let query = supabase
      .from('products')
      .select('id, name, slug, category, destination, region, price, price_per_person, duration_days, highlights, short_description, image_url, rating, review_count')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (destination) {
      query = query.ilike('destination', `%${destination}%`);
    }

    if (featured === 'true') {
      query = query.gte('rating', 4.5);
    }

    query = query.order('rating', { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({
      products: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// Radha Bali - Tool Handlers
// Execute function calls from Gemini
// ============================================

import { getServerSupabaseClient } from './supabase';
import { generateEmbedding } from './gemini';
import type {
  SearchProductsParams,
  SearchKnowledgeParams,
  GetProductDetailParams,
  ProductCard,
  VectorSearchResult,
} from './types';

// ---- search_products handler ----
export async function searchProducts(params: SearchProductsParams): Promise<{
  products: ProductCard[];
  total: number;
}> {
  const supabase = getServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = supabase
    .from('products')
    .select('id, name, slug, price, price_per_person, image_url, destination, region, duration_days, rating, short_description, highlights, category')
    .eq('is_active', true);

  // Apply destination filter only if it's not a generic "Bali" query
  if (params.destination) {
    const destClean = params.destination.trim().toLowerCase();
    const isGenericBali = destClean === 'bali' || destClean === 'pulau bali' || destClean === 'bali island';
    if (!isGenericBali) {
      query = query.or(`destination.ilike.%${params.destination}%,region.ilike.%${params.destination}%`);
    }
  }

  if (params.region && params.region.trim().toLowerCase() !== 'bali') {
    query = query.ilike('region', `%${params.region}%`);
  }

  if (params.category) {
    query = query.eq('category', params.category);
  }
  if (params.max_price !== undefined) {
    query = query.lte('price', params.max_price);
  }
  if (params.min_price !== undefined) {
    query = query.gte('price', params.min_price);
  }
  if (params.max_duration !== undefined) {
    query = query.lte('duration_days', params.max_duration);
  }
  if (params.min_duration !== undefined) {
    query = query.gte('duration_days', params.min_duration);
  }

  // Fetch active products before limiting so all matching packages (e.g. Amed, Menjangan) are evaluated
  const { data, error } = await query;

  if (error) {
    console.error('Error searching products:', error);
    return { products: [], total: 0 };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products = ((data || []) as any[]).map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    price: d.price,
    price_per_person: d.price_per_person,
    image_url: d.image_url,
    destination: d.destination,
    duration_days: d.duration_days,
    rating: d.rating,
    short_description: d.short_description,
    highlights: d.highlights || [],
  })) as ProductCard[];

  // Collect keywords from params.query and params.interests
  const searchKeywords: string[] = [];
  if (params.query) {
    const tokens = params.query
      .toLowerCase()
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && t !== 'paket' && t !== 'wisata' && t !== 'bali');
    searchKeywords.push(...tokens);
  }
  if (params.interests && params.interests.length > 0) {
    for (const interest of params.interests) {
      const lower = interest.toLowerCase().trim();
      if (lower && !searchKeywords.includes(lower)) {
        searchKeywords.push(lower);
      }
    }
  }

  if (searchKeywords.length > 0) {
    const scoredProducts = products
      .map((p) => {
        let score = 0;
        const nameLower = (p.name || '').toLowerCase();
        const descLower = (p.short_description || '').toLowerCase();
        const destLower = (p.destination || '').toLowerCase();
        const highlightsLower = (p.highlights || []).map((h) => h.toLowerCase());

        for (const kw of searchKeywords) {
          // Exact or substring match in name (highest priority)
          if (nameLower.includes(kw)) score += 12;
          // Match in highlights tags
          if (highlightsLower.some((h) => h.includes(kw) || kw.includes(h))) score += 10;
          // Match in short description
          if (descLower.includes(kw)) score += 6;
          // Match in destination
          if (destLower.includes(kw)) score += 4;
        }

        return { product: p, score };
      })
      .filter((item) => item.score > 0);

    // If matches found, sort by relevance score DESC then rating DESC
    if (scoredProducts.length > 0) {
      if (params.sort_by === 'price_asc') {
        scoredProducts.sort((a, b) => a.product.price - b.product.price);
      } else if (params.sort_by === 'price_desc') {
        scoredProducts.sort((a, b) => b.product.price - a.product.price);
      } else if (params.sort_by === 'duration') {
        scoredProducts.sort((a, b) => a.product.duration_days - b.product.duration_days);
      } else {
        scoredProducts.sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);
      }
      products = scoredProducts.map((item) => item.product);
    }
  } else {
    // Standard sorting if no keyword filter
    switch (params.sort_by) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'duration':
        products.sort((a, b) => a.duration_days - b.duration_days);
        break;
      case 'rating':
      default:
        products.sort((a, b) => b.rating - a.rating);
        break;
    }
  }

  const limit = params.limit || 5;
  const limitedProducts = products.slice(0, limit);

  return { products: limitedProducts, total: products.length };
}

// ---- search_knowledge handler (RAG) ----
export async function searchKnowledge(params: SearchKnowledgeParams): Promise<{
  results: VectorSearchResult[];
  context: string;
}> {
  const supabase = getServerSupabaseClient();

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(params.query);

    // Vector similarity search via stored function
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.4,
      match_count: params.limit || 3,
    });

    if (error) {
      console.error('Error in vector search:', error);
      // Fallback: text search
      return fallbackTextSearch(params);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = ((data || []) as any[]).map((d) => ({
      id: d.id,
      title: d.title,
      content: d.content,
      metadata: d.metadata,
      similarity: d.similarity,
    })) as VectorSearchResult[];

    // Build context string for LLM
    const context = results
      .map((r, i) => `[Sumber ${i + 1}: ${r.title}]\n${r.content}`)
      .join('\n\n');

    return { results, context };
  } catch (err) {
    console.error('Error in search_knowledge:', err);
    return fallbackTextSearch(params);
  }
}

// Fallback text search when vector search fails
async function fallbackTextSearch(params: SearchKnowledgeParams): Promise<{
  results: VectorSearchResult[];
  context: string;
}> {
  const supabase = getServerSupabaseClient();

  let query = supabase
    .from('documents')
    .select('id, title, content, metadata')
    .ilike('content', `%${params.query}%`);

  if (params.source_type) {
    query = query.eq('source_type', params.source_type);
  }

  const { data, error } = await query.limit(params.limit || 3);

  if (error) {
    console.error('Error in fallback text search:', error);
    return { results: [], context: '' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = ((data || []) as any[]).map((d) => ({
    id: d.id,
    title: d.title,
    content: d.content,
    metadata: d.metadata,
    similarity: 0.5,
  })) as VectorSearchResult[];

  const context = results
    .map((r, i) => `[Sumber ${i + 1}: ${r.title}]\n${r.content}`)
    .join('\n\n');

  return { results, context };
}

// ---- get_product_detail handler ----
export async function getProductDetail(params: GetProductDetailParams): Promise<{
  product: Record<string, unknown> | null;
}> {
  const supabase = getServerSupabaseClient();

  let query = supabase.from('products').select('*').eq('is_active', true);

  if (params.product_name) {
    query = query.ilike('name', `%${params.product_name}%`);
  }

  const { data, error } = await query.limit(1).single();

  if (error) {
    console.error('Error getting product detail:', error);
    return { product: null };
  }

  return { product: data as Record<string, unknown> };
}

// ---- Master tool executor ----
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<{ result: unknown; products?: ProductCard[] }> {
  switch (toolName) {
    case 'search_products': {
      const result = await searchProducts(args as unknown as SearchProductsParams);
      return { result, products: result.products };
    }
    case 'search_knowledge': {
      const result = await searchKnowledge(args as unknown as SearchKnowledgeParams);
      return { result: result.context || 'Tidak ditemukan informasi yang relevan.' };
    }
    case 'get_product_detail': {
      const result = await getProductDetail(args as unknown as GetProductDetailParams);
      return { result };
    }
    default:
      return { result: `Unknown tool: ${toolName}` };
  }
}

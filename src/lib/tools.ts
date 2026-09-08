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
    .select('id, name, slug, price, price_per_person, image_url, destination, duration_days, rating, short_description, highlights')
    .eq('is_active', true);

  // Apply filters
  if (params.destination) {
    query = query.ilike('destination', `%${params.destination}%`);
  }
  if (params.region) {
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

  // Sort
  switch (params.sort_by) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'duration':
      query = query.order('duration_days', { ascending: true });
      break;
    default:
      query = query.order('rating', { ascending: false });
  }

  // Limit
  const limit = params.limit || 5;
  query = query.limit(limit);

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

  // Filter by interests (array overlap) — done in JS since Supabase
  // doesn't have a simple "any of these values in array" filter
  if (params.interests && params.interests.length > 0) {
    const interestsLower = params.interests.map((i) => i.toLowerCase());
    products = products.filter((p) =>
      p.highlights.some((h) => interestsLower.some((interest) => h.toLowerCase().includes(interest))),
    );
  }

  return { products, total: products.length };
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

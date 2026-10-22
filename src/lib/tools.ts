// ============================================
// Radha Bali - Tool Handlers
// Execute function calls from Gemini
// ============================================

import { getServerSupabaseClient } from './supabase';
import { generateEmbedding } from './gemini';
import { seedProducts } from '@/data/seed-products';
import { seedDocuments } from '@/data/seed-knowledge';
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
  let products: ProductCard[] = [];

  try {
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

    if (!error && data && data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products = ((data || []) as any[]).map((d) => ({
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
    }
  } catch (dbErr) {
    console.warn('Database access in searchProducts unavailable, using local catalog:', dbErr);
  }

  // Resilient fallback: If database is offline or empty, load from seedProducts
  if (products.length === 0) {
    products = seedProducts.map((p, idx) => ({
      id: `seed-${idx}-${p.slug}`,
      name: p.name,
      slug: p.slug,
      price: p.price,
      price_per_person: p.price_per_person,
      image_url: p.image_url,
      destination: p.destination,
      duration_days: p.duration_days,
      rating: p.rating,
      short_description: p.short_description,
      highlights: p.highlights || [],
    }));

    if (params.destination) {
      const destClean = params.destination.trim().toLowerCase();
      const isGenericBali = destClean === 'bali' || destClean === 'pulau bali' || destClean === 'bali island';
      if (!isGenericBali) {
        products = products.filter(
          (p) =>
            p.destination.toLowerCase().includes(destClean) ||
            p.name.toLowerCase().includes(destClean),
        );
      }
    }
    if (params.max_price !== undefined) {
      products = products.filter((p) => p.price <= params.max_price!);
    }
    if (params.min_price !== undefined) {
      products = products.filter((p) => p.price >= params.min_price!);
    }
    if (params.max_duration !== undefined) {
      products = products.filter((p) => p.duration_days <= params.max_duration!);
    }
    if (params.min_duration !== undefined) {
      products = products.filter((p) => p.duration_days >= params.min_duration!);
    }
  }

  // Collect keywords from params.query and params.interests with smart typo correction & stopword removal
  const STOPWORDS = new Set([
    'dan', 'atau', 'yang', 'untuk', 'dengan', 'dari', 'ke', 'di', 'ini', 'itu',
    'paket', 'wisata', 'rekomendasi', 'rekomendasikan', 'tolong', 'minta', 'mau',
    'ingin', 'ada', 'bisa', 'bali', 'pulau', 'saya', 'kami', 'apa', 'saja', 'dong', 'spot'
  ]);

  const searchKeywords: string[] = [];
  if (params.query) {
    const rawTokens = params.query.toLowerCase().split(/[\s,]+/);
    for (let t of rawTokens) {
      t = t.trim().replace(/[^a-z0-9]/g, '');
      if (!t || STOPWORDS.has(t) || t.length < 3) continue;

      // Typo normalization for common travel terms
      if (t.includes('sork') || t.includes('snor') || t.includes('snork')) {
        searchKeywords.push('snorkeling');
        continue;
      }
      if (t.includes('freedic') || t.includes('freediv') || t.includes('freedive')) {
        searchKeywords.push('freediving', 'diving');
        continue;
      }
      if (t.includes('divin') || t.includes('selam')) {
        searchKeywords.push('diving');
        continue;
      }

      searchKeywords.push(t);
    }
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

// Fallback text search when vector search fails or database is unreachable
async function fallbackTextSearch(params: SearchKnowledgeParams): Promise<{
  results: VectorSearchResult[];
  context: string;
}> {
  try {
    const supabase = getServerSupabaseClient();
    let query = supabase
      .from('documents')
      .select('id, title, content, metadata')
      .ilike('content', `%${params.query}%`);

    if (params.source_type) {
      query = query.eq('source_type', params.source_type);
    }

    const { data, error } = await query.limit(params.limit || 3);

    if (!error && data && data.length > 0) {
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
  } catch (err) {
    console.warn('Database fallbackTextSearch unavailable, using local knowledge base:', err);
  }

  // Resilient fallback: search local seed documents by keywords
  const qTokens = params.query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((t) => t.length > 2);

  const scoredDocs = seedDocuments
    .map((doc, idx) => {
      let score = 0;
      const text = `${doc.title} ${doc.content}`.toLowerCase();
      for (const t of qTokens) {
        if (text.includes(t)) score += 5;
      }
      return { doc, score, idx };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, params.limit || 3);

  const docsToUse =
    scoredDocs.length > 0 ? scoredDocs.map((d) => d.doc) : seedDocuments.slice(0, params.limit || 3);

  const results: VectorSearchResult[] = docsToUse.map((doc, idx) => ({
    id: idx + 1,
    title: doc.title,
    content: doc.content,
    metadata: doc.metadata,
    similarity: 0.7,
  }));

  const context = results
    .map((r, i) => `[Sumber ${i + 1}: ${r.title}]\n${r.content}`)
    .join('\n\n');

  return { results, context };
}

// ---- get_product_detail handler ----
export async function getProductDetail(params: GetProductDetailParams): Promise<{
  product: Record<string, unknown> | null;
}> {
  try {
    const supabase = getServerSupabaseClient();
    let query = supabase.from('products').select('*').eq('is_active', true);

    if (params.product_name) {
      query = query.ilike('name', `%${params.product_name}%`);
    }

    const { data, error } = await query.limit(1).single();

    if (!error && data) {
      return { product: data as Record<string, unknown> };
    }
  } catch (err) {
    console.warn('Database getProductDetail unavailable, using local seed catalog:', err);
  }

  // Resilient fallback from local seedProducts
  if (params.product_name) {
    const searchName = params.product_name.toLowerCase();
    const found = seedProducts.find(
      (p) => p.name.toLowerCase().includes(searchName) || p.slug.includes(searchName),
    );
    if (found) {
      return { product: found as unknown as Record<string, unknown> };
    }
  }

  return { product: (seedProducts[0] || null) as unknown as Record<string, unknown> };
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

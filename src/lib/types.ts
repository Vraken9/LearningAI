// ============================================
// Radha Bali - TypeScript Type Definitions
// ============================================

// ---- Database Models ----

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  destination: string;
  region: string;
  price: number;
  price_per_person: boolean;
  duration_days: number;
  highlights: string[];
  description: string;
  short_description: string;
  image_url: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  max_participants: number | null;
  includes: string[];
  excludes: string[];
  created_at: string;
  updated_at: string;
}

export type ProductCategory = 'paket_wisata' | 'hotel' | 'transport' | 'aktivitas';

export interface Document {
  id: number;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[];
  chunk_index: number;
  source_type: DocumentSourceType;
  created_at: string;
}

export type DocumentSourceType = 'faq' | 'guide' | 'policy' | 'description' | 'tips';

export interface DocumentMetadata {
  product_id?: string;
  source?: string;
  category?: string;
  [key: string]: unknown;
}

export interface Conversation {
  id: string;
  session_id: string;
  messages: ChatMessage[];
  message_count: number;
  last_activity: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CacheEntry {
  key: string;
  response: ChatResponse;
  hit_count: number;
  created_at: string;
  expires_at: string;
}

export interface RateLimit {
  key: string;
  count: number;
  window_start: string;
}

// ---- Chat Types ----

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: ProductCard[];
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  products: ProductCard[];
  session_id: string;
}

export interface ProductCard {
  id: string;
  name: string;
  slug?: string;
  price: number;
  price_per_person: boolean;
  image_url: string;
  destination: string;
  duration_days: number;
  rating: number;
  short_description: string;
  highlights: string[];
}

// ---- Gemini Types ----

export interface GeminiToolDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiFunctionResponse {
  name: string;
  response: {
    result: unknown;
  };
}

// ---- Tool Parameter Types ----

export interface SearchProductsParams {
  destination?: string;
  region?: string;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  interests?: string[];
  category?: ProductCategory;
  sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'duration';
  limit?: number;
}

export interface SearchKnowledgeParams {
  query: string;
  source_type?: DocumentSourceType;
  limit?: number;
}

export interface GetProductDetailParams {
  product_id?: string;
  product_name?: string;
}

export interface CompareProductsParams {
  product_ids: string[];
}

// ---- Vector Search Result ----

export interface VectorSearchResult {
  id: number;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  similarity: number;
}

// ---- API Response Types ----

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    database: boolean;
    gemini: boolean;
  };
}

// ---- Admin Types ----

export interface AdminStats {
  total_products: number;
  active_products: number;
  total_documents: number;
  total_conversations: number;
  conversations_today: number;
  cache_hit_rate: number;
}

export interface ProductFormData {
  name: string;
  category: ProductCategory;
  destination: string;
  region: string;
  price: number;
  price_per_person: boolean;
  duration_days: number;
  highlights: string[];
  description: string;
  short_description: string;
  image_url: string;
  max_participants: number | null;
  includes: string[];
  excludes: string[];
  is_active: boolean;
}

export interface DocumentFormData {
  title: string;
  content: string;
  source_type: DocumentSourceType;
  metadata: DocumentMetadata;
}

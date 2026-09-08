-- ============================================
-- Radha Bali - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. Products Table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('paket_wisata', 'hotel', 'transport', 'aktivitas')),
  destination TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Bali',
  price NUMERIC NOT NULL CHECK (price >= 0),
  price_per_person BOOLEAN DEFAULT true,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  highlights TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER CHECK (max_participants IS NULL OR max_participants > 0),
  includes TEXT[] DEFAULT '{}',
  excludes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Documents Table (for RAG / Knowledge Base)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(768),
  chunk_index INTEGER DEFAULT 0,
  source_type TEXT DEFAULT 'guide' CHECK (source_type IN ('faq', 'guide', 'policy', 'description', 'tips')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Conversations Table
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  message_count INTEGER DEFAULT 0 CHECK (message_count >= 0),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Cache Table
-- ============================================
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  response JSONB NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- ============================================
-- 5. Rate Limits Table
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_destination ON products(destination);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_region ON products(region);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- HNSW index for fast vector similarity search
-- Better than IVFFlat for datasets < 100k rows
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON conversations(last_activity);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);

-- ============================================
-- Functions
-- ============================================

-- Vector similarity search for RAG
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.content,
    d.metadata,
    (1 - (d.embedding <=> query_embedding))::FLOAT AS similarity
  FROM documents d
  WHERE d.embedding IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for products updated_at
DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (our API routes use service role key)
CREATE POLICY "Service role has full access to products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to documents"
  ON documents FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to conversations"
  ON conversations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to cache"
  ON cache FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to rate_limits"
  ON rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);

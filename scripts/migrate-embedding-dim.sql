-- ============================================
-- Radha Bali - Migration: Fix embedding dimension
-- Run this in Supabase SQL Editor
-- ============================================
-- gemini-embedding-2 outputs 3072 dims natively,
-- but we use outputDimensionality: 768 to stay
-- within HNSW index limit (max 2000 dims).
-- ============================================

-- Drop the old HNSW index first
DROP INDEX IF EXISTS idx_documents_embedding;

-- Ensure column is VECTOR(768)
ALTER TABLE documents ALTER COLUMN embedding TYPE VECTOR(768);

-- Drop and recreate match_documents function
DROP FUNCTION IF EXISTS match_documents;

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
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Recreate HNSW index
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

SELECT 'Migration complete! Embedding dimension: 768' AS status;

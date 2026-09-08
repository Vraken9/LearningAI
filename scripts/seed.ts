// ============================================
// Radha Bali - Seed Script
// Seeds products and knowledge base documents
// Run with: npx tsx scripts/seed.ts
// ============================================

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ---- Import seed data ----
// We inline the data here to avoid TS path alias issues in scripts

interface SeedProduct {
  name: string;
  slug: string;
  category: string;
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
  max_participants: number | null;
  includes: string[];
  excludes: string[];
  is_active: boolean;
}

interface SeedDocument {
  title: string;
  content: string;
  source_type: string;
  metadata: Record<string, unknown>;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  return result.embedding.values;
}

async function seedProducts() {
  console.log('\n📦 Seeding products...');

  // Dynamically import seed data
  const { seedProducts: products } = await import('../src/data/seed-products');

  let successCount = 0;
  for (const product of products) {
    const { error } = await supabase.from('products').upsert(
      {
        ...product,
      },
      { onConflict: 'slug' },
    );

    if (error) {
      console.error(`  ❌ Error inserting "${product.name}":`, error.message);
    } else {
      console.log(`  ✅ ${product.name}`);
      successCount++;
    }
  }

  console.log(`\n📦 Products seeded: ${successCount}/${products.length}`);
  return successCount;
}

async function seedKnowledge() {
  console.log('\n📚 Seeding knowledge base documents with embeddings...');
  console.log('   (This may take a few minutes due to embedding API rate limits)\n');

  const { seedDocuments: documents } = await import('../src/data/seed-knowledge');

  let successCount = 0;
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const progress = `[${i + 1}/${documents.length}]`;

    try {
      // Check if document already exists
      const { data: existing } = await supabase.from('documents').select('id').eq('title', doc.title).limit(1);
      if (existing && existing.length > 0) {
        console.log(`  ${progress} "${doc.title}" already exists, skipping ⏩`);
        successCount++;
        continue;
      }

      // Generate embedding
      process.stdout.write(`  ${progress} Embedding "${doc.title}"...`);
      const embedding = await generateEmbedding(doc.content);

      // Insert with embedding
      const { error } = await supabase.from('documents').insert({
        title: doc.title,
        content: doc.content,
        metadata: doc.metadata,
        embedding: JSON.stringify(embedding),
        chunk_index: 0,
        source_type: doc.source_type,
      });

      if (error) {
        console.log(` ❌ ${error.message}`);
      } else {
        console.log(` ✅`);
        successCount++;
      }

      // Rate limit delay (Gemini free tier: ~60 req/min)
      if (i < documents.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    } catch (err) {
      console.log(` ❌ ${(err as Error).message}`);
    }
  }

  console.log(`\n📚 Documents seeded: ${successCount}/${documents.length}`);
  return successCount;
}

async function main() {
  console.log('🌴 Radha Bali - Database Seeding');
  console.log('================================\n');

  // Check database connection
  console.log('🔌 Checking database connection...');
  const { error: connError } = await supabase.from('products').select('id').limit(1);
  if (connError) {
    console.error('❌ Database connection failed:', connError.message);
    console.error('\n💡 Make sure you have run the setup-db.sql script in Supabase SQL Editor first!');
    process.exit(1);
  }
  console.log('✅ Database connected\n');

  // Check Gemini API
  console.log('🤖 Checking Gemini API...');
  try {
    const testEmbed = await generateEmbedding('test');
    if (testEmbed.length === 768) {
      console.log('✅ Gemini API working (embedding dimension: 768)\n');
    } else {
      console.error(`❌ Unexpected embedding dimension: ${testEmbed.length}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Gemini API error:', (err as Error).message);
    console.error('\n💡 Check your GEMINI_API_KEY in .env');
    process.exit(1);
  }

  // Seed data
  const productCount = await seedProducts();
  const docCount = await seedKnowledge();

  console.log('\n================================');
  console.log('🎉 Seeding complete!');
  console.log(`   Products: ${productCount}`);
  console.log(`   Documents: ${docCount}`);
  console.log('================================\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

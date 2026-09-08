import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { seedProducts } = await import('../src/data/seed-products');
  console.log(`Syncing image URLs for ${seedProducts.length} products...`);

  let count = 0;
  for (const p of seedProducts) {
    const { error } = await supabase
      .from('products')
      .update({ image_url: p.image_url })
      .eq('slug', p.slug);

    if (error) {
      console.error(`Error updating ${p.slug}:`, error.message);
    } else {
      count++;
    }
  }
  console.log(`Successfully updated ${count}/${seedProducts.length} products in database.`);
}

main().catch(console.error);

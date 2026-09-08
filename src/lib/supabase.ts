import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role key)
// This should ONLY be used in API routes and server components
export function createServerSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Singleton pattern for server client to avoid creating multiple instances
let serverClient: SupabaseClient | null = null;

export function getServerSupabaseClient(): SupabaseClient {
  if (!serverClient) {
    serverClient = createServerSupabaseClient();
  }
  return serverClient;
}

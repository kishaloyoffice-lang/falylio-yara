import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_PROJECT_URL } from './client';

/**
 * Creates a request-scoped Server Supabase Client for Next.js 15 App Router
 * Server Components, Server Actions, and Route Handlers.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_PROJECT_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase server client cannot initialize: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing from environment variables (.env.local).'
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method can be called from a Server Component where setting cookies
          // is not permitted. Safe to ignore when middleware refreshes user sessions.
        }
      },
    },
  });
}

/**
 * Safely returns a Server Supabase Client or null if environment variables are missing.
 */
export async function createSafeServerClient(): Promise<SupabaseClient | null> {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    '';

  if (!supabaseKey) {
    return null;
  }

  try {
    return await createClient();
  } catch {
    return null;
  }
}

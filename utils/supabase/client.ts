import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_PROJECT_URL = 'https://bejcibiobhrjekenhevc.supabase.co';

export interface SupabaseEnvDiagnostics {
  url: string;
  publishableKeyPresent: boolean;
  isConfigured: boolean;
  missingVars: string[];
}

export function getSupabaseEnvDiagnostics(): SupabaseEnvDiagnostics {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_PROJECT_URL;
  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    '';

  const missingVars: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!rawKey) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  return {
    url: rawUrl,
    publishableKeyPresent: Boolean(rawKey),
    isConfigured: Boolean(rawUrl && rawKey),
    missingVars,
  };
}

let browserClientInstance: SupabaseClient | null = null;

/**
 * Creates or returns the singleton Browser Supabase Client using @supabase/ssr.
 * Throws a descriptive error if NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured.
 */
export function createClient(): SupabaseClient {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_PROJECT_URL;
  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    '';

  if (!rawUrl || !rawKey) {
    throw new Error(
      'Supabase is not configured: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing in your environment (.env.local).'
    );
  }

  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient(rawUrl, rawKey);
  }

  return browserClientInstance;
}

/**
 * Safely returns the Browser Supabase Client when environment variables are present, or null otherwise.
 */
export function createSafeBrowserClient(): SupabaseClient | null {
  try {
    const diag = getSupabaseEnvDiagnostics();
    if (!diag.isConfigured) {
      return null;
    }
    return createClient();
  } catch {
    return null;
  }
}

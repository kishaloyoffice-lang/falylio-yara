import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_SUPABASE_PROJECT_URL } from './client';

/**
 * Refreshes the user's Supabase Auth session via cookies on incoming requests
 * and enforces authentication on protected routes when requested.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_PROJECT_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    '';

  // If the publishable key is not yet configured in .env.local, allow the request to proceed
  // so the UI can render a clear diagnostic banner instead of crashing middleware.
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // IMPORTANT: Use getUser() rather than getSession() to securely re-validate
    // the auth token with the Supabase Auth server on every request.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If an unauthenticated user requests /dashboard/protected, redirect to /dashboard?auth=required
    if (!user && request.nextUrl.pathname.startsWith('/dashboard/protected')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('auth', 'required');
      return NextResponse.redirect(url);
    }
  } catch {
    // Gracefully return response if network or env error occurs during middleware execution
  }

  return supabaseResponse;
}

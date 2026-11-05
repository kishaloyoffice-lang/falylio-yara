import { NextResponse, type NextRequest } from 'next/server';
import { createSafeServerClient } from '@/utils/supabase/server';

/**
 * Handles Supabase Auth PKCE callback for Email Verification and Password Reset links.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const safeNext = next.startsWith('/') ? next : '/dashboard';

  if (code) {
    const supabase = await createSafeServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard?auth_error=verification_failed`);
}

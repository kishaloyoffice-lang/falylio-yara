import { NextResponse, type NextRequest } from 'next/server';
import { createSafeServerClient } from '@/utils/supabase/server';

/**
 * Handles Supabase Auth PKCE callback for Google OAuth, Email Verification, and Password Reset links.
 * Supports both direct browser redirects (e.g. on falylio-yara.vercel.app) and popup mode (?popup=1)
 * for iframe preview environments.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const isPopup = searchParams.get('popup') === '1';
  const next = searchParams.get('next') ?? '/dashboard';
  const safeNext = next.startsWith('/') ? next : '/dashboard';

  if (code) {
    const supabase = await createSafeServerClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        // Ensure a public.profiles row exists for Google OAuth users
        try {
          const meta = data.user.user_metadata || {};
          const fullName =
            meta.full_name || meta.name || data.user.email?.split('@')[0] || 'Falylio Yara Member';
          const avatarUrl =
            meta.avatar_url || meta.picture || '/assets/fy/user-avatar.png';

          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!existingProfile) {
            await supabase.from('profiles').upsert(
              {
                id: data.user.id,
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );
          }
        } catch {
          // Non-fatal if profiles table is not reachable
        }

        if (isPopup) {
          return new NextResponse(
            `<!DOCTYPE html>
<html>
  <head><title>Authentication Successful</title></head>
  <body style="background:#060B19;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
        window.close();
      } else {
        window.location.href = ${JSON.stringify(safeNext)};
      }
    </script>
    <p>Google Sign-In successful! Closing window...</p>
  </body>
</html>`,
            {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        }

        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard?auth_error=verification_failed`);
}

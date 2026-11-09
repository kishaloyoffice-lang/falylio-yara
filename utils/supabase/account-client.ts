import { createSafeBrowserClient, getSupabaseEnvDiagnostics } from './client';
import {
  validateProfileUpdate,
  buildLocalToCloudMigration,
  type UserProfileRecord,
  type SavedItemRecord,
} from '@/lib/account-sync';

/**
 * Direct Browser-to-Supabase Account & Cloud Sync Engine.
 * Works on both full-stack Node.js hosts AND static hosting (such as InfinityFree htdocs)
 * because all 4 tables (profiles, user_favorites, recently_viewed, saved_items) enforce
 * Row Level Security (auth.uid()) directly inside Supabase Postgres.
 */
export async function fetchAccountStateDirect() {
  const diagnostics = getSupabaseEnvDiagnostics();
  if (!diagnostics.isConfigured) {
    return {
      configured: false,
      diagnostics,
      authenticated: false,
      user: null,
    };
  }

  const supabase = createSafeBrowserClient();
  if (!supabase) {
    return {
      configured: false,
      diagnostics,
      authenticated: false,
      user: null,
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      configured: true,
      diagnostics,
      authenticated: false,
      user: null,
    };
  }

  const [profileRes, favRes, recentRes, savedRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('user_favorites')
      .select('id, user_id, item_id, item_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('recently_viewed')
      .select('id, user_id, item_id, item_type, viewed_at')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(12),
    supabase
      .from('saved_items')
      .select('id, user_id, item_id, item_type, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const dbErrors: string[] = [];
  if (profileRes.error) dbErrors.push(`profiles: ${profileRes.error.message}`);
  if (favRes.error) dbErrors.push(`user_favorites: ${favRes.error.message}`);
  if (recentRes.error) dbErrors.push(`recently_viewed: ${recentRes.error.message}`);
  if (savedRes.error) dbErrors.push(`saved_items: ${savedRes.error.message}`);

  const profileData: UserProfileRecord = profileRes.data || {
    id: user.id,
    username: user.user_metadata?.username || null,
    full_name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Falylio Member',
    avatar_url:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      '/assets/fy/user-avatar.png',
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
  };

  return {
    configured: true,
    diagnostics,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      emailConfirmedAt: user.email_confirmed_at,
      createdAt: user.created_at,
      userMetadata: user.user_metadata,
    },
    profile: profileData,
    favorites: favRes.data || [],
    recentlyViewed: recentRes.data || [],
    savedItems: (savedRes.data || []) as SavedItemRecord[],
    dbErrors,
  };
}

export async function mutateAccountStateDirect(body: Record<string, unknown>) {
  const supabase = createSafeBrowserClient();
  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase client is not configured.',
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      error: 'Unauthorized: Active Supabase session required.',
    };
  }

  const action = String(body.action || '');

  if (action === 'update_profile') {
    const validation = validateProfileUpdate({
      fullName: String(body.fullName || ''),
      username: String(body.username || ''),
      avatarUrl: String(body.avatarUrl || ''),
    });

    if (!validation.valid) {
      return { ok: false, error: validation.error };
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          ...validation.payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, profile: data as UserProfileRecord };
  }

  if (action === 'migrate_local') {
    const localFavoriteIds: string[] = Array.isArray(body.localFavoriteIds)
      ? body.localFavoriteIds.map(String)
      : [];
    const localRecentIds: string[] = Array.isArray(body.localRecentIds)
      ? body.localRecentIds.map(String)
      : [];

    const [existingFavsRes, existingRecentsRes] = await Promise.all([
      supabase.from('user_favorites').select('item_id').eq('user_id', user.id),
      supabase.from('recently_viewed').select('item_id').eq('user_id', user.id),
    ]);

    if (existingFavsRes.error || existingRecentsRes.error) {
      return {
        ok: false,
        error:
          existingFavsRes.error?.message ||
          existingRecentsRes.error?.message ||
          'Failed to read existing cloud records.',
      };
    }

    const existingCloudFavoriteIds = (existingFavsRes.data || []).map((r) => r.item_id);
    const existingCloudRecentIds = (existingRecentsRes.data || []).map((r) => r.item_id);

    const migration = buildLocalToCloudMigration({
      userId: user.id,
      localFavoriteIds,
      localRecentIds,
      existingCloudFavoriteIds,
      existingCloudRecentIds,
      itemType: 'tool',
    });

    if (migration.favoritesToInsert.length > 0) {
      const { error } = await supabase.from('user_favorites').upsert(migration.favoritesToInsert, {
        onConflict: 'user_id,item_id,item_type',
        ignoreDuplicates: true,
      });
      if (error) return { ok: false, error: error.message };
    }

    if (migration.recentsToInsert.length > 0) {
      const { error } = await supabase.from('recently_viewed').upsert(migration.recentsToInsert, {
        onConflict: 'user_id,item_id,item_type',
        ignoreDuplicates: true,
      });
      if (error) return { ok: false, error: error.message };
    }

    return {
      ok: true,
      migratedFavoritesCount: migration.favoritesToInsert.length,
      migratedRecentsCount: migration.recentsToInsert.length,
      mergedFavoriteIds: migration.mergedFavoriteIds,
      mergedRecentIds: migration.mergedRecentIds,
    };
  }

  if (action === 'toggle_favorite') {
    const itemId = String(body.itemId || '').trim();
    const itemType = String(body.itemType || 'tool').trim();
    if (!itemId) return { ok: false, error: 'itemId is required.' };

    const { data: existing, error: checkErr } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle();

    if (checkErr) return { ok: false, error: checkErr.message };

    if (existing) {
      const { error: delErr } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', existing.id)
        .eq('user_id', user.id);
      if (delErr) return { ok: false, error: delErr.message };
      return { ok: true, status: 'removed', itemId };
    } else {
      const { error: insErr } = await supabase.from('user_favorites').insert({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
      });
      if (insErr) return { ok: false, error: insErr.message };
      return { ok: true, status: 'added', itemId };
    }
  }

  if (action === 'record_recent') {
    const itemId = String(body.itemId || '').trim();
    const itemType = String(body.itemType || 'tool').trim();
    if (!itemId) return { ok: false, error: 'itemId is required.' };

    const { error } = await supabase.from('recently_viewed').upsert(
      {
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,item_id,item_type' }
    );
    if (error) return { ok: false, error: error.message };
    return { ok: true, itemId };
  }

  if (action === 'save_item') {
    const itemId = String(body.itemId || '').trim();
    const itemType = String(body.itemType || 'resource').trim();
    const title = String(body.title || '').trim();
    if (!itemId || !title) return { ok: false, error: 'itemId and title are required.' };

    const { data, error } = await supabase
      .from('saved_items')
      .upsert(
        {
          user_id: user.id,
          item_id: itemId,
          item_type: itemType,
          title,
        },
        { onConflict: 'user_id,item_id,item_type' }
      )
      .select('*')
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, savedItem: data as SavedItemRecord };
  }

  if (action === 'remove_saved_item') {
    const itemId = String(body.itemId || '').trim();
    if (!itemId) return { ok: false, error: 'itemId is required.' };

    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId);

    if (error) return { ok: false, error: error.message };
    return { ok: true, itemId };
  }

  return { ok: false, error: `Unknown action: ${action}` };
}

/**
 * Universal Account State Reader:
 * Uses /api/account on Node.js servers, and automatically falls back to direct
 * Supabase RLS browser queries when hosted as static files (e.g., InfinityFree htdocs).
 */
export async function getAccountState() {
  try {
    const res = await fetch('/api/account', { cache: 'no-store' });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Fallback to direct Supabase browser client on static hosting
  }
  return await fetchAccountStateDirect();
}

/**
 * Universal Account Mutation Helper:
 * Uses POST /api/account on Node.js servers, and automatically falls back to direct
 * Supabase RLS browser mutations when hosted as static files (e.g., InfinityFree htdocs).
 */
export async function postAccountAction(payload: Record<string, unknown>) {
  try {
    const res = await fetch('/api/account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // Fallback to direct Supabase browser client on static hosting
  }
  return await mutateAccountStateDirect(payload);
}

/**
 * Initiates Google One-Click OAuth Login via Supabase Auth.
 * On top-level domains (like falylio-yara.vercel.app), redirects directly.
 * Inside cross-origin iframes (like AI Studio preview), opens the provider URL in a new tab.
 */
export async function signInWithGoogleOAuth(nextPath = '/dashboard'): Promise<{
  ok: boolean;
  error?: string;
  url?: string;
}> {
  const supabase = createSafeBrowserClient();
  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase client is not configured.',
    };
  }

  const isIframe =
    typeof window !== 'undefined' &&
    (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

  const callbackUrl = new URL('/auth/callback', window.location.origin);
  callbackUrl.searchParams.set('next', nextPath);
  if (isIframe) {
    callbackUrl.searchParams.set('popup', '1');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString(),
      skipBrowserRedirect: isIframe,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (isIframe && data?.url) {
    const link = document.createElement('a');
    link.href = data.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { ok: true, url: data.url };
  }

  return { ok: true, url: data?.url };
}



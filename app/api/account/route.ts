import { NextRequest, NextResponse } from 'next/server';
import { createSafeServerClient } from '@/utils/supabase/server';
import { getSupabaseEnvDiagnostics } from '@/utils/supabase/client';
import {
  validateProfileUpdate,
  buildLocalToCloudMigration,
} from '@/lib/account-sync';

/**
 * GET /api/account
 * Verifies the user session on the server via supabase.auth.getUser() and loads
 * profile, favorites, recently viewed items, and saved items from Supabase.
 */
export async function GET(req: NextRequest) {
  const diagnostics = getSupabaseEnvDiagnostics();
  if (!diagnostics.isConfigured) {
    return NextResponse.json({
      configured: false,
      diagnostics,
      authenticated: false,
      user: null,
    });
  }

  const supabase = await createSafeServerClient();
  if (!supabase) {
    return NextResponse.json({
      configured: false,
      diagnostics,
      authenticated: false,
      user: null,
    });
  }

  const checkTables = req.nextUrl.searchParams.get('check_tables') === '1';
  let tableStatus: Record<string, string> | undefined;
  if (checkTables) {
    tableStatus = {};
    for (const table of ['profiles', 'user_favorites', 'recently_viewed', 'saved_items']) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        tableStatus[table] = 'READY (Table created & RLS active)';
      } else if (error.code === '42501') {
        tableStatus[table] =
          'CREATED (Run GRANT statement to enable authenticated role access)';
      } else {
        tableStatus[table] = `ERROR (${error.code}): ${error.message}`;
      }
    }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({
      configured: true,
      diagnostics,
      tableStatus,
      authenticated: false,
      user: null,
    });
  }

  // Fetch user-owned records (enforced by both server user.id filter and Postgres RLS)
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

  return NextResponse.json({
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
    profile: profileRes.data || {
      id: user.id,
      username: user.user_metadata?.username || null,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Falylio Member',
      avatar_url: user.user_metadata?.avatar_url || '/assets/fy/user-avatar.png',
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    },
    favorites: favRes.data || [],
    recentlyViewed: recentRes.data || [],
    savedItems: savedRes.data || [],
    dbErrors,
  });
}

/**
 * POST /api/account
 * Server-verified mutations for profile editing, LocalStorage migration,
 * favorite toggling, recently viewed tracking, and saved items.
 * Never trusts client-supplied user IDs.
 */
export async function POST(req: NextRequest) {
  const diagnostics = getSupabaseEnvDiagnostics();
  if (!diagnostics.isConfigured) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.',
      },
      { status: 503 }
    );
  }

  const supabase = await createSafeServerClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Unable to initialize Supabase server client.' },
      { status: 503 }
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: Active Supabase session required.' },
      { status: 401 }
    );
  }

  const body = await req.json();
  const action = body?.action as string;

  // 1. Update Profile
  if (action === 'update_profile') {
    const validation = validateProfileUpdate({
      fullName: String(body.fullName || ''),
      username: String(body.username || ''),
      avatarUrl: String(body.avatarUrl || ''),
    });

    if (!validation.valid) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
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
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, profile: data });
  }

  // 2. Migrate LocalStorage Favorites & Recently Viewed to Supabase
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
      return NextResponse.json(
        {
          ok: false,
          error:
            existingFavsRes.error?.message ||
            existingRecentsRes.error?.message ||
            'Failed to read existing cloud records before migration.',
        },
        { status: 400 }
      );
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
      const { error: favInsertErr } = await supabase
        .from('user_favorites')
        .upsert(migration.favoritesToInsert, {
          onConflict: 'user_id,item_id,item_type',
          ignoreDuplicates: true,
        });
      if (favInsertErr) {
        return NextResponse.json({ ok: false, error: favInsertErr.message }, { status: 400 });
      }
    }

    if (migration.recentsToInsert.length > 0) {
      const { error: recInsertErr } = await supabase
        .from('recently_viewed')
        .upsert(migration.recentsToInsert, {
          onConflict: 'user_id,item_id,item_type',
          ignoreDuplicates: true,
        });
      if (recInsertErr) {
        return NextResponse.json({ ok: false, error: recInsertErr.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      ok: true,
      migratedFavoritesCount: migration.favoritesToInsert.length,
      migratedRecentsCount: migration.recentsToInsert.length,
      mergedFavoriteIds: migration.mergedFavoriteIds,
      mergedRecentIds: migration.mergedRecentIds,
    });
  }

  // 3. Toggle Favorite
  if (action === 'toggle_favorite') {
    const itemId = String(body.itemId || '').trim();
    const itemType = String(body.itemType || 'tool').trim();
    if (!itemId) {
      return NextResponse.json({ ok: false, error: 'itemId is required.' }, { status: 400 });
    }

    const { data: existing, error: checkErr } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle();

    if (checkErr) {
      return NextResponse.json({ ok: false, error: checkErr.message }, { status: 400 });
    }

    if (existing) {
      const { error: delErr } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', existing.id)
        .eq('user_id', user.id);
      if (delErr) {
        return NextResponse.json({ ok: false, error: delErr.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true, status: 'removed', itemId });
    } else {
      const { error: insErr } = await supabase.from('user_favorites').insert({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
      });
      if (insErr) {
        return NextResponse.json({ ok: false, error: insErr.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true, status: 'added', itemId });
    }
  }

  // 4. Record Recently Viewed
  if (action === 'record_recent') {
    const itemId = String(body.itemId || '').trim();
    const itemType = String(body.itemType || 'tool').trim();
    if (!itemId) {
      return NextResponse.json({ ok: false, error: 'itemId is required.' }, { status: 400 });
    }

    const { error } = await supabase.from('recently_viewed').upsert(
      {
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,item_id,item_type' }
    );

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, itemId });
  }

  // 5. Save Item to saved_items
  if (action === 'save_item') {
    const itemId = String(body.itemId || '').trim();
    const itemType = String(body.itemType || 'resource').trim();
    const title = String(body.title || '').trim();

    if (!itemId || !title) {
      return NextResponse.json(
        { ok: false, error: 'itemId and title are required.' },
        { status: 400 }
      );
    }

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

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, savedItem: data });
  }

  // 6. Remove Saved Item
  if (action === 'remove_saved_item') {
    const itemId = String(body.itemId || '').trim();
    if (!itemId) {
      return NextResponse.json({ ok: false, error: 'itemId is required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, itemId });
  }

  return NextResponse.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 });
}

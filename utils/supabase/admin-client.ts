import { createSafeBrowserClient } from './client';

export const OWNER_ADMIN_EMAIL = 'kishaloyoffice@gmail.com';

export interface PlatformAnnouncementRecord {
  id: string;
  title: string;
  message: string;
  badge: string;
  link_url?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
}

export type CustomItemSectionType = 'tool' | 'game' | 'course' | 'marketplace' | 'app';

export interface PlatformCustomItemRecord {
  id: string;
  section_type: CustomItemSectionType;
  title: string;
  category: string;
  description: string;
  badge: string;
  action_url?: string | null;
  price_label: string;
  is_published: boolean;
  created_by?: string | null;
  created_at: string;
}

export interface AdminUserProfileSummary {
  id: string;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at: string;
}

export const ADMIN_SQL_SETUP_SCRIPT = `-- FALYLIO YARA — SUPABASE ADMIN CONTROL PANEL SQL
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles p SET email = u.email FROM auth.users u WHERE p.id = u.id AND p.email IS NULL;
UPDATE public.profiles p SET role = 'admin' FROM auth.users u WHERE p.id = u.id AND lower(u.email) = 'kishaloyoffice@gmail.com';

CREATE OR REPLACE FUNCTION public.is_falylio_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  OR (lower(COALESCE(auth.jwt()->>'email', '')) = 'kishaloyoffice@gmail.com');
$$;

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (public.is_falylio_admin());

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE USING (public.is_falylio_admin()) WITH CHECK (public.is_falylio_admin());

CREATE TABLE IF NOT EXISTS public.platform_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  badge text NOT NULL DEFAULT 'LIVE',
  link_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_public_read" ON public.platform_announcements;
CREATE POLICY "announcements_public_read" ON public.platform_announcements FOR SELECT USING (is_active = true OR public.is_falylio_admin());
DROP POLICY IF EXISTS "announcements_admin_insert" ON public.platform_announcements;
CREATE POLICY "announcements_admin_insert" ON public.platform_announcements FOR INSERT WITH CHECK (public.is_falylio_admin());
DROP POLICY IF EXISTS "announcements_admin_update" ON public.platform_announcements;
CREATE POLICY "announcements_admin_update" ON public.platform_announcements FOR UPDATE USING (public.is_falylio_admin()) WITH CHECK (public.is_falylio_admin());
DROP POLICY IF EXISTS "announcements_admin_delete" ON public.platform_announcements;
CREATE POLICY "announcements_admin_delete" ON public.platform_announcements FOR DELETE USING (public.is_falylio_admin());

CREATE TABLE IF NOT EXISTS public.platform_custom_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL CHECK (section_type IN ('tool', 'game', 'course', 'marketplace', 'app')),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  description text NOT NULL,
  badge text NOT NULL DEFAULT 'NEW',
  action_url text,
  price_label text NOT NULL DEFAULT 'Free',
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_custom_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_items_public_read" ON public.platform_custom_items;
CREATE POLICY "custom_items_public_read" ON public.platform_custom_items FOR SELECT USING (is_published = true OR public.is_falylio_admin());
DROP POLICY IF EXISTS "custom_items_admin_insert" ON public.platform_custom_items;
CREATE POLICY "custom_items_admin_insert" ON public.platform_custom_items FOR INSERT WITH CHECK (public.is_falylio_admin());
DROP POLICY IF EXISTS "custom_items_admin_update" ON public.platform_custom_items;
CREATE POLICY "custom_items_admin_update" ON public.platform_custom_items FOR UPDATE USING (public.is_falylio_admin()) WITH CHECK (public.is_falylio_admin());
DROP POLICY IF EXISTS "custom_items_admin_delete" ON public.platform_custom_items;
CREATE POLICY "custom_items_admin_delete" ON public.platform_custom_items FOR DELETE USING (public.is_falylio_admin());

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.platform_announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.platform_announcements TO authenticated;
GRANT SELECT ON public.platform_custom_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.platform_custom_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;`;

const LOCAL_ANNOUNCEMENTS_KEY = 'fy_admin_announcements';
const LOCAL_CUSTOM_ITEMS_KEY = 'fy_admin_custom_items';

function getLocalAnnouncements(): PlatformAnnouncementRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ANNOUNCEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAnnouncements(list: PlatformAnnouncementRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }
}

function getLocalCustomItems(): PlatformCustomItemRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOM_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomItems(list: PlatformCustomItemRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CUSTOM_ITEMS_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }
}

/**
 * Fetches public announcements and custom platform items for the homepage.
 * Reads directly from Supabase tables (platform_announcements & platform_custom_items)
 * and merges with local fallback if tables are not yet migrated.
 */
export async function fetchPublicAdminContent(): Promise<{
  announcements: PlatformAnnouncementRecord[];
  customItems: PlatformCustomItemRecord[];
  supabaseTablesReady: boolean;
}> {
  const supabase = createSafeBrowserClient();
  if (!supabase) {
    return {
      announcements: getLocalAnnouncements().filter((a) => a.is_active),
      customItems: getLocalCustomItems().filter((i) => i.is_published),
      supabaseTablesReady: false,
    };
  }

  const [annRes, itemsRes] = await Promise.all([
    supabase
      .from('platform_announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('platform_custom_items')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
  ]);

  const tablesReady = !annRes.error && !itemsRes.error;

  const cloudAnnouncements = (annRes.data || []) as PlatformAnnouncementRecord[];
  const cloudItems = (itemsRes.data || []) as PlatformCustomItemRecord[];

  return {
    announcements:
      cloudAnnouncements.length > 0
        ? cloudAnnouncements
        : getLocalAnnouncements().filter((a) => a.is_active),
    customItems:
      cloudItems.length > 0
        ? cloudItems
        : getLocalCustomItems().filter((i) => i.is_published),
    supabaseTablesReady: tablesReady,
  };
}

/**
 * Fetches complete Admin Control Panel state from Supabase:
 * - Current user & whether they have admin privileges
 * - All registered user profiles from public.profiles
 * - All announcements from public.platform_announcements
 * - All custom catalog items from public.platform_custom_items
 */
export async function fetchAdminDashboardState(): Promise<{
  authenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  userId: string | null;
  tablesReady: boolean;
  tableError: string | null;
  users: AdminUserProfileSummary[];
  announcements: PlatformAnnouncementRecord[];
  customItems: PlatformCustomItemRecord[];
}> {
  const supabase = createSafeBrowserClient();
  if (!supabase) {
    return {
      authenticated: false,
      isAdmin: false,
      userEmail: null,
      userId: null,
      tablesReady: false,
      tableError: 'Supabase client is not configured.',
      users: [],
      announcements: getLocalAnnouncements(),
      customItems: getLocalCustomItems(),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profilesRes, annRes, itemsRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('platform_announcements').select('*').order('created_at', { ascending: false }),
    supabase.from('platform_custom_items').select('*').order('created_at', { ascending: false }),
  ]);

  const tablesReady = !annRes.error && !itemsRes.error;
  const tableError =
    annRes.error?.message || itemsRes.error?.message || null;

  const usersList = (profilesRes.data || []) as AdminUserProfileSummary[];
  const myProfile = user ? usersList.find((p) => p.id === user.id) : null;
  const isOwnerEmail =
    Boolean(user?.email && user.email.toLowerCase() === OWNER_ADMIN_EMAIL);
  const isAdmin = Boolean(isOwnerEmail || myProfile?.role === 'admin');

  return {
    authenticated: Boolean(user),
    isAdmin,
    userEmail: user?.email || null,
    userId: user?.id || null,
    tablesReady,
    tableError,
    users: usersList,
    announcements: tablesReady
      ? ((annRes.data || []) as PlatformAnnouncementRecord[])
      : getLocalAnnouncements(),
    customItems: tablesReady
      ? ((itemsRes.data || []) as PlatformCustomItemRecord[])
      : getLocalCustomItems(),
  };
}

export async function createAdminAnnouncement(input: {
  title: string;
  message: string;
  badge?: string;
  link_url?: string;
}): Promise<{ ok: boolean; error?: string; savedToCloud?: boolean }> {
  const title = input.title.trim();
  const message = input.message.trim();
  const badge = (input.badge || 'LIVE').trim().toUpperCase();
  const link_url = input.link_url?.trim() || null;

  if (!title || !message) {
    return { ok: false, error: 'Title and announcement message are required.' };
  }

  const supabase = createSafeBrowserClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('platform_announcements').insert({
      title,
      message,
      badge,
      link_url,
      is_active: true,
      created_by: user?.id || null,
    });

    if (!error) {
      return { ok: true, savedToCloud: true };
    }

    // Fallback to localStorage if SQL migration not run yet
    const local = getLocalAnnouncements();
    const nextItem: PlatformAnnouncementRecord = {
      id: `local-ann-${Date.now()}`,
      title,
      message,
      badge,
      link_url,
      is_active: true,
      created_by: user?.id || null,
      created_at: new Date().toISOString(),
    };
    saveLocalAnnouncements([nextItem, ...local]);
    return {
      ok: true,
      savedToCloud: false,
      error: `Saved locally (Run Admin SQL in Supabase to persist in cloud: ${error.message})`,
    };
  }

  return { ok: false, error: 'Supabase client unavailable.' };
}

export async function toggleAdminAnnouncement(
  id: string,
  nextActive: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (id.startsWith('local-ann-')) {
    const updated = getLocalAnnouncements().map((a) =>
      a.id === id ? { ...a, is_active: nextActive } : a
    );
    saveLocalAnnouncements(updated);
    return { ok: true };
  }

  const supabase = createSafeBrowserClient();
  if (!supabase) return { ok: false, error: 'Supabase not configured.' };

  const { error } = await supabase
    .from('platform_announcements')
    .update({ is_active: nextActive })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAdminAnnouncement(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (id.startsWith('local-ann-')) {
    const updated = getLocalAnnouncements().filter((a) => a.id !== id);
    saveLocalAnnouncements(updated);
    return { ok: true };
  }

  const supabase = createSafeBrowserClient();
  if (!supabase) return { ok: false, error: 'Supabase not configured.' };

  const { error } = await supabase
    .from('platform_announcements')
    .delete()
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function createAdminCustomItem(input: {
  section_type: CustomItemSectionType;
  title: string;
  category: string;
  description: string;
  badge?: string;
  action_url?: string;
  price_label?: string;
}): Promise<{ ok: boolean; error?: string; savedToCloud?: boolean }> {
  const title = input.title.trim();
  const category = input.category.trim() || 'General';
  const description = input.description.trim();
  const badge = (input.badge || 'NEW').trim().toUpperCase();
  const action_url = input.action_url?.trim() || null;
  const price_label = (input.price_label || 'Free').trim();

  if (!title || !description) {
    return { ok: false, error: 'Title and description are required.' };
  }

  const supabase = createSafeBrowserClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('platform_custom_items').insert({
      section_type: input.section_type,
      title,
      category,
      description,
      badge,
      action_url,
      price_label,
      is_published: true,
      created_by: user?.id || null,
    });

    if (!error) {
      return { ok: true, savedToCloud: true };
    }

    const local = getLocalCustomItems();
    const nextItem: PlatformCustomItemRecord = {
      id: `local-item-${Date.now()}`,
      section_type: input.section_type,
      title,
      category,
      description,
      badge,
      action_url,
      price_label,
      is_published: true,
      created_by: user?.id || null,
      created_at: new Date().toISOString(),
    };
    saveLocalCustomItems([nextItem, ...local]);
    return {
      ok: true,
      savedToCloud: false,
      error: `Saved locally (Run Admin SQL in Supabase to persist in cloud: ${error.message})`,
    };
  }

  return { ok: false, error: 'Supabase client unavailable.' };
}

export async function deleteAdminCustomItem(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (id.startsWith('local-item-')) {
    const updated = getLocalCustomItems().filter((i) => i.id !== id);
    saveLocalCustomItems(updated);
    return { ok: true };
  }

  const supabase = createSafeBrowserClient();
  if (!supabase) return { ok: false, error: 'Supabase not configured.' };

  const { error } = await supabase
    .from('platform_custom_items')
    .delete()
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateAdminUserRole(
  targetUserId: string,
  nextRole: 'admin' | 'user'
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSafeBrowserClient();
  if (!supabase) return { ok: false, error: 'Supabase not configured.' };

  const { error } = await supabase
    .from('profiles')
    .update({ role: nextRole, updated_at: new Date().toISOString() })
    .eq('id', targetUserId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

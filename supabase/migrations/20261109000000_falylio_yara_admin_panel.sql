-- =============================================================================
-- FALYLIO YARA — REAL SUPABASE ADMIN CONTROL PANEL MIGRATION
-- Target Project: https://bejcibiobhrjekenhevc.supabase.co
-- Run this script in Supabase Dashboard -> SQL Editor -> New Query
-- =============================================================================

-- 1. ADD ROLE COLUMN TO public.profiles (DEFAULT 'user', ADMIN FOR OWNER)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

-- Automatically sync email into public.profiles from auth.users where missing
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Promote project owner email to admin automatically
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id
  AND lower(u.email) = 'kishaloyoffice@gmail.com';

-- Update trigger function so future signups also store email & auto-promote owner
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email, role)
  VALUES (
    NEW.id,
     COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '/assets/fy/user-avatar.png'),
    NEW.email,
    CASE WHEN lower(NEW.email) = 'kishaloyoffice@gmail.com' THEN 'admin' ELSE 'user' END
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
  RETURN NEW;
END;
$$;

-- Helper function to check if the current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_falylio_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) OR (
    lower(COALESCE(auth.jwt()->>'email', '')) = 'kishaloyoffice@gmail.com'
  );
$$;

-- Allow admins to view all user profiles and update roles
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  USING (public.is_falylio_admin());

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  USING (public.is_falylio_admin())
  WITH CHECK (public.is_falylio_admin());

-- =============================================================================
-- 2. PLATFORM ANNOUNCEMENTS TABLE (public.platform_announcements)
-- =============================================================================
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

-- Anyone visiting the website can read active announcements
DROP POLICY IF EXISTS "announcements_public_read" ON public.platform_announcements;
CREATE POLICY "announcements_public_read"
  ON public.platform_announcements
  FOR SELECT
  USING (is_active = true OR public.is_falylio_admin());

-- Only admins can insert, update, or delete announcements
DROP POLICY IF EXISTS "announcements_admin_insert" ON public.platform_announcements;
CREATE POLICY "announcements_admin_insert"
  ON public.platform_announcements
  FOR INSERT
  WITH CHECK (public.is_falylio_admin());

DROP POLICY IF EXISTS "announcements_admin_update" ON public.platform_announcements;
CREATE POLICY "announcements_admin_update"
  ON public.platform_announcements
  FOR UPDATE
  USING (public.is_falylio_admin())
  WITH CHECK (public.is_falylio_admin());

DROP POLICY IF EXISTS "announcements_admin_delete" ON public.platform_announcements;
CREATE POLICY "announcements_admin_delete"
  ON public.platform_announcements
  FOR DELETE
  USING (public.is_falylio_admin());

-- =============================================================================
-- 3. PLATFORM CUSTOM ITEMS TABLE (public.platform_custom_items)
-- Allows Admin to dynamically publish Tools, Games, Courses, Apps & Marketplace items
-- =============================================================================
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

-- Anyone visiting the website can read published items
DROP POLICY IF EXISTS "custom_items_public_read" ON public.platform_custom_items;
CREATE POLICY "custom_items_public_read"
  ON public.platform_custom_items
  FOR SELECT
  USING (is_published = true OR public.is_falylio_admin());

-- Only admins can insert, update, or delete custom items
DROP POLICY IF EXISTS "custom_items_admin_insert" ON public.platform_custom_items;
CREATE POLICY "custom_items_admin_insert"
  ON public.platform_custom_items
  FOR INSERT
  WITH CHECK (public.is_falylio_admin());

DROP POLICY IF EXISTS "custom_items_admin_update" ON public.platform_custom_items;
CREATE POLICY "custom_items_admin_update"
  ON public.platform_custom_items
  FOR UPDATE
  USING (public.is_falylio_admin())
  WITH CHECK (public.is_falylio_admin());

DROP POLICY IF EXISTS "custom_items_admin_delete" ON public.platform_custom_items;
CREATE POLICY "custom_items_admin_delete"
  ON public.platform_custom_items
  FOR DELETE
  USING (public.is_falylio_admin());

-- =============================================================================
-- 4. GRANT PERMISSIONS TO anon & authenticated ROLES
-- =============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.platform_announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.platform_announcements TO authenticated;
GRANT SELECT ON public.platform_custom_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.platform_custom_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Users,
  Megaphone,
  PlusCircle,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Copy,
  Check,
  ExternalLink,
  Crown,
  Wrench,
  Gamepad2,
  GraduationCap,
  ShoppingCart,
  LayoutGrid,
} from 'lucide-react';
import {
  PLATFORM_TOOLS,
  ALL_TOOL_CATEGORIES,
  EDUCATION_COURSES,
  MARKETPLACE_PRODUCTS,
  BROWSER_GAMES,
} from '@/lib/platform-data';
import {
  fetchAdminDashboardState,
  createAdminAnnouncement,
  toggleAdminAnnouncement,
  deleteAdminAnnouncement,
  createAdminCustomItem,
  deleteAdminCustomItem,
  updateAdminUserRole,
  ADMIN_SQL_SETUP_SCRIPT,
  OWNER_ADMIN_EMAIL,
  type PlatformAnnouncementRecord,
  type PlatformCustomItemRecord,
  type CustomItemSectionType,
  type AdminUserProfileSummary,
} from '@/utils/supabase/admin-client';

export function AdminControlPanelView({
  onContentChanged,
}: {
  onContentChanged?: () => void;
}) {
  const [subTab, setSubTab] = useState<'overview' | 'catalog' | 'announcements' | 'users' | 'sql'>(
    'overview'
  );
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tablesReady, setTablesReady] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUserProfileSummary[]>([]);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncementRecord[]>([]);
  const [customItems, setCustomItems] = useState<PlatformCustomItemRecord[]>([]);

  // Feedback banner
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annBadge, setAnnBadge] = useState('LIVE');
  const [annLink, setAnnLink] = useState('');
  const [annSubmitting, setAnnSubmitting] = useState(false);

  // New Custom Item Form State
  const [itemSection, setItemSection] = useState<CustomItemSectionType>('tool');
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('AI & Automation');
  const [itemDescription, setItemDescription] = useState('');
  const [itemBadge, setItemBadge] = useState('NEW');
  const [itemUrl, setItemUrl] = useState('');
  const [itemPrice, setItemPrice] = useState('Free');
  const [itemSubmitting, setItemSubmitting] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const state = await fetchAdminDashboardState();
      setAuthenticated(state.authenticated);
      setIsAdmin(state.isAdmin);
      setUserEmail(state.userEmail);
      setTablesReady(state.tablesReady);
      setTableError(state.tableError);
      setUsers(state.users);
      setAnnouncements(state.announcements);
      setCustomItems(state.customItems);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleCopySql = () => {
    navigator.clipboard?.writeText(ADMIN_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setAnnSubmitting(true);
    try {
      const res = await createAdminAnnouncement({
        title: annTitle,
        message: annMessage,
        badge: annBadge,
        link_url: annLink,
      });
      if (!res.ok) {
        setStatusMsg({ type: 'err', text: res.error || 'Could not create announcement.' });
      } else {
        setAnnTitle('');
        setAnnMessage('');
        setAnnLink('');
        setStatusMsg({
          type: 'ok',
          text: res.savedToCloud
            ? 'Announcement published to Supabase (public.platform_announcements) and live on homepage!'
            : res.error || 'Announcement saved locally.',
        });
        await loadAdminData();
        onContentChanged?.();
      }
    } finally {
      setAnnSubmitting(false);
    }
  };

  const handleToggleAnnouncement = async (id: string, currentActive: boolean) => {
    setStatusMsg(null);
    const res = await toggleAdminAnnouncement(id, !currentActive);
    if (!res.ok) {
      setStatusMsg({ type: 'err', text: res.error || 'Failed to update announcement.' });
    } else {
      await loadAdminData();
      onContentChanged?.();
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setStatusMsg(null);
    const res = await deleteAdminAnnouncement(id);
    if (!res.ok) {
      setStatusMsg({ type: 'err', text: res.error || 'Failed to delete announcement.' });
    } else {
      await loadAdminData();
      onContentChanged?.();
    }
  };

  const handleCreateCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setItemSubmitting(true);
    try {
      const res = await createAdminCustomItem({
        section_type: itemSection,
        title: itemTitle,
        category: itemCategory,
        description: itemDescription,
        badge: itemBadge,
        action_url: itemUrl,
        price_label: itemPrice,
      });
      if (!res.ok) {
        setStatusMsg({ type: 'err', text: res.error || 'Could not publish item.' });
      } else {
        setItemTitle('');
        setItemDescription('');
        setItemUrl('');
        setStatusMsg({
          type: 'ok',
          text: res.savedToCloud
            ? `New ${itemSection.toUpperCase()} published to Supabase (public.platform_custom_items) and live on homepage!`
            : res.error || 'Item published locally.',
        });
        await loadAdminData();
        onContentChanged?.();
      }
    } finally {
      setItemSubmitting(false);
    }
  };

  const handleDeleteCustomItem = async (id: string) => {
    setStatusMsg(null);
    const res = await deleteAdminCustomItem(id);
    if (!res.ok) {
      setStatusMsg({ type: 'err', text: res.error || 'Could not remove item.' });
    } else {
      await loadAdminData();
      onContentChanged?.();
    }
  };

  const handleRoleToggle = async (targetUser: AdminUserProfileSummary) => {
    setStatusMsg(null);
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const res = await updateAdminUserRole(targetUser.id, nextRole);
    if (!res.ok) {
      setStatusMsg({ type: 'err', text: res.error || 'Failed to update user role.' });
    } else {
      setStatusMsg({
        type: 'ok',
        text: `Updated role for ${targetUser.full_name || targetUser.email || targetUser.id} to ${nextRole.toUpperCase()}.`,
      });
      await loadAdminData();
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Admin Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#1E366D] bg-[#0B1631] p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00A8FF] to-[#7C3AED] flex items-center justify-center text-white shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Falylio Yara — Real Supabase Admin Control Panel
              </h3>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                  isAdmin
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isAdmin
                  ? `Verified Admin (${userEmail})`
                  : authenticated
                  ? `Member (${userEmail})`
                  : 'Guest Preview'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage live homepage announcements, dynamic games/tools/courses, and registered Supabase users.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAdminData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#243E7A] bg-[#0F1E42] px-3 py-1.5 text-xs font-bold text-[#00D2FF] hover:bg-[#162B5B]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Cloud</span>
          </button>
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0072FF] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0055FF]"
          >
            <span>Full Admin Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Warning banner if Admin SQL tables aren't created yet */}
      {!tablesReady && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/35 p-4 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Run Admin SQL Migration in Supabase SQL Editor (1-Time Setup)</span>
            </div>
            <p className="text-amber-100/90">
              To store Admin Announcements (<code className="text-white">platform_announcements</code>) and Custom Items (<code className="text-white">platform_custom_items</code>) permanently in Supabase, click <strong>Copy Admin SQL</strong> and run it in your Supabase SQL Editor.
              {tableError ? ` (${tableError})` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
            >
              {copiedSql ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy Admin SQL'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('sql')}
              className="rounded-xl border border-amber-400/50 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-900/40"
            >
              View SQL
            </button>
          </div>
        </div>
      )}

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`rounded-xl border p-3.5 text-xs flex items-center justify-between gap-3 ${
            statusMsg.type === 'ok'
              ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
              : 'border-rose-500/40 bg-rose-950/50 text-rose-200'
          }`}
        >
          <span className="flex items-center gap-2">
            {statusMsg.type === 'ok' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="underline text-[11px] shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#162852] pb-2.5">
        {(
          [
            ['overview', '1. Overview & Live Stats'],
            ['catalog', `2. Add Games / Tools / Courses (${customItems.length})`],
            ['announcements', `3. Homepage Notice Banner (${announcements.length})`],
            ['users', `4. Registered Users (${users.length})`],
            ['sql', '5. Supabase Admin SQL'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSubTab(key)}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              subTab === key
                ? 'bg-gradient-to-r from-[#00A8FF] to-[#7C3AED] text-white shadow'
                : 'bg-[#0D1834] text-slate-300 hover:text-white border border-[#1B3164]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 tabular-nums">
            <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Registered Users</span>
                <Users className="h-4 w-4 text-[#00D2FF]" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold text-white">{users.length}</p>
              <p className="mt-0.5 text-[11px] text-emerald-300">Live from public.profiles</p>
            </div>

            <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Platform Tools &amp; Games</span>
                <Wrench className="h-4 w-4 text-purple-400" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold text-white">
                {PLATFORM_TOOLS.length + BROWSER_GAMES.length + customItems.length}
              </p>
              <p className="mt-0.5 text-[11px] text-[#00D2FF]">
                {customItems.length} Custom Admin Items Added
              </p>
            </div>

            <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Live Notice Banners</span>
                <Megaphone className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold text-white">
                {announcements.filter((a) => a.is_active).length}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {announcements.length} total announcements
              </p>
            </div>

            <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Supabase Admin DB</span>
                <Database className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-1.5 text-sm font-extrabold text-white">
                {tablesReady ? 'READY & CONNECTED' : 'PENDING SQL'}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Owner: {OWNER_ADMIN_EMAIL}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#00D2FF]">
                Quick Admin Actions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSubTab('catalog')}
                  className="flex items-center gap-2 rounded-xl border border-[#243E7A] bg-[#102046] p-3 text-left text-xs font-bold text-white hover:border-[#00D2FF]"
                >
                  <PlusCircle className="h-4 w-4 text-[#00D2FF] shrink-0" />
                  <span>Add New Tool / Game / Course</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab('announcements')}
                  className="flex items-center gap-2 rounded-xl border border-[#243E7A] bg-[#102046] p-3 text-left text-xs font-bold text-white hover:border-[#00D2FF]"
                >
                  <Megaphone className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Post Homepage Notice Banner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab('users')}
                  className="flex items-center gap-2 rounded-xl border border-[#243E7A] bg-[#102046] p-3 text-left text-xs font-bold text-white hover:border-[#00D2FF]"
                >
                  <Users className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Manage Registered Users</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab('sql')}
                  className="flex items-center gap-2 rounded-xl border border-[#243E7A] bg-[#102046] p-3 text-left text-xs font-bold text-white hover:border-[#00D2FF]"
                >
                  <Database className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>View / Copy Admin SQL</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4 space-y-2 text-xs">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#00D2FF]">
                Platform Catalog Summary
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between border-b border-[#162852] pb-1">
                  <span>Tool Categories:</span>
                  <span className="font-bold text-white">{ALL_TOOL_CATEGORIES.length}</span>
                </div>
                <div className="flex justify-between border-b border-[#162852] pb-1">
                  <span>Built-in Interactive Tools:</span>
                  <span className="font-bold text-white">{PLATFORM_TOOLS.length}</span>
                </div>
                <div className="flex justify-between border-b border-[#162852] pb-1">
                  <span>Education Courses &amp; Quizzes:</span>
                  <span className="font-bold text-white">{EDUCATION_COURSES.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketplace Digital Products:</span>
                  <span className="font-bold text-white">{MARKETPLACE_PRODUCTS.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ADD CUSTOM GAMES / TOOLS / COURSES / MARKETPLACE ITEMS */}
      {subTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form
            onSubmit={handleCreateCustomItem}
            className="lg:col-span-5 rounded-2xl border border-[#1E3468] bg-[#0D1834] p-5 space-y-3.5"
          >
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-[#00D2FF]" />
              <span>Publish New Platform Item to Homepage</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Section Type
                </label>
                <select
                  value={itemSection}
                  onChange={(e) => setItemSection(e.target.value as CustomItemSectionType)}
                  className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                >
                  <option value="tool">Tool (All Tools)</option>
                  <option value="game">Game (Gaming Zone)</option>
                  <option value="course">Course (Education)</option>
                  <option value="app">App (Apps &amp; Software)</option>
                  <option value="marketplace">Product (Marketplace)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={itemBadge}
                  onChange={(e) => setItemBadge(e.target.value)}
                  placeholder="NEW / HOT / PRO"
                  className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="e.g. Cyber Royale 2026 / AI Logo Maker Pro"
                className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  placeholder="e.g. Action / AI Tools"
                  className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Price / Access Label
                </label>
                <input
                  type="text"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="Free / $19 / Pro"
                  className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                External or Action URL (Optional)
              </label>
              <input
                type="url"
                value={itemUrl}
                onChange={(e) => setItemUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Short Description *
              </label>
              <textarea
                rows={3}
                required
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Describe what this tool, game, course, or product offers..."
                className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={itemSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-[#00A8FF] to-[#7C3AED] py-2.5 text-xs font-extrabold text-white shadow hover:opacity-95 disabled:opacity-50"
            >
              {itemSubmitting ? 'Publishing to Supabase...' : 'Publish Item to Live Platform'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-sm font-extrabold text-white">
              Admin-Published Custom Items ({customItems.length})
            </h4>
            {customItems.length === 0 ? (
              <div className="rounded-2xl border border-[#1B3164] bg-[#0D1834] p-8 text-center text-xs text-slate-400">
                No custom items published yet. Use the form on the left to add a new Tool, Game, Course, App, or Marketplace product directly to the homepage!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {customItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#1E3468] bg-[#0D1834] p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-md bg-[#0072FF]/25 border border-[#00D2FF]/40 px-2 py-0.5 text-[10px] font-bold uppercase text-[#00D2FF] flex items-center gap-1">
                          {item.section_type === 'game' ? (
                            <Gamepad2 className="h-3 w-3" />
                          ) : item.section_type === 'course' ? (
                            <GraduationCap className="h-3 w-3" />
                          ) : item.section_type === 'marketplace' ? (
                            <ShoppingCart className="h-3 w-3" />
                          ) : item.section_type === 'app' ? (
                            <LayoutGrid className="h-3 w-3" />
                          ) : (
                            <Wrench className="h-3 w-3" />
                          )}
                          <span>{item.section_type}</span>
                        </span>
                        <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                          {item.badge}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                      <div className="text-[11px] text-slate-400">
                        Category: {item.category} • Access: {item.price_label}
                        {item.action_url ? ` • URL: ${item.action_url}` : ''}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCustomItem(item.id)}
                      aria-label={`Delete ${item.title}`}
                      className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/25 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ANNOUNCEMENTS BANNER MANAGER */}
      {subTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form
            onSubmit={handleCreateAnnouncement}
            className="lg:col-span-5 rounded-2xl border border-[#1E3468] bg-[#0D1834] p-5 space-y-3.5"
          >
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-400" />
              <span>Post Live Homepage Announcement</span>
            </h4>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Falylio Yara v2.5 Update!"
                  className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Badge
                </label>
                <input
                  type="text"
                  value={annBadge}
                  onChange={(e) => setAnnBadge(e.target.value)}
                  placeholder="LIVE / NEW"
                  className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Announcement Message *
              </label>
              <textarea
                rows={3}
                required
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Write the announcement message that all visitors will see at the top of the homepage..."
                className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Action Link URL (Optional)
              </label>
              <input
                type="text"
                value={annLink}
                onChange={(e) => setAnnLink(e.target.value)}
                placeholder="https://... or #ai-center"
                className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={annSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-[#0072FF] py-2.5 text-xs font-extrabold text-white shadow hover:opacity-95 disabled:opacity-50"
            >
              {annSubmitting ? 'Posting Announcement...' : 'Publish Banner to Homepage'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-sm font-extrabold text-white">
              Active &amp; Past Announcements ({announcements.length})
            </h4>
            {announcements.length === 0 ? (
              <div className="rounded-2xl border border-[#1B3164] bg-[#0D1834] p-8 text-center text-xs text-slate-400">
                No announcements posted yet. Create one on the left to show a live banner at the top of the Falylio Yara homepage!
              </div>
            ) : (
              <div className="space-y-2.5">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-xl border border-[#1E3468] bg-[#0D1834] p-4 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                          {ann.badge}
                        </span>
                        <span className="text-xs font-bold text-white">{ann.title}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            ann.is_active ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          ({ann.is_active ? 'Active on Homepage' : 'Hidden'})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{ann.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleAnnouncement(ann.id, ann.is_active)}
                        className="rounded-lg border border-[#243E7A] bg-[#102046] px-2.5 py-1.5 text-[11px] font-bold text-slate-200 hover:text-white"
                      >
                        {ann.is_active ? 'Hide' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        aria-label={`Delete ${ann.title}`}
                        className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/25"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: REGISTERED USERS DIRECTORY */}
      {subTab === 'users' && (
        <div className="rounded-2xl border border-[#1E3468] bg-[#0D1834] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-[#00D2FF]" />
              <span>Registered Supabase Users ({users.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Source: <code className="text-[#00D2FF]">public.profiles</code>
            </span>
          </div>

          {users.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No user profiles returned. Sign in with your Admin account ({OWNER_ADMIN_EMAIL}) and run the Admin SQL policy so you can view and manage all registered users.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1B3164] text-slate-400">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Joined</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15254B]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#101F42]/60">
                      <td className="py-2.5 px-3 flex items-center gap-2.5">
                        <img
                          src={u.avatar_url || '/assets/fy/user-avatar.png'}
                          alt={u.full_name || 'User'}
                          className="h-7 w-7 rounded-full object-cover border border-[#00D2FF]"
                        />
                        <span className="font-bold text-white">
                          {u.full_name || 'Falylio Member'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#00D2FF]">
                        @{u.username || 'member'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {u.email || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                              : 'bg-[#162954] text-slate-300'
                          }`}
                        >
                          {u.role === 'admin' && <Crown className="h-3 w-3" />}
                          <span>{u.role || 'user'}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRoleToggle(u)}
                          className="rounded-lg border border-[#243E7A] bg-[#0F1E42] px-2.5 py-1 text-[11px] font-bold text-[#00D2FF] hover:bg-[#162B5B]"
                        >
                          {u.role === 'admin' ? 'Set as User' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: SUPABASE ADMIN SQL */}
      {subTab === 'sql' && (
        <div className="rounded-2xl border border-[#1E3468] bg-[#0D1834] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Supabase Admin Control Panel SQL Migration
              </h4>
              <p className="text-xs text-slate-400">
                Copy and run this once in your Supabase Dashboard ➔ SQL Editor to activate cloud storage for Admin Announcements, Custom Items, and User Role Management.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0072FF] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#0055FF]"
            >
              {copiedSql ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy Full SQL'}</span>
            </button>
          </div>
          <pre className="max-h-80 overflow-y-auto rounded-xl border border-[#162852] bg-[#060C1D] p-3.5 text-[11px] font-mono text-cyan-200 leading-relaxed">
            {ADMIN_SQL_SETUP_SCRIPT}
          </pre>
        </div>
      )}
    </div>
  );
}

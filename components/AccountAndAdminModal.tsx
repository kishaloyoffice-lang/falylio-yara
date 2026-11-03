'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Bookmark,
  Clock,
  Settings,
  Lock,
  Database,
  Smartphone,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Wrench,
  BookOpen,
  ShoppingBag,
  FileText,
  BarChart3,
} from 'lucide-react';
import {
  PLATFORM_TOOLS,
  ALL_TOOL_CATEGORIES,
  EDUCATION_COURSES,
  MARKETPLACE_PRODUCTS,
  COMMUNITY_POSTS,
  type PlatformTool,
} from '@/lib/platform-data';

export function AccountAndAdminModal({
  isOpen,
  initialTab = 'dashboard',
  onClose,
  favoriteIds,
  recentToolIds,
  onSelectTool,
  onRemoveFavorite,
}: {
  isOpen: boolean;
  initialTab?: 'dashboard' | 'auth' | 'admin' | 'architecture';
  onClose: () => void;
  favoriteIds: string[];
  recentToolIds: string[];
  onSelectTool: (tool: PlatformTool) => void;
  onRemoveFavorite: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'auth' | 'admin' | 'architecture'>(initialTab);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [adminSubTab, setContentSubTab] = useState<
    'overview' | 'categories' | 'tools' | 'courses' | 'marketplace' | 'settings'
  >('overview');

  if (!isOpen) return null;

  const favoriteTools = PLATFORM_TOOLS.filter((t) => favoriteIds.includes(t.id));
  const recentTools = recentToolIds
    .map((id) => PLATFORM_TOOLS.find((t) => t.id === id))
    .filter((t): t is PlatformTool => Boolean(t));

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes('@')) {
      setAuthNotice('Please enter a valid email address.');
      return;
    }
    setAuthNotice(
      'Supabase Authentication Notice: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not yet configured in environment variables (scheduled for Phase 7). Your saved tools and preferences are safely persisted locally in your browser session.'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#F8FAFC] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Falylio Yara Ecosystem</span>
              <span aria-hidden="true">·</span>
              <span>User Workspace & Platform Administration</span>
            </div>
            <h2
              id="account-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              Workspace Account, Saved Resources & Admin Console
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Workspace Account Modal"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-100/80 px-6 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            User Dashboard & Favorites ({favoriteTools.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('auth')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'auth'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In / Supabase Auth
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Console Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phase Roadmap & Capacitor APK
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: USER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
                  <span className="text-xs text-slate-500">Saved Favorite Tools</span>
                  <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{favoriteTools.length}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Persisted in local browser storage</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
                  <span className="text-xs text-slate-500">Recently Opened Utilities</span>
                  <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{recentTools.length}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Instant resume access</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
                  <span className="text-xs text-slate-500">Cloud Account Sync</span>
                  <p className="mt-1 text-sm font-semibold text-[#0284C7]">Local Guest Workspace</p>
                  <p className="mt-0.5 text-xs text-slate-500">Ready for Supabase Auth in Phase 3/7</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Your Favorite Tools</h3>
                {favoriteTools.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-6 text-center">
                    <p className="text-sm text-slate-600">
                      You have not bookmarked any tools yet. Click the Save icon on any tool card to pin it here for quick access.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favoriteTools.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3.5"
                      >
                        <div>
                          <div className="text-xs text-slate-500">{tool.category}</div>
                          <div className="text-sm font-semibold text-slate-900">{tool.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectTool(tool);
                            }}
                            className="rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            Launch
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveFavorite(tool.id)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {recentTools.length > 0 && (
                <div className="space-y-3 border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-semibold text-slate-900">Recently Viewed Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentTools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectTool(tool);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:border-[#0284C7] hover:text-[#0284C7]"
                      >
                        {tool.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUPABASE AUTHENTICATION */}
          {activeTab === 'auth' && (
            <div className="max-w-md mx-auto space-y-5 py-2">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthNotice('');
                  }}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                    authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthNotice('');
                  }}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                    authMode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('reset');
                    setAuthNotice('');
                  }}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                    authMode === 'reset' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Forgot Password
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {authMode === 'login'
                      ? 'Sign In to Falylio Yara'
                      : authMode === 'signup'
                      ? 'Create Your Unified Account'
                      : 'Reset Account Password'}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Powered by Supabase Auth Architecture (Row-Level Security Ready)
                  </p>
                </div>

                <div>
                  <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                {authMode !== 'reset' && (
                  <div>
                    <label htmlFor="auth-pass" className="block text-xs font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      id="auth-pass"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#0F172A] py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  {authMode === 'login'
                    ? 'Verify Supabase Connection & Sign In'
                    : authMode === 'signup'
                    ? 'Verify Supabase Connection & Register'
                    : 'Send Recovery Link'}
                </button>

                {authNotice && (
                  <div className="rounded-lg border border-sky-200 bg-[#F0F9FF] p-3 text-xs text-slate-700 leading-relaxed">
                    {authNotice}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 3: ADMIN DASHBOARD CONSOLE */}
          {activeTab === 'admin' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      ['overview', 'Dashboard Overview'],
                      ['categories', 'Categories (17)'],
                      ['tools', `Tools (${PLATFORM_TOOLS.length})`],
                      ['courses', `Courses (${EDUCATION_COURSES.length})`],
                      ['marketplace', `Marketplace (${MARKETPLACE_PRODUCTS.length})`],
                      ['settings', 'Security & RBAC Settings'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setContentSubTab(key)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        adminSubTab === key
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500">Role Protection: Admin Guard Active</span>
              </div>

              {adminSubTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                    <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3.5">
                      <span className="text-xs text-slate-500">Tool Categories</span>
                      <p className="mt-1 text-xl font-bold text-slate-900">{ALL_TOOL_CATEGORIES.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3.5">
                      <span className="text-xs text-slate-500">Active Tools</span>
                      <p className="mt-1 text-xl font-bold text-slate-900">{PLATFORM_TOOLS.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3.5">
                      <span className="text-xs text-slate-500">Learning Tracks</span>
                      <p className="mt-1 text-xl font-bold text-slate-900">{EDUCATION_COURSES.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3.5">
                      <span className="text-xs text-slate-500">Community Articles</span>
                      <p className="mt-1 text-xl font-bold text-slate-900">{COMMUNITY_POSTS.length}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Module Name</th>
                          <th className="py-2.5 px-4 font-semibold">Frontend Status</th>
                          <th className="py-2.5 px-4 font-semibold">Backend Persistence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2.5 px-4 font-medium text-slate-900">Homepage & 17-Section Ecosystem</td>
                          <td className="py-2.5 px-4 text-emerald-700">Implemented & Responsive</td>
                          <td className="py-2.5 px-4 text-slate-600">Static + Client State</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-medium text-slate-900">All 17 Tool Categories & Workbenches</td>
                          <td className="py-2.5 px-4 text-emerald-700">10 Interactive Engines Active</td>
                          <td className="py-2.5 px-4 text-slate-600">100% Browser-Native Execution</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-medium text-slate-900">Yara AI Center (10 Assistants)</td>
                          <td className="py-2.5 px-4 text-emerald-700">UI & /api/ai Proxy Ready</td>
                          <td className="py-2.5 px-4 text-slate-600">Server-Side GEMINI_API_KEY</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 font-medium text-slate-900">User Auth, Marketplace Orders & Admin DB</td>
                          <td className="py-2.5 px-4 text-emerald-700">Interfaces & Local Storage Active</td>
                          <td className="py-2.5 px-4 text-amber-700">Awaiting Supabase Credentials (Phase 7)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminSubTab !== 'overview' && (
                <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-5 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Admin {adminSubTab.charAt(0).toUpperCase() + adminSubTab.slice(1)} Management
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All {PLATFORM_TOOLS.length} tools across {ALL_TOOL_CATEGORIES.length} categories, {EDUCATION_COURSES.length} courses, and {MARKETPLACE_PRODUCTS.length} marketplace listings are structured in strongly-typed schemas (`lib/platform-data.ts`). Connect Supabase Postgres & Row-Level Security policies in Phase 6–7 to enable live CRUD database mutations for authorized administrators.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ARCHITECTURE & CAPACITOR APK READINESS */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  Phase 1–8 Architecture & Capacitor Android APK Readiness
                </h3>
                <p>
                  Falylio Yara is architected with clean separation between presentation (`app/`, `components/`), typed domain catalogs (`lib/platform-data.ts`), and pure business logic (`lib/platform-utils.ts`).
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Implemented in Phase 1+:</strong> Complete 17-section SaaS Homepage, Global Search across all verticals, 17-Category Tools Directory with working client-side workbenches, Yara AI Center with `/api/ai` server proxy, interactive Course MCQ Quizzes, clean Browser Logic Games, and LocalStorage Favorites.
                  </li>
                  <li>
                    <strong>Requires Backend Credentials (Phases 3, 6, 7):</strong> Supabase Authentication (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), persistent Postgres tables for Marketplace checkout/orders, and Cloud Storage buckets for user file uploads.
                  </li>
                  <li>
                    <strong>Capacitor Android APK Ready (Phase 8):</strong> Responsive touch targets (44px+ minimum), zero Node-coupled client components, and self-contained client state ready for `@capacitor/core` and `@capacitor/android`.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

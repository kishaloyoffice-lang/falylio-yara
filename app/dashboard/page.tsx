'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Bookmark,
  Clock,
  FolderPlus,
  Shield,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Trash2,
  Chrome,
} from 'lucide-react';
import {
  PLATFORM_TOOLS,
  type PlatformTool,
} from '@/lib/platform-data';
import {
  createSafeBrowserClient,
  getSupabaseEnvDiagnostics,
  DEFAULT_SUPABASE_PROJECT_URL,
} from '@/utils/supabase/client';
import {
  getAccountState,
  postAccountAction,
  signInWithGoogleOAuth,
} from '@/utils/supabase/account-client';
import {
  validateAuthInput,
  validateProfileUpdate,
  type UserProfileRecord,
  type SavedItemRecord,
} from '@/lib/account-sync';
import { ToolWorkbenchModal } from '@/components/InteractiveWorkbenches';

export default function UserDashboardPage() {
  const [activeSection, setActiveSection] = useState<
    'overview' | 'profile' | 'favorites' | 'recents' | 'saved' | 'security'
  >('overview');

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify' | 'forgot'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [resendingCode, setResendingCode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Authenticated User & Profile
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    emailConfirmedAt?: string | null;
    createdAt?: string;
  } | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [profFullName, setProfFullName] = useState('');
  const [profUsername, setProfUsername] = useState('');
  const [profAvatar, setProfAvatar] = useState('/assets/fy/user-avatar.png');
  const [profMessage, setProfMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [profSaving, setProfSaving] = useState(false);

  // Favorites, Recents & Saved Items
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['tool-text-counter', 'tool-dev-json']);
  const [recentIds, setRecentIds] = useState<string[]>(['tool-office-invoice']);
  const [savedItems, setSavedItems] = useState<SavedItemRecord[]>([]);
  const [newSavedTitle, setNewSavedTitle] = useState('');
  const [newSavedType, setNewSavedType] = useState('tool');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Security password update
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  // Active Tool Modal
  const [activeTool, setActiveTool] = useState<PlatformTool | null>(null);

  const envDiag = getSupabaseEnvDiagnostics();

  // Load LocalStorage initial state
  useEffect(() => {
    try {
      const f = localStorage.getItem('fy_favorites');
      const r = localStorage.getItem('fy_recents');
      const s = localStorage.getItem('fy_saved_items');
      if (f) setFavoriteIds(JSON.parse(f));
      if (r) setRecentIds(JSON.parse(r));
      if (s) setSavedItems(JSON.parse(s));
    } catch {
      // Ignore
    }
  }, []);

  const loadAccountData = useCallback(async (migrateLocal = false) => {
    try {
      const data = await getAccountState();
      if (!data) return;

      if (data.authenticated && data.user) {
        setUser(data.user);
        if (data.profile) {
          setProfile(data.profile);
          setProfFullName(data.profile.full_name || '');
          setProfUsername(data.profile.username || '');
          setProfAvatar(data.profile.avatar_url || '/assets/fy/user-avatar.png');
        }
        if (Array.isArray(data.savedItems) && data.savedItems.length > 0) {
          setSavedItems(data.savedItems);
        }

        if (migrateLocal) {
          let localFavs: string[] = [];
          let localRecs: string[] = [];
          try {
            const f = localStorage.getItem('fy_favorites');
            const r = localStorage.getItem('fy_recents');
            if (f) localFavs = JSON.parse(f);
            if (r) localRecs = JSON.parse(r);
          } catch {
            // Ignore
          }

          const migData = await postAccountAction({
            action: 'migrate_local',
            localFavoriteIds: localFavs,
            localRecentIds: localRecs,
          });
          if (migData?.ok) {
            setFavoriteIds(migData.mergedFavoriteIds || []);
            setRecentIds(migData.mergedRecentIds || []);
            setSyncNotice(
              `Synced LocalStorage to Supabase (${migData.migratedFavoritesCount} favorites, ${migData.migratedRecentsCount} recent tools migrated).`
            );
          }
        } else {
          const cloudFavs = Array.isArray(data.favorites)
            ? data.favorites.map((x: { item_id: string }) => x.item_id)
            : [];
          const cloudRecs = Array.isArray(data.recentlyViewed)
            ? data.recentlyViewed.map((x: { item_id: string }) => x.item_id)
            : [];
          if (cloudFavs.length > 0) {
            setFavoriteIds((prev) => Array.from(new Set([...cloudFavs, ...prev])));
          }
          if (cloudRecs.length > 0) {
            setRecentIds((prev) => Array.from(new Set([...cloudRecs, ...prev])).slice(0, 12));
          }
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch {
      // Ignore network error
    }
  }, []);

  useEffect(() => {
    loadAccountData(false);
  }, [loadAccountData]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        loadAccountData(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadAccountData]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);

    const validation = validateAuthInput({
      mode: authMode,
      email: emailInput,
      password: passwordInput,
      fullName: fullNameInput,
      username: usernameInput,
      otpCode: otpCodeInput,
    });

    if (!validation.valid) {
      setAuthMessage({ type: 'err', text: validation.error || 'Invalid input.' });
      return;
    }

    const supabase = createSafeBrowserClient();
    if (!supabase) {
      setAuthMessage({
        type: 'err',
        text: `Supabase Publishable Key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) is not configured in .env.local for ${DEFAULT_SUPABASE_PROJECT_URL}.`,
      });
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: validation.sanitizedEmail,
          password: passwordInput,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            data: {
              full_name:
                validation.sanitizedFullName || validation.sanitizedEmail.split('@')[0],
              username: validation.sanitizedUsername || null,
              avatar_url: '/assets/fy/user-avatar.png',
            },
          },
        });
        if (error) {
          setAuthMessage({ type: 'err', text: error.message });
        } else if (data.user && !data.session) {
          setEmailInput(validation.sanitizedEmail);
          setOtpCodeInput('');
          setAuthMode('verify');
          setAuthMessage({
            type: 'ok',
            text: `Verification code sent to ${validation.sanitizedEmail}! Enter the 6–8 digit code below to verify and activate your account.`,
          });
        } else if (data.session) {
          setAuthMessage({ type: 'ok', text: 'Account created and signed in!' });
          await loadAccountData(true);
        }
      } else if (authMode === 'verify') {
        let verifyResult = await supabase.auth.verifyOtp({
          email: validation.sanitizedEmail,
          token: validation.sanitizedOtpCode,
          type: 'signup',
        });

        if (verifyResult.error) {
          const fallbackResult = await supabase.auth.verifyOtp({
            email: validation.sanitizedEmail,
            token: validation.sanitizedOtpCode,
            type: 'email',
          });
          if (!fallbackResult.error) {
            verifyResult = fallbackResult;
          }
        }

        if (verifyResult.error) {
          setAuthMessage({ type: 'err', text: verifyResult.error.message });
        } else {
          setAuthMessage({
            type: 'ok',
            text: 'Account verified and activated! Syncing your workspace...',
          });
          setOtpCodeInput('');
          await loadAccountData(true);
        }
      } else if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validation.sanitizedEmail,
          password: passwordInput,
        });
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setAuthMode('verify');
            setAuthMessage({
              type: 'err',
              text: 'Your email is not verified yet. Enter your verification code below or click "Resend Code".',
            });
          } else {
            setAuthMessage({ type: 'err', text: error.message });
          }
        } else if (data.session) {
          setAuthMessage({ type: 'ok', text: 'Signed in! Migrating local tools to cloud...' });
          await loadAccountData(true);
        }
      } else if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(validation.sanitizedEmail, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) {
          setAuthMessage({ type: 'err', text: error.message });
        } else {
          setAuthMessage({
            type: 'ok',
            text: `Password recovery link sent to ${validation.sanitizedEmail}.`,
          });
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendCode = async () => {
    setAuthMessage(null);
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthMessage({ type: 'err', text: 'Please enter your registered email address first.' });
      return;
    }

    const supabase = createSafeBrowserClient();
    if (!supabase) return;

    setResendingCode(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });
      if (error) {
        setAuthMessage({ type: 'err', text: error.message });
      } else {
        setAuthMessage({
          type: 'ok',
          text: `A fresh verification code has been sent to ${cleanEmail}.`,
        });
      }
    } finally {
      setResendingCode(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthMessage(null);
    setAuthLoading(true);
    try {
      const res = await signInWithGoogleOAuth('/dashboard');
      if (!res.ok) {
        setAuthMessage({ type: 'err', text: res.error || 'Could not start Google Sign-In.' });
        setAuthLoading(false);
      }
    } catch (err) {
      setAuthMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to start Google Sign-In.',
      });
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createSafeBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSyncNotice('Signed out of Supabase session. LocalStorage remains intact.');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfMessage(null);
    const val = validateProfileUpdate({
      fullName: profFullName,
      username: profUsername,
      avatarUrl: profAvatar,
    });
    if (!val.valid) {
      setProfMessage({ type: 'err', text: val.error || 'Invalid profile fields.' });
      return;
    }

    setProfSaving(true);
    try {
      const data = await postAccountAction({
        action: 'update_profile',
        fullName: profFullName,
        username: profUsername,
        avatarUrl: profAvatar,
      });
      if (!data?.ok) {
        setProfMessage({ type: 'err', text: data?.error || 'Failed to update profile.' });
      } else {
        if (data.profile) setProfile(data.profile);
        setProfMessage({ type: 'ok', text: 'Profile updated in Supabase!' });
      }
    } finally {
      setProfSaving(false);
    }
  };

  const handleToggleFavorite = async (toolId: string) => {
    const next = favoriteIds.includes(toolId)
      ? favoriteIds.filter((id) => id !== toolId)
      : [...favoriteIds, toolId];
    setFavoriteIds(next);
    try {
      localStorage.setItem('fy_favorites', JSON.stringify(next));
    } catch {
      // Ignore
    }
    if (user) {
      await postAccountAction({
        action: 'toggle_favorite',
        itemId: toolId,
        itemType: 'tool',
      });
    }
  };

  const handleAddSavedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSavedTitle.trim()) return;
    const itemId = `saved-${Date.now()}`;
    const newItem: SavedItemRecord = {
      id: itemId,
      user_id: user?.id || 'local-guest',
      item_id: itemId,
      item_type: newSavedType,
      title: newSavedTitle.trim(),
      created_at: new Date().toISOString(),
    };

    if (user) {
      const data = await postAccountAction({
        action: 'save_item',
        itemId,
        itemType: newSavedType,
        title: newSavedTitle.trim(),
      });
      if (data?.ok && data.savedItem) {
        setSavedItems((prev) => [data.savedItem!, ...prev]);
        setNewSavedTitle('');
        return;
      }
    }

    const updated = [newItem, ...savedItems];
    setSavedItems(updated);
    setNewSavedTitle('');
    try {
      localStorage.setItem('fy_saved_items', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleRemoveSavedItem = async (itemId: string) => {
    if (user) {
      await postAccountAction({
        action: 'remove_saved_item',
        itemId,
      });
    }
    const next = savedItems.filter((i) => i.item_id !== itemId);
    setSavedItems(next);
    try {
      localStorage.setItem('fy_saved_items', JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);
    const val = validateAuthInput({
      mode: 'reset',
      password: newPassword,
      confirmPassword: confirmNewPassword,
    });
    if (!val.valid) {
      setSecurityMessage({ type: 'err', text: val.error || 'Invalid password.' });
      return;
    }

    const supabase = createSafeBrowserClient();
    if (!supabase) {
      setSecurityMessage({
        type: 'err',
        text: 'Supabase client is not configured in .env.local.',
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setSecurityMessage({ type: 'err', text: error.message });
    } else {
      setSecurityMessage({ type: 'ok', text: 'Password updated in Supabase Auth!' });
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const favoriteTools = PLATFORM_TOOLS.filter((t) => favoriteIds.includes(t.id));
  const recentTools = recentIds
    .map((id) => PLATFORM_TOOLS.find((t) => t.id === id))
    .filter((t): t is PlatformTool => Boolean(t));

  return (
    <div className="min-h-screen bg-[#060B19] text-white flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#16264C] bg-[#070D1F] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[#1E3468] bg-[#0E1936] px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-[#00D2FF] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 text-[#00D2FF]" />
            <span>Back to Platform</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/fy/logo-mark.png"
              alt="Falylio Yara"
              className="h-8 w-auto object-contain"
            />
            <span className="text-base font-extrabold">
              Falylio <span className="text-[#00D2FF]">Yara</span> Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3.5 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-3">
          <div className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4 flex items-center gap-3">
            <img
              src={profAvatar || '/assets/fy/user-avatar.png'}
              alt="Profile Avatar"
              className="h-12 w-12 rounded-full object-cover border border-[#00D2FF]"
            />
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">
                {profFullName || user?.email || 'Guest Workspace'}
              </div>
              <div className="text-xs text-[#00D2FF] truncate">
                {user ? `@${profUsername || 'member'}` : 'Not Signed In'}
              </div>
            </div>
          </div>

          <nav className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-2.5 space-y-1">
            {(
              [
                ['overview', 'Account Overview', <User key="u" className="h-4 w-4" />],
                ['profile', 'Profile Settings', <User key="p" className="h-4 w-4" />],
                [
                  'favorites',
                  `Favorite Tools (${favoriteTools.length})`,
                  <Bookmark key="f" className="h-4 w-4" />,
                ],
                [
                  'recents',
                  `Recently Viewed (${recentTools.length})`,
                  <Clock key="r" className="h-4 w-4" />,
                ],
                [
                  'saved',
                  `Saved Items (${savedItems.length})`,
                  <FolderPlus key="s" className="h-4 w-4" />,
                ],
                ['security', 'Account Security', <Shield key="sec" className="h-4 w-4" />],
              ] as const
            ).map(([id, label, icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === id
                    ? 'bg-gradient-to-r from-[#00A8FF] to-[#0055FF] text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-[#101E3E]'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Panel */}
        <main className="lg:col-span-9 space-y-5">
          {!envDiag.isConfigured && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/35 p-4 text-xs text-amber-200 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Supabase Environment Key Missing</span>
              </div>
              <p>
                Project URL is set to <code className="text-white">{DEFAULT_SUPABASE_PROJECT_URL}</code>.
                Please ensure <code className="text-white">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> is
                defined in <code className="text-white">.env.local</code> and restart the server.
              </p>
            </div>
          )}

          {syncNotice && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-200 flex items-center justify-between">
              <span>{syncNotice}</span>
              <button
                type="button"
                onClick={() => setSyncNotice(null)}
                className="underline text-emerald-300"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeSection === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4">
                  <div className="text-xs text-slate-400">Favorite Tools</div>
                  <div className="mt-1 text-2xl font-extrabold text-white">{favoriteTools.length}</div>
                  <div className="text-[11px] text-[#00D2FF] mt-0.5">
                    {user ? 'Cloud + Local Synced' : 'Saved in LocalStorage'}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4">
                  <div className="text-xs text-slate-400">Recently Viewed</div>
                  <div className="mt-1 text-2xl font-extrabold text-white">{recentTools.length}</div>
                  <div className="text-[11px] text-purple-300 mt-0.5">Quick-resume utilities</div>
                </div>
                <div className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4">
                  <div className="text-xs text-slate-400">Saved Items</div>
                  <div className="mt-1 text-2xl font-extrabold text-white">{savedItems.length}</div>
                  <div className="text-[11px] text-emerald-300 mt-0.5">Custom workspace pins</div>
                </div>
              </div>

              {!user && (
                <div className="rounded-2xl border border-[#1E3468] bg-[#0A1329] p-6 max-w-lg">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['login', 'signup', 'verify', 'forgot'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setAuthMode(m);
                          setAuthMessage(null);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize ${
                          authMode === m
                            ? 'bg-[#0072FF] text-white'
                            : 'bg-[#101E3E] text-slate-300'
                        }`}
                      >
                        {m === 'forgot'
                          ? 'Forgot Password'
                          : m === 'verify'
                          ? 'Verify Code'
                          : m}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                    {(authMode === 'login' || authMode === 'signup') && (
                      <div className="space-y-3">
                        <button
                          type="button"
                          disabled={authLoading}
                          onClick={handleGoogleLogin}
                          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-[#2B4C94] bg-[#101F42] hover:bg-[#162B5B] hover:border-[#00D2FF] py-2.5 px-4 text-xs font-bold text-white transition-all shadow-sm disabled:opacity-50"
                        >
                          <Chrome className="h-4 w-4 text-[#00D2FF]" />
                          <span>Continue with Google (One-Click)</span>
                        </button>
                        <div className="relative flex items-center py-0.5">
                          <div className="flex-grow border-t border-[#1C3264]" />
                          <span className="mx-3 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Or with Email
                          </span>
                          <div className="flex-grow border-t border-[#1C3264]" />
                        </div>
                      </div>
                    )}
                    {authMode === 'signup' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={fullNameInput}
                          onChange={(e) => setFullNameInput(e.target.value)}
                          placeholder="Full Name"
                          aria-label="Full Name"
                          className="rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="Username"
                          aria-label="Username"
                          className="rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                        />
                      </div>
                    )}
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Email address"
                      aria-label="Email address"
                      className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                    />
                    {authMode === 'verify' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={8}
                          required
                          value={otpCodeInput}
                          onChange={(e) => setOtpCodeInput(e.target.value.replace(/\s+/g, ''))}
                          placeholder="Enter 6–8 digit Verification Code"
                          aria-label="Verification Code"
                          className="w-full rounded-xl border-2 border-[#00D2FF]/60 bg-[#081024] px-4 py-3 text-center font-mono text-lg font-extrabold tracking-[0.35em] text-white placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:text-slate-400"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Didn&apos;t receive the verification code?</span>
                          <button
                            type="button"
                            disabled={resendingCode}
                            onClick={handleResendCode}
                            className="font-bold text-[#00D2FF] hover:underline disabled:opacity-50"
                          >
                            {resendingCode ? 'Sending...' : 'Resend Code'}
                          </button>
                        </div>
                      </div>
                    )}
                    {authMode !== 'forgot' && authMode !== 'verify' && (
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Password (6+ chars)"
                        aria-label="Password"
                        className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                      />
                    )}
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full rounded-xl bg-gradient-to-r from-[#00A8FF] to-[#7C3AED] py-2.5 text-xs font-bold text-white"
                    >
                      {authLoading
                        ? 'Connecting to Supabase...'
                        : authMode === 'login'
                        ? 'Sign In & Migrate LocalStorage'
                        : authMode === 'signup'
                        ? 'Register & Send Verification Code'
                        : authMode === 'verify'
                        ? 'Verify Code & Activate Account'
                        : 'Send Recovery Link'}
                    </button>
                    {authMessage && (
                      <div
                        className={`rounded-xl border p-3 text-xs ${
                          authMessage.type === 'ok'
                            ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
                            : 'border-rose-500/40 bg-rose-950/50 text-rose-200'
                        }`}
                      >
                        {authMessage.text}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-6 max-w-xl space-y-4">
              <h2 className="text-base font-bold text-white">Profile Settings</h2>
              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profFullName}
                    onChange={(e) => setProfFullName(e.target.value)}
                    className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={profUsername}
                    onChange={(e) => setProfUsername(e.target.value)}
                    className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Avatar URL</label>
                  <input
                    type="text"
                    value={profAvatar}
                    onChange={(e) => setProfAvatar(e.target.value)}
                    className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={profSaving || !user}
                  className="rounded-xl bg-[#0072FF] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  {profSaving ? 'Saving...' : 'Save Profile'}
                </button>
                {profMessage && (
                  <div className="text-xs text-sky-300 pt-1">{profMessage.text}</div>
                )}
              </form>
            </div>
          )}

          {activeSection === 'favorites' && (
            <div className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-6 space-y-4">
              <h2 className="text-base font-bold text-white">Favorite Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="rounded-xl border border-[#1E3468] bg-[#0E1936] p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[11px] text-[#00D2FF] font-semibold">{tool.category}</div>
                      <div className="text-sm font-bold text-white">{tool.name}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTool(tool)}
                        className="rounded-lg bg-[#0072FF] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(tool.id)}
                        className="rounded-lg border border-[#243E7A] px-2.5 py-1.5 text-xs text-slate-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'recents' && (
            <div className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-6 space-y-4">
              <h2 className="text-base font-bold text-white">Recently Viewed Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="rounded-xl border border-[#1E3468] bg-[#0E1936] p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[11px] text-purple-300 font-semibold">{tool.category}</div>
                      <div className="text-sm font-bold text-white">{tool.name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTool(tool)}
                      className="rounded-lg bg-[#0072FF] px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Launch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'saved' && (
            <div className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-6 space-y-4">
              <h2 className="text-base font-bold text-white">Saved Items</h2>
              <form onSubmit={handleAddSavedItem} className="flex gap-2">
                <input
                  type="text"
                  value={newSavedTitle}
                  onChange={(e) => setNewSavedTitle(e.target.value)}
                  placeholder="Save an item title..."
                  className="flex-1 rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                />
                <select
                  value={newSavedType}
                  onChange={(e) => setNewSavedType(e.target.value)}
                  className="rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                >
                  <option value="tool">Tool</option>
                  <option value="course">Course</option>
                  <option value="marketplace">Marketplace</option>
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0072FF] px-4 py-2 text-xs font-bold text-white"
                >
                  Save
                </button>
              </form>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="rounded-xl border border-[#1E3468] bg-[#0E1936] p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#00D2FF]">
                        {item.item_type}
                      </span>
                      <div className="text-sm font-bold text-white">{item.title}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSavedItem(item.item_id)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-6 max-w-lg space-y-4">
              <h2 className="text-base font-bold text-white">Account Security &amp; Password Reset</h2>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                />
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#0072FF] px-4 py-2 text-xs font-bold text-white"
                >
                  Update Password
                </button>
                {securityMessage && (
                  <div className="text-xs text-sky-300 pt-1">{securityMessage.text}</div>
                )}
              </form>
            </div>
          )}
        </main>
      </div>

      <ToolWorkbenchModal
        tool={activeTool}
        onClose={() => setActiveTool(null)}
        isFavorite={activeTool ? favoriteIds.includes(activeTool.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}

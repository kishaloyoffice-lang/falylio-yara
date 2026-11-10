'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  User,
  Shield,
  Bookmark,
  Clock,
  Settings,
  Lock,
  Database,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Wrench,
  LogOut,
  Mail,
  KeyRound,
  RefreshCw,
  FolderPlus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Chrome,
} from 'lucide-react';
import {
  PLATFORM_TOOLS,
  ALL_TOOL_CATEGORIES,
  EDUCATION_COURSES,
  MARKETPLACE_PRODUCTS,
  COMMUNITY_POSTS,
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
import { AdminControlPanelView } from './AdminControlPanelView';

export interface AuthenticatedUserSummary {
  id: string;
  email?: string;
  emailConfirmedAt?: string | null;
  createdAt?: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string;
}

export function AccountAndAdminModal({
  isOpen,
  initialTab = 'dashboard',
  onClose,
  favoriteIds,
  recentToolIds,
  onSelectTool,
  onRemoveFavorite,
  onCloudStateSynced,
  onAuthUserChanged,
  onAdminContentChanged,
}: {
  isOpen: boolean;
  initialTab?: 'dashboard' | 'auth' | 'profile' | 'saved' | 'security' | 'admin' | 'architecture';
  onClose: () => void;
  favoriteIds: string[];
  recentToolIds: string[];
  onSelectTool: (tool: PlatformTool) => void;
  onRemoveFavorite: (id: string) => void;
  onCloudStateSynced?: (mergedFavorites: string[], mergedRecents: string[]) => void;
  onAuthUserChanged?: (user: AuthenticatedUserSummary | null) => void;
  onAdminContentChanged?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'auth' | 'profile' | 'saved' | 'security' | 'admin' | 'architecture'
  >(initialTab);

  // Sync activeTab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Auth Modes: login | signup | verify | forgot | reset
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify' | 'forgot' | 'reset'>(
    'login'
  );
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [resendingCode, setResendingCode] = useState(false);

  // Status & Feedback
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Authenticated User & Profile State
  const [currentUser, setCurrentUser] = useState<AuthenticatedUserSummary | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [profileFullName, setProfileFullName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('/assets/fy/user-avatar.png');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  // Saved Items State
  const [savedItems, setSavedItems] = useState<SavedItemRecord[]>([]);
  const [newSavedTitle, setNewSavedTitle] = useState('');
  const [newSavedType, setNewSavedType] = useState('tool');
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [dbWarnings, setDbWarnings] = useState<string[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);

  const envDiag = getSupabaseEnvDiagnostics();

  // Load local saved items fallback
  useEffect(() => {
    try {
      const raw = localStorage.getItem('fy_saved_items');
      if (raw) {
        setSavedItems(JSON.parse(raw));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const syncAccountFromServer = useCallback(
    async (triggerMigration = false) => {
      try {
        const data = await getAccountState();
        if (!data) return;

        if (data.authenticated && data.user) {
          const userSummary: AuthenticatedUserSummary = {
            id: data.user.id,
            email: data.user.email,
            emailConfirmedAt: data.user.emailConfirmedAt,
            createdAt: data.user.createdAt,
            fullName: data.profile?.full_name || data.user.email?.split('@')[0],
            username: data.profile?.username || '',
            avatarUrl: data.profile?.avatar_url || '/assets/fy/user-avatar.png',
          };
          setCurrentUser(userSummary);
          onAuthUserChanged?.(userSummary);

          if (data.profile) {
            setProfile(data.profile);
            setProfileFullName(data.profile.full_name || '');
            setProfileUsername(data.profile.username || '');
            setProfileAvatarUrl(data.profile.avatar_url || '/assets/fy/user-avatar.png');
          }

          if (Array.isArray(data.savedItems) && data.savedItems.length > 0) {
            setSavedItems(data.savedItems);
          }

          if (Array.isArray(data.dbErrors)) {
            setDbWarnings(data.dbErrors);
          }

          // Automatically migrate LocalStorage favorites and recents on login
          if (triggerMigration) {
            let localFavs = favoriteIds;
            let localRecs = recentToolIds;
            try {
              const sf = localStorage.getItem('fy_favorites');
              const sr = localStorage.getItem('fy_recents');
              if (sf) localFavs = JSON.parse(sf);
              if (sr) localRecs = JSON.parse(sr);
            } catch {
              // Ignore
            }

            const migData = await postAccountAction({
              action: 'migrate_local',
              localFavoriteIds: localFavs,
              localRecentIds: localRecs,
            });
            if (migData?.ok) {
              setMigrationStatus(
                `Cloud sync complete (${migData.migratedFavoritesCount} new favorites, ${migData.migratedRecentsCount} recent tools migrated).`
              );
              onCloudStateSynced?.(
                migData.mergedFavoriteIds || [],
                migData.mergedRecentIds || []
              );
            }
          } else {
            const cloudFavIds = Array.isArray(data.favorites)
              ? data.favorites.map((r: { item_id: string }) => r.item_id)
              : [];
            const cloudRecIds = Array.isArray(data.recentlyViewed)
              ? data.recentlyViewed.map((r: { item_id: string }) => r.item_id)
              : [];
            if (cloudFavIds.length > 0 || cloudRecIds.length > 0) {
              const mergedFavs = Array.from(new Set([...cloudFavIds, ...favoriteIds]));
              const mergedRecs = Array.from(new Set([...cloudRecIds, ...recentToolIds])).slice(
                0,
                12
              );
              onCloudStateSynced?.(mergedFavs, mergedRecs);
            }
          }
        } else {
          setCurrentUser(null);
          setProfile(null);
          onAuthUserChanged?.(null);
        }
      } catch {
        // Network or unconfigured state
      }
    },
    [favoriteIds, recentToolIds, onCloudStateSynced, onAuthUserChanged]
  );

  useEffect(() => {
    if (isOpen) {
      syncAccountFromServer(false);
    }
  }, [isOpen, syncAccountFromServer]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        syncAccountFromServer(true);
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [syncAccountFromServer]);

  if (!isOpen) return null;

  const favoriteTools = PLATFORM_TOOLS.filter((t) => favoriteIds.includes(t.id));
  const recentTools = recentToolIds
    .map((id) => PLATFORM_TOOLS.find((t) => t.id === id))
    .filter((t): t is PlatformTool => Boolean(t));

  // Handle Login, Registration, Verify Code (OTP), Forgot Password, and Password Reset via real Supabase Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const validation = validateAuthInput({
      mode: authMode,
      email: emailInput,
      password: passwordInput,
      confirmPassword: confirmPasswordInput,
      fullName: signupFullName,
      username: signupUsername,
      otpCode: otpCodeInput,
    });

    if (!validation.valid) {
      setAuthError(validation.error || 'Invalid input.');
      return;
    }

    const supabase = createSafeBrowserClient();
    if (!supabase) {
      setAuthError(
        `Supabase client is not initialized because NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set in .env.local for project ${DEFAULT_SUPABASE_PROJECT_URL}.`
      );
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
        const { data, error } = await supabase.auth.signUp({
          email: validation.sanitizedEmail,
          password: passwordInput,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              full_name:
                validation.sanitizedFullName || validation.sanitizedEmail.split('@')[0],
              username: validation.sanitizedUsername || null,
              avatar_url: '/assets/fy/user-avatar.png',
            },
          },
        });

        if (error) {
          setAuthError(error.message);
        } else if (data.user && !data.session) {
          setEmailInput(validation.sanitizedEmail);
          setOtpCodeInput('');
          setAuthMode('verify');
          setAuthSuccess(
            `Verification code sent to ${validation.sanitizedEmail}! Enter the code from your email below to verify and activate your account.`
          );
        } else if (data.session) {
          setAuthSuccess('Account created and signed in! Migrating local workspace to cloud...');
          await syncAccountFromServer(true);
          setActiveTab('dashboard');
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
          setAuthError(verifyResult.error.message);
        } else {
          setAuthSuccess('Account verified and activated! Syncing your workspace to Supabase...');
          setOtpCodeInput('');
          await syncAccountFromServer(true);
          setActiveTab('dashboard');
        }
      } else if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: validation.sanitizedEmail,
          password: passwordInput,
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setAuthMode('verify');
            setAuthError(
              'Your email is not verified yet. Please enter your verification code below or click "Resend Verification Code".'
            );
          } else {
            setAuthError(error.message);
          }
        } else if (data.session) {
          setAuthSuccess('Signed in! Syncing your LocalStorage favorites with Supabase...');
          await syncAccountFromServer(true);
          setActiveTab('dashboard');
        }
      } else if (authMode === 'forgot') {
        const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(validation.sanitizedEmail, {
          redirectTo,
        });
        if (error) {
          setAuthError(error.message);
        } else {
          setAuthSuccess(
            `Password reset email sent to ${validation.sanitizedEmail}. Click the link in your email to set a new password.`
          );
        }
      } else if (authMode === 'reset') {
        const { error } = await supabase.auth.updateUser({
          password: passwordInput,
        });
        if (error) {
          setAuthError(error.message);
        } else {
          setAuthSuccess('Your password has been updated in Supabase Auth.');
          setPasswordInput('');
          setConfirmPasswordInput('');
        }
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unexpected authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter your registered email address first.');
      return;
    }

    const supabase = createSafeBrowserClient();
    if (!supabase) {
      setAuthError('Supabase client is not configured.');
      return;
    }

    setResendingCode(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthSuccess(`A new verification code has been sent to ${cleanEmail}.`);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to resend verification code.');
    } finally {
      setResendingCode(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);
    try {
      const res = await signInWithGoogleOAuth('/dashboard');
      if (!res.ok) {
        setAuthError(res.error || 'Could not initiate Google Sign-In.');
        setAuthLoading(false);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to start Google Sign-In.');
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const supabase = createSafeBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      setCurrentUser(null);
      setProfile(null);
      onAuthUserChanged?.(null);
      setAuthSuccess('You have been logged out. LocalStorage tools remain available offline.');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Error signing out.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    const validation = validateProfileUpdate({
      fullName: profileFullName,
      username: profileUsername,
      avatarUrl: profileAvatarUrl,
    });

    if (!validation.valid) {
      setProfileMessage({ type: 'err', text: validation.error || 'Invalid profile data.' });
      return;
    }

    setProfileSaving(true);
    try {
      const data = await postAccountAction({
        action: 'update_profile',
        fullName: profileFullName,
        username: profileUsername,
        avatarUrl: profileAvatarUrl,
      });
      if (!data?.ok) {
        setProfileMessage({
          type: 'err',
          text: data?.error || 'Could not update profile in Supabase.',
        });
      } else {
        if (data.profile) setProfile(data.profile);
        setProfileMessage({
          type: 'ok',
          text: 'Profile saved to Supabase public.profiles!',
        });
        await syncAccountFromServer(false);
      }
    } catch (err) {
      setProfileMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Network error updating profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddSavedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSavedTitle.trim()) return;
    const itemId = `saved-${Date.now()}`;
    const newItem: SavedItemRecord = {
      id: itemId,
      user_id: currentUser?.id || 'local-guest',
      item_id: itemId,
      item_type: newSavedType,
      title: newSavedTitle.trim(),
      created_at: new Date().toISOString(),
    };

    if (currentUser) {
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

    // Fallback to localStorage for guests or if table not yet migrated
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
    if (currentUser) {
      await postAccountAction({
        action: 'remove_saved_item',
        itemId,
      });
    }
    const next = savedItems.filter((item) => item.item_id !== itemId);
    setSavedItems(next);
    try {
      localStorage.setItem('fy_saved_items', JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#1E366D] bg-[#081024] text-white shadow-[0_0_50px_rgba(0,114,255,0.25)]">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b border-[#162852] bg-[#060C1D] px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatarUrl || '/assets/fy/user-avatar.png'}
              alt="User Avatar"
              className="h-10 w-10 rounded-full object-cover border border-[#00D2FF]"
            />
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Falylio Yara Ecosystem</span>
                <span>•</span>
                <span className={currentUser ? 'text-emerald-400 font-semibold' : 'text-[#00D2FF]'}>
                  {currentUser ? `Authenticated (${currentUser.email})` : 'Guest Session (Local + Cloud Ready)'}
                </span>
              </div>
              <h2
                id="account-modal-title"
                className="text-base sm:text-lg font-bold text-white"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                User Account, Cloud Sync &amp; Workspace Dashboard
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#00D2FF]/50 bg-[#0D1E42] px-3 py-1.5 text-xs font-bold text-[#00D2FF] hover:bg-[#0072FF] hover:text-white transition-colors"
            >
              <span>Full Page Dashboard</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Workspace Account Modal"
              className="rounded-xl border border-[#1E3468] bg-[#0F1B38] p-2 text-slate-300 hover:text-white hover:border-[#00D2FF]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#162852] bg-[#0A1329] px-5 py-2.5">
          {(
            [
              ['dashboard', `Account Overview (${favoriteTools.length})`],
              ['auth', currentUser ? 'Session & Auth' : 'Login / Sign Up'],
              ['profile', 'Profile Settings'],
              ['saved', `Saved Items (${savedItems.length})`],
              ['security', 'Security & RLS SQL'],
              ['admin', 'Admin Console'],
            ] as const
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tabKey
                  ? 'bg-gradient-to-r from-[#00A8FF] to-[#0055FF] text-white shadow-[0_0_12px_rgba(0,168,255,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-[#122247]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Environment Diagnostics Banner when NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing */}
          {!envDiag.isConfigured && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/35 p-4 text-xs text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Supabase Environment Configuration Required</span>
              </div>
              <p className="leading-relaxed">
                Project URL is configured for{' '}
                <code className="text-white font-mono">{DEFAULT_SUPABASE_PROJECT_URL}</code>, but{' '}
                <code className="text-white font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>{' '}
                was not detected in <code className="text-white font-mono">.env.local</code>. Add your
                publishable key to <code className="text-white font-mono">.env.local</code> to enable
                live Supabase Auth and cloud table sync. LocalStorage persistence remains active.
              </p>
            </div>
          )}

          {migrationStatus && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{migrationStatus}</span>
              </span>
              <button
                type="button"
                onClick={() => setMigrationStatus(null)}
                className="text-emerald-300 underline ml-3"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: ACCOUNT OVERVIEW & FAVORITES / RECENTS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4">
                  <span className="text-xs text-slate-400">Account Status</span>
                  <p className="mt-1 text-sm font-bold text-[#00D2FF] truncate">
                    {currentUser ? currentUser.fullName || currentUser.email : 'Local Guest Mode'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {currentUser
                      ? currentUser.emailConfirmedAt
                        ? 'Email Verified'
                        : 'Pending Email Verification'
                      : 'Sign in to sync across devices'}
                  </p>
                </div>

                <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4">
                  <span className="text-xs text-slate-400">Favorite Tools</span>
                  <p className="mt-1 text-2xl font-extrabold text-white tabular-nums">
                    {favoriteTools.length}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {currentUser ? 'Synced to user_favorites' : 'Stored in LocalStorage'}
                  </p>
                </div>

                <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4">
                  <span className="text-xs text-slate-400">Recently Viewed</span>
                  <p className="mt-1 text-2xl font-extrabold text-white tabular-nums">
                    {recentTools.length}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {currentUser ? 'Synced to recently_viewed' : 'Instant resume history'}
                  </p>
                </div>

                <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400">LocalStorage → Cloud</span>
                  {currentUser ? (
                    <button
                      type="button"
                      onClick={() => syncAccountFromServer(true)}
                      className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0072FF] py-1.5 px-3 text-xs font-bold text-white hover:bg-[#0055FF]"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Sync Now</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('auth')}
                      className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00A8FF] to-[#7C3AED] py-1.5 px-3 text-xs font-bold text-white"
                    >
                      <span>Sign In to Sync</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Favorite Tools */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-[#00D2FF]" />
                  <span>Favorite Tools</span>
                </h3>
                {favoriteTools.length === 0 ? (
                  <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-6 text-center text-xs text-slate-400">
                    No favorite tools saved yet. Click the bookmark icon on any tool card to pin it here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favoriteTools.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between rounded-xl border border-[#1E3468] bg-[#0E1936] p-3.5"
                      >
                        <div>
                          <div className="text-[11px] font-semibold text-[#00D2FF]">
                            {tool.category}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-white">{tool.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectTool(tool);
                            }}
                            className="rounded-lg bg-[#0072FF] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0055FF]"
                          >
                            Launch
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveFavorite(tool.id)}
                            className="rounded-lg border border-[#243E7A] bg-[#101E3E] px-2.5 py-1.5 text-xs text-slate-300 hover:text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recently Viewed Tools */}
              {recentTools.length > 0 && (
                <div className="space-y-3 border-t border-[#162852] pt-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span>Recently Viewed Tools</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentTools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectTool(tool);
                        }}
                        className="rounded-xl border border-[#1E3468] bg-[#0E1936] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-[#00D2FF] hover:text-white transition-colors"
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
            <div className="max-w-md mx-auto space-y-4 py-1">
              <div className="grid grid-cols-5 gap-1 rounded-xl bg-[#0D1834] p-1 border border-[#1B3164]">
                {(
                  [
                    ['login', 'Login'],
                    ['signup', 'Register'],
                    ['verify', 'Verify Code'],
                    ['forgot', 'Forgot'],
                    ['reset', 'Reset Pass'],
                  ] as const
                ).map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setAuthMode(m);
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className={`rounded-lg py-1.5 text-[11px] font-bold transition-colors ${
                      authMode === m
                        ? 'bg-[#0072FF] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleAuthSubmit}
                className="space-y-4 rounded-2xl border border-[#1E3468] bg-[#0D1834] p-5"
              >
                <div>
                  <h3 className="text-base font-bold text-white">
                    {authMode === 'login'
                      ? 'Sign In to Falylio Yara'
                      : authMode === 'signup'
                      ? 'Create Your Falylio Yara Account'
                      : authMode === 'verify'
                      ? 'Verify Your Account with Code'
                      : authMode === 'forgot'
                      ? 'Send Password Recovery Email'
                      : 'Update Your Account Password'}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {authMode === 'verify'
                      ? 'Enter the 6–8 digit verification code sent to your email address'
                      : `Connected to Supabase Auth (${DEFAULT_SUPABASE_PROJECT_URL})`}
                  </p>
                </div>

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
                    <div className="relative flex items-center py-1">
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
                    <div>
                      <label
                        htmlFor="auth-fullname"
                        className="block text-xs font-semibold text-slate-300 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        id="auth-fullname"
                        type="text"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        placeholder="Amina Rahman"
                        className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white focus:border-[#00D2FF] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="auth-username"
                        className="block text-xs font-semibold text-slate-300 mb-1"
                      >
                        Username
                      </label>
                      <input
                        id="auth-username"
                        type="text"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="amina_dev"
                        className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white focus:border-[#00D2FF] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {authMode !== 'reset' && (
                  <div>
                    <label
                      htmlFor="auth-email"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-sm text-white focus:border-[#00D2FF] focus:outline-none"
                    />
                  </div>
                )}

                {authMode === 'verify' && (
                  <div className="space-y-2">
                    <label
                      htmlFor="auth-otp-code"
                      className="block text-xs font-semibold text-[#00D2FF]"
                    >
                      Verification Code (OTP)
                    </label>
                    <input
                      id="auth-otp-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={8}
                      required
                      value={otpCodeInput}
                      onChange={(e) => setOtpCodeInput(e.target.value.replace(/\s+/g, ''))}
                      placeholder="Enter 6–8 digit code"
                      className="w-full rounded-xl border-2 border-[#00D2FF]/60 bg-[#081024] px-4 py-3 text-center font-mono text-lg font-extrabold tracking-[0.35em] text-white placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:text-slate-500 focus:border-[#00D2FF] focus:outline-none"
                    />
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>Didn&apos;t receive the code?</span>
                      <button
                        type="button"
                        disabled={resendingCode}
                        onClick={handleResendVerificationCode}
                        className="font-bold text-[#00D2FF] hover:underline disabled:opacity-50"
                      >
                        {resendingCode ? 'Sending...' : 'Resend Verification Code'}
                      </button>
                    </div>
                  </div>
                )}

                {authMode !== 'forgot' && authMode !== 'verify' && (
                  <div>
                    <label
                      htmlFor="auth-pass"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      {authMode === 'reset' ? 'New Password' : 'Password'}
                    </label>
                    <input
                      id="auth-pass"
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-sm text-white focus:border-[#00D2FF] focus:outline-none"
                    />
                  </div>
                )}

                {authMode === 'reset' && (
                  <div>
                    <label
                      htmlFor="auth-confirm-pass"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="auth-confirm-pass"
                      type="password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-sm text-white focus:border-[#00D2FF] focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#00A8FF] via-[#0072FF] to-[#7C3AED] py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,168,255,0.4)] hover:opacity-95 disabled:opacity-50"
                >
                  {authLoading
                    ? 'Processing with Supabase...'
                    : authMode === 'login'
                    ? 'Sign In & Sync Workspace'
                    : authMode === 'signup'
                    ? 'Register & Send Verification Code'
                    : authMode === 'verify'
                    ? 'Verify Code & Activate Account'
                    : authMode === 'forgot'
                    ? 'Send Password Reset Link'
                    : 'Save New Password'}
                </button>

                {authError && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-xs text-rose-200 leading-relaxed">
                    {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-3 text-xs text-emerald-200 leading-relaxed">
                    {authSuccess}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 3: USER PROFILE SYSTEM */}
          {activeTab === 'profile' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="rounded-2xl border border-[#1E3468] bg-[#0D1834] p-5 space-y-4">
                <div className="flex items-center gap-4 border-b border-[#162852] pb-4">
                  <img
                    src={profileAvatarUrl || '/assets/fy/user-avatar.png'}
                    alt="Profile Avatar"
                    className="h-16 w-16 rounded-full object-cover border-2 border-[#00D2FF]"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {profileFullName || currentUser?.email || 'Falylio Yara Member'}
                    </h3>
                    <p className="text-xs text-[#00D2FF]">
                      @{profileUsername || 'username_not_set'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Email: {currentUser?.email || 'Not signed in'} • Created:{' '}
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : currentUser?.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString()
                        : 'Local Session'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-3.5">
                  <div>
                    <label
                      htmlFor="prof-fullname"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="prof-fullname"
                      type="text"
                      required
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white focus:border-[#00D2FF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prof-username"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      Username (3–32 lowercase letters, numbers, underscores)
                    </label>
                    <input
                      id="prof-username"
                      type="text"
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      placeholder="falylio_creator"
                      className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white focus:border-[#00D2FF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prof-avatar"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      Profile Avatar URL
                    </label>
                    <input
                      id="prof-avatar"
                      type="text"
                      value={profileAvatarUrl}
                      onChange={(e) => setProfileAvatarUrl(e.target.value)}
                      placeholder="/assets/fy/user-avatar.png"
                      className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white focus:border-[#00D2FF] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving || !currentUser}
                    className="w-full rounded-xl bg-gradient-to-r from-[#0072FF] to-[#00D2FF] py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {profileSaving
                      ? 'Saving to Supabase...'
                      : currentUser
                      ? 'Update Profile in Supabase'
                      : 'Sign In Required to Save Profile to Cloud'}
                  </button>

                  {profileMessage && (
                    <div
                      className={`rounded-xl border p-3 text-xs ${
                        profileMessage.type === 'ok'
                          ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
                          : 'border-rose-500/40 bg-rose-950/50 text-rose-200'
                      }`}
                    >
                      {profileMessage.text}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: SAVED ITEMS (public.saved_items) */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <form
                onSubmit={handleAddSavedItem}
                className="flex flex-col sm:flex-row gap-2.5 rounded-xl border border-[#1E3468] bg-[#0D1834] p-4"
              >
                <input
                  type="text"
                  value={newSavedTitle}
                  onChange={(e) => setNewSavedTitle(e.target.value)}
                  placeholder="Save a tool, course, AI prompt, or resource title..."
                  aria-label="Saved item title"
                  className="flex-1 rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                />
                <select
                  aria-label="Saved item category"
                  value={newSavedType}
                  onChange={(e) => setNewSavedType(e.target.value)}
                  className="rounded-xl border border-[#243E7A] bg-[#081024] px-3 py-2 text-xs text-white"
                >
                  <option value="tool">Tool</option>
                  <option value="ai_prompt">AI Prompt</option>
                  <option value="course">Course</option>
                  <option value="marketplace">Marketplace Asset</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0072FF] px-4 py-2 text-xs font-bold text-white"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>Save Item</span>
                </button>
              </form>

              {savedItems.length === 0 ? (
                <div className="rounded-xl border border-[#1B3164] bg-[#0D1834] p-6 text-center text-xs text-slate-400">
                  No saved items yet. Add any tool, course, or workflow reference above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedItems.map((item) => (
                    <div
                      key={item.item_id}
                      className="rounded-xl border border-[#1E3468] bg-[#0E1936] p-3.5 flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="rounded-full bg-[#162954] px-2 py-0.5 text-[10px] font-bold text-[#00D2FF] uppercase">
                          {item.item_type}
                        </span>
                        <div className="text-xs sm:text-sm font-bold text-white mt-1">
                          {item.title}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSavedItem(item.item_id)}
                        aria-label={`Remove ${item.title}`}
                        className="p-2 rounded-lg border border-[#243E7A] text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY & ROW LEVEL SECURITY SQL */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[#1E3468] bg-[#0D1834] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span>Row Level Security (RLS) &amp; Database Schema</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        'See /supabase/migrations/20261103000000_falylio_yara_account_system.sql'
                      );
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#162954] px-2.5 py-1 text-[11px] font-semibold text-[#00D2FF]"
                  >
                    {copiedSql ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSql ? 'Copied Path' : 'Migration Path'}</span>
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  All four user tables (<code className="text-[#00D2FF]">public.profiles</code>,{' '}
                  <code className="text-[#00D2FF]">public.user_favorites</code>,{' '}
                  <code className="text-[#00D2FF]">public.recently_viewed</code>, and{' '}
                  <code className="text-[#00D2FF]">public.saved_items</code>) enforce strict{' '}
                  <code className="text-emerald-300">auth.uid()</code> ownership policies for{' '}
                  <code>SELECT</code>, <code>INSERT</code>, <code>UPDATE</code>, and{' '}
                  <code>DELETE</code>.
                </p>
                {dbWarnings.length > 0 && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-amber-200 space-y-1">
                    <div className="font-bold">Database Table Diagnostics:</div>
                    {dbWarnings.map((w) => (
                      <div key={w}>• {w}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ADMIN CONSOLE */}
          {activeTab === 'admin' && (
            <AdminControlPanelView onContentChanged={onAdminContentChanged} />
          )}
        </div>
      </div>
    </div>
  );
}

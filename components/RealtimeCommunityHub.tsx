'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Sparkles,
  Users,
  Crown,
  Plus,
  CheckCircle2,
  Copy,
  Database,
  Hash,
  Flame,
  Newspaper,
  X,
} from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createSafeBrowserClient } from '@/utils/supabase/client';
import {
  isAdminEmail,
  fetchCommunityInitialData,
  sendCommunityChatMessage,
  createCommunityFeedbackItem,
  upvoteCommunityFeedbackItem,
  readUpvotedFeedbackIds,
  writeLocalChatMessages,
  writeLocalFeedbackItems,
  COMMUNITY_REALTIME_SQL_SCHEMA,
  type ChatChannelId,
  type CommunityChatMessage,
  type CommunityFeedbackItem,
  type FeedbackCategory,
  type OnlinePresenceUser,
} from '@/utils/supabase/community-client';
import { COMMUNITY_POSTS } from '@/lib/platform-data';

interface RealtimeCommunityHubProps {
  authUser: {
    id: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
  onRequestLogin?: () => void;
}

const CHAT_CHANNELS: { id: ChatChannelId; label: string; desc: string }[] = [
  { id: 'general', label: 'general', desc: 'Platform Lounge & Updates' },
  { id: 'ai-prompts', label: 'ai-prompts', desc: 'Yara AI Prompts & Workflows' },
  { id: 'gaming', label: 'gaming', desc: 'Esports & Browser Games Squad' },
  { id: 'help', label: 'help', desc: 'Support & Tool Questions' },
];

const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  'New Tool Request',
  'AI Feature',
  'Gaming & Esports',
  'UI/UX Feedback',
];

export function RealtimeCommunityHub({ authUser, onRequestLogin }: RealtimeCommunityHubProps) {
  const [activeChannel, setActiveChannel] = useState<ChatChannelId>('general');
  const [messages, setMessages] = useState<CommunityChatMessage[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<CommunityFeedbackItem[]>([]);
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlinePresenceUser[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'local'>(
    'connecting'
  );
  const [tablesReady, setTablesReady] = useState<boolean>(true);

  // Chat Input State
  const [guestNickname, setGuestNickname] = useState<string>('Creator');
  const [chatInput, setChatInput] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  // Feedback Form State
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [fbCategory, setFbCategory] = useState<FeedbackCategory>('New Tool Request');
  const [fbTitle, setFbTitle] = useState<string>('');
  const [fbDesc, setFbDesc] = useState<string>('');
  const [submittingFb, setSubmittingFb] = useState<boolean>(false);
  const [feedbackFilter, setFeedbackFilter] = useState<string>('All');

  // News Filter State
  const [newsFilter, setNewsFilter] = useState<string>('All');

  // SQL Helper Modal
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const effectiveDisplayName =
    authUser?.fullName ||
    authUser?.email?.split('@')[0] ||
    guestNickname.trim() ||
    'Creator';

  const effectiveRole: 'admin' | 'member' | 'guest' = isAdminEmail(authUser?.email)
    ? 'admin'
    : authUser?.id
    ? 'member'
    : 'guest';

  // Idempotent message append helper
  const appendMessageIdempotent = useCallback((incoming: CommunityChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === incoming.id)) {
        return prev;
      }
      const next = [...prev, incoming].slice(-100);
      writeLocalChatMessages(next);
      return next;
    });
  }, []);

  // Idempotent feedback upsert helper
  const upsertFeedbackIdempotent = useCallback((incoming: CommunityFeedbackItem) => {
    setFeedbackItems((prev) => {
      const exists = prev.some((f) => f.id === incoming.id);
      const next = exists
        ? prev.map((f) => (f.id === incoming.id ? incoming : f))
        : [incoming, ...prev];
      const sorted = [...next].sort((a, b) => b.upvotes - a.upvotes);
      writeLocalFeedbackItems(sorted);
      return sorted;
    });
  }, []);

  // Initial Data Load & Supabase Realtime WebSocket Subscription
  useEffect(() => {
    let active = true;

    async function initHub() {
      const initial = await fetchCommunityInitialData();
      if (!active) return;
      setMessages(initial.messages);
      setFeedbackItems(initial.feedback);
      setTablesReady(initial.tablesReady);
      setUpvotedIds(readUpvotedFeedbackIds());
    }

    void initHub();

    const supabase = createSafeBrowserClient();
    if (!supabase) {
      return;
    }

    const presenceKey =
      authUser?.id || `guest-${Math.random().toString(36).slice(2, 8)}`;

    const room = supabase.channel('falylio-yara-community-live', {
      config: {
        broadcast: { self: false },
        presence: { key: presenceKey },
      },
    });

    room
      .on('presence', { event: 'sync' }, () => {
        if (!active) return;
        const state = room.presenceState<OnlinePresenceUser>();
        const users: OnlinePresenceUser[] = [];
        for (const key of Object.keys(state)) {
          const entries = state[key];
          if (Array.isArray(entries) && entries.length > 0) {
            users.push(entries[0]);
          }
        }
        setOnlineUsers(users);
      })
      .on('broadcast', { event: 'chat:message' }, ({ payload }) => {
        if (!active || !payload) return;
        appendMessageIdempotent(payload as CommunityChatMessage);
      })
      .on('broadcast', { event: 'feedback:created' }, ({ payload }) => {
        if (!active || !payload) return;
        upsertFeedbackIdempotent(payload as CommunityFeedbackItem);
      })
      .on('broadcast', { event: 'feedback:upvoted' }, ({ payload }) => {
        if (!active || !payload) return;
        upsertFeedbackIdempotent(payload as CommunityFeedbackItem);
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload) => {
          if (!active || !payload.new) return;
          appendMessageIdempotent(payload.new as CommunityChatMessage);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_feedback' },
        (payload) => {
          if (!active || !payload.new) return;
          upsertFeedbackIdempotent(payload.new as CommunityFeedbackItem);
        }
      )
      .subscribe(async (status) => {
        if (!active) return;
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
          await room.track({
            presenceKey,
            name: effectiveDisplayName,
            role: effectiveRole,
            activeChannel: 'general',
            onlineAt: new Date().toISOString(),
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeStatus('local');
        }
      });

    channelRef.current = room;

    return () => {
      active = false;
      void supabase.removeChannel(room);
      channelRef.current = null;
    };
  }, [authUser?.id, effectiveDisplayName, effectiveRole, appendMessageIdempotent, upsertFeedbackIdempotent]);

  // Auto-scroll chat container when new messages arrive in active channel
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages.length, activeChannel]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const textToSend = chatInput.trim();
    setChatInput('');
    setSendingChat(true);

    try {
      const result = await sendCommunityChatMessage({
        channel: activeChannel,
        authorName: effectiveDisplayName,
        authorEmail: authUser?.email || null,
        userId: authUser?.id || null,
        message: textToSend,
      });

      appendMessageIdempotent(result.record);

      // Broadcast over Supabase Realtime WebSocket to all connected clients immediately
      if (channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'chat:message',
          payload: result.record,
        });
      }
    } finally {
      setSendingChat(false);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbTitle.trim() || submittingFb) return;

    setSubmittingFb(true);
    try {
      const result = await createCommunityFeedbackItem({
        authorName: effectiveDisplayName,
        authorEmail: authUser?.email || null,
        userId: authUser?.id || null,
        category: fbCategory,
        title: fbTitle,
        description: fbDesc,
      });

      upsertFeedbackIdempotent(result.record);

      if (channelRef.current) {
        await channelRef.current.send({
          type: 'broadcast',
          event: 'feedback:created',
          payload: result.record,
        });
      }

      setFbTitle('');
      setFbDesc('');
      setShowFeedbackForm(false);
    } finally {
      setSubmittingFb(false);
    }
  };

  const handleUpvote = async (item: CommunityFeedbackItem) => {
    if (upvotedIds.includes(item.id)) return;
    setUpvotedIds((prev) => [...prev, item.id]);

    const { updated } = await upvoteCommunityFeedbackItem(item);
    upsertFeedbackIdempotent(updated);

    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'feedback:upvoted',
        payload: updated,
      });
    }
  };

  const channelMessages = messages.filter((m) => m.channel === activeChannel);
  const filteredFeedback = feedbackItems.filter(
    (item) => feedbackFilter === 'All' || item.category === feedbackFilter
  );

  return (
    <section
      id="entertainment"
      className="rounded-2xl border border-[#1E3874] bg-gradient-to-b from-[#0A1329] to-[#070E20] p-5 space-y-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
    >
      {/* Top Header & Live Presence Bar */}
      <div
        id="news-community"
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#172B5A] pb-4"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#00D2FF]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span>Supabase Realtime Multi-User Hub</span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            <MessageSquare className="h-5 w-5 text-[#00D2FF]" />
            <span>Live Community Chat &amp; Feedback Wall</span>
          </h2>
          <p className="text-xs text-slate-300">
            Chat live with creators across channels, request new AI/utility tools, and upvote community ideas in real time.
          </p>
        </div>

        {/* Right: Live Presence Pill + SQL Schema Helper */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {Math.max(1, onlineUsers.length)} Online Now
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 uppercase">
              {realtimeStatus === 'connected' ? 'WebSocket Live' : 'Active'}
            </span>
          </div>

          {!tablesReady && (
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25 transition-colors"
            >
              <Database className="h-3.5 w-3.5 text-amber-300" />
              <span>Enable Cloud DB Table (SQL)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Realtime Grid: Left = Live Chatroom | Right = Feedback & Upvote Wall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* =================================================================
            LEFT COLUMN (7 Cols): REAL-TIME MULTI-CHANNEL CHATROOM
           ================================================================= */}
        <div className="lg:col-span-7 rounded-2xl border border-[#213B75] bg-[#0B1530] flex flex-col overflow-hidden shadow-lg">
          {/* Channel Switcher Tabs */}
          <div className="bg-[#081026] border-b border-[#192E60] p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {CHAT_CHANNELS.map((ch) => {
                const active = activeChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActiveChannel(ch.id)}
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-[#00A8FF] to-[#0055FF] text-white shadow-[0_0_14px_rgba(0,168,255,0.4)]'
                        : 'bg-[#101F42] text-slate-300 hover:text-white border border-[#1E366D]'
                    }`}
                  >
                    <Hash className="h-3.5 w-3.5 opacity-80" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {CHAT_CHANNELS.find((c) => c.id === activeChannel)?.desc}
            </span>
          </div>

          {/* Live Chat Messages Stream */}
          <div
            ref={chatScrollRef}
            className="h-[340px] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#0B1530] to-[#091229]"
          >
            {channelMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <MessageSquare className="h-8 w-8 text-[#00D2FF]/50" />
                <div className="text-xs font-bold text-slate-300">
                  No messages in #{activeChannel} yet
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Be the first to start the conversation in this channel!
                </p>
              </div>
            ) : (
              channelMessages.map((msg) => {
                const isAdmin = msg.author_role === 'admin' || isAdminEmail(msg.author_email);
                const isSelf =
                  (authUser?.id && msg.user_id === authUser.id) ||
                  msg.author_name === effectiveDisplayName;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border p-3 space-y-1 ${
                      isAdmin
                        ? 'border-amber-400/45 bg-gradient-to-r from-amber-500/10 via-[#12224A] to-[#0F1C3D]'
                        : isSelf
                        ? 'border-[#00D2FF]/45 bg-[#10234E]/90'
                        : 'border-[#1C3366] bg-[#0E1A38]/90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">
                          {msg.author_name}
                        </span>
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/25 border border-amber-400/50 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300">
                            <Crown className="h-2.5 w-2.5" />
                            <span>OWNER ADMIN</span>
                          </span>
                        ) : msg.author_role === 'member' ? (
                          <span className="rounded-full bg-[#00D2FF]/20 border border-[#00D2FF]/40 px-2 py-0.5 text-[9px] font-bold uppercase text-[#00D2FF]">
                            Verified Member
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[9px] font-semibold uppercase text-slate-300">
                            Guest
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed break-words">
                      {msg.message}
                    </p>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Chat Composer Bar */}
          <form
            onSubmit={handleSendChat}
            className="border-t border-[#192E60] bg-[#081026] p-3 space-y-2"
          >
            {!authUser && (
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Chatting as:</span>
                  <input
                    type="text"
                    value={guestNickname}
                    onChange={(e) => setGuestNickname(e.target.value)}
                    maxLength={24}
                    aria-label="Your display name"
                    className="rounded-lg bg-[#0F1D3E] border border-[#244282] px-2.5 py-1 text-xs font-bold text-[#00D2FF] w-36 focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>
                {onRequestLogin && (
                  <button
                    type="button"
                    onClick={onRequestLogin}
                    className="text-[#00D2FF] hover:underline font-semibold"
                  >
                    Sign in for Verified Badge →
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                maxLength={500}
                placeholder={`Message #${activeChannel} live...`}
                aria-label={`Message #${activeChannel}`}
                className="flex-1 h-10 rounded-xl bg-[#0F1B38] border border-[#233F7D] px-3.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00D2FF]"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                disabled={sendingChat || !chatInput.trim()}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#00A8FF] to-[#0055FF] text-xs font-extrabold text-white shadow-[0_0_16px_rgba(0,168,255,0.4)] disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </motion.button>
            </div>
          </form>
        </div>

        {/* =================================================================
            RIGHT COLUMN (5 Cols): LIVE FEEDBACK & FEATURE UPVOTE WALL
           ================================================================= */}
        <div className="lg:col-span-5 rounded-2xl border border-[#213B75] bg-[#0B1530] p-4 flex flex-col justify-between gap-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span>Tool Requests &amp; Feedback Wall</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Upvote features you want built next on Falylio Yara
                </p>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowFeedbackForm((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-600 to-[#0072FF] px-3 py-1.5 text-xs font-extrabold text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Post Idea</span>
              </motion.button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', ...FEEDBACK_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFeedbackFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                    feedbackFilter === cat
                      ? 'bg-[#00D2FF] text-[#050C1D]'
                      : 'bg-[#101F42] text-slate-300 hover:text-white border border-[#1E366D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Collapsible New Feedback Form */}
            <AnimatePresence>
              {showFeedbackForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateFeedback}
                  className="rounded-xl border border-[#00D2FF]/50 bg-[#081026] p-3.5 space-y-2.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00D2FF]">
                      Submit Feature Request / Feedback
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <select
                    value={fbCategory}
                    onChange={(e) => setFbCategory(e.target.value as FeedbackCategory)}
                    aria-label="Feedback category"
                    className="w-full rounded-lg bg-[#0F1B38] border border-[#233F7D] px-2.5 py-1.5 text-xs text-white"
                  >
                    {FEEDBACK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={fbTitle}
                    onChange={(e) => setFbTitle(e.target.value)}
                    placeholder="Short title (e.g. AI Logo Maker Studio)"
                    aria-label="Feedback title"
                    className="w-full rounded-lg bg-[#0F1B38] border border-[#233F7D] px-2.5 py-1.5 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    value={fbDesc}
                    onChange={(e) => setFbDesc(e.target.value)}
                    placeholder="Describe how this tool or feature helps you..."
                    aria-label="Feedback description"
                    className="w-full rounded-lg bg-[#0F1B38] border border-[#233F7D] px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={submittingFb}
                    className="w-full rounded-lg bg-gradient-to-r from-[#00A8FF] to-[#0055FF] py-1.5 text-xs font-extrabold text-white"
                  >
                    {submittingFb ? 'Publishing Live...' : 'Publish to Feedback Wall'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Feedback Cards List */}
            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
              {filteredFeedback.map((item) => {
                const hasUpvoted = upvotedIds.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    className="rounded-xl border border-[#1E366D] bg-[#0E1A38]/90 hover:border-[#00D2FF]/60 p-3 flex items-start justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-[#162954] px-2 py-0.5 text-[10px] font-bold text-[#00D2FF]">
                          {item.category}
                        </span>
                        {item.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-300">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span>Live</span>
                          </span>
                        )}
                        {item.status === 'planned' && (
                          <span className="rounded-md bg-purple-500/25 border border-purple-400/40 px-2 py-0.5 text-[9px] font-extrabold uppercase text-purple-200">
                            Planned
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-slate-300 line-clamp-2">{item.description}</p>
                      )}
                      <div className="text-[10px] text-slate-400">
                        By <span className="text-slate-300 font-semibold">{item.author_name}</span>
                      </div>
                    </div>

                    {/* Upvote Button */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleUpvote(item)}
                      className={`shrink-0 h-14 w-12 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all ${
                        hasUpvoted
                          ? 'border-[#00D2FF] bg-[#00D2FF]/20 text-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.35)]'
                          : 'border-[#25448A] bg-[#12224A] text-slate-200 hover:border-[#00D2FF]'
                      }`}
                      aria-label={`Upvote ${item.title}`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span className="text-xs font-extrabold">{item.upvotes}</span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#182C5A] flex items-center justify-between text-[11px] text-slate-400">
            <span>Synced via Supabase Realtime</span>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="text-[#00D2FF] hover:underline font-semibold"
            >
              View SQL Schema
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Curated Tech News & Tutorials Strip */}
      <div className="pt-3 border-t border-[#172B5A] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-[#00D2FF]" />
            <span>Featured Tech News &amp; Creator Guides</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'AI News', 'Technology News', 'Tutorials', 'Discussion Forum'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setNewsFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                  newsFilter === cat
                    ? 'bg-[#0072FF] text-white'
                    : 'bg-[#101E3E] text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {COMMUNITY_POSTS.filter(
            (post) => newsFilter === 'All' || post.category === newsFilter
          ).map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-[#1E3468] bg-[#0E1936] p-3.5 flex flex-col justify-between gap-2 hover:border-[#00D2FF]/50 transition-colors"
            >
              <div className="space-y-1.5">
                <span className="rounded-full bg-[#162954] px-2.5 py-0.5 text-[10px] font-bold text-[#00D2FF]">
                  {post.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white">{post.title}</h4>
                <p className="text-[11px] text-slate-300 line-clamp-2">{post.summary}</p>
              </div>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-white/10 flex items-center justify-between">
                <span>{post.author}</span>
                <span>{post.repliesCount} replies</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SQL Schema Helper Modal */}
      <AnimatePresence>
        {showSqlModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
            onClick={() => setShowSqlModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-[#244285] bg-[#0A1329] p-5 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-5 w-5 text-[#00D2FF]" />
                  <h3 className="text-base font-extrabold">
                    Supabase Realtime Chat &amp; Feedback SQL Schema
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Real-time WebSocket Broadcast works immediately! To also persist chat messages and
                feedback votes permanently in your Supabase Postgres database, copy and run this SQL
                in your <strong>Supabase SQL Editor</strong>:
              </p>

              <pre className="max-h-72 overflow-y-auto rounded-xl border border-[#1D356B] bg-[#060B19] p-3 text-[11px] text-sky-200 font-mono">
                {COMMUNITY_REALTIME_SQL_SCHEMA}
              </pre>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(COMMUNITY_REALTIME_SQL_SCHEMA);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00A8FF] to-[#0055FF] px-4 py-2 text-xs font-extrabold text-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="rounded-xl bg-[#162852] px-4 py-2 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

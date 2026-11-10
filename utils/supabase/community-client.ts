'use client';

import { createSafeBrowserClient } from './client';
import { OWNER_ADMIN_EMAIL } from './admin-client';

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();
}

export type ChatChannelId = 'general' | 'ai-prompts' | 'gaming' | 'help';

export interface CommunityChatMessage {
  id: string;
  channel: ChatChannelId;
  user_id: string | null;
  author_name: string;
  author_email?: string | null;
  author_role: 'admin' | 'member' | 'guest';
  message: string;
  created_at: string;
}

export type FeedbackCategory =
  | 'New Tool Request'
  | 'AI Feature'
  | 'Gaming & Esports'
  | 'UI/UX Feedback';

export interface CommunityFeedbackItem {
  id: string;
  user_id: string | null;
  author_name: string;
  author_role: 'admin' | 'member' | 'guest';
  category: FeedbackCategory;
  title: string;
  description: string;
  upvotes: number;
  status: 'open' | 'planned' | 'completed';
  created_at: string;
}

export interface OnlinePresenceUser {
  presenceKey: string;
  name: string;
  role: 'admin' | 'member' | 'guest';
  activeChannel: ChatChannelId;
  onlineAt: string;
}

const LOCAL_CHAT_STORAGE_KEY = 'fy_community_chat_v1';
const LOCAL_FEEDBACK_STORAGE_KEY = 'fy_community_feedback_v1';
const LOCAL_UPVOTED_IDS_KEY = 'fy_community_upvoted_ids_v1';

export const COMMUNITY_REALTIME_SQL_SCHEMA = `-- ============================================================================
-- FALYLIO YARA — REAL-TIME COMMUNITY CHAT & FEEDBACK WALL SCHEMA
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'general' check (channel in ('general', 'ai-prompts', 'gaming', 'help')),
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'Member',
  author_email text,
  author_role text not null default 'member' check (author_role in ('admin', 'member', 'guest')),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.community_messages enable row level security;

drop policy if exists "community_messages_select_all" on public.community_messages;
create policy "community_messages_select_all"
  on public.community_messages for select
  using (true);

drop policy if exists "community_messages_insert_any" on public.community_messages;
create policy "community_messages_insert_any"
  on public.community_messages for insert
  with check (char_length(trim(message)) > 0 and char_length(message) <= 1000);

drop policy if exists "community_messages_delete_owner_or_admin" on public.community_messages;
create policy "community_messages_delete_owner_or_admin"
  on public.community_messages for delete
  using (
    auth.uid() = user_id
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'kishaloyoffice@gmail.com'
  );

create table if not exists public.community_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'Creator',
  author_role text not null default 'member' check (author_role in ('admin', 'member', 'guest')),
  category text not null default 'New Tool Request',
  title text not null,
  description text not null default '',
  upvotes integer not null default 1,
  status text not null default 'open' check (status in ('open', 'planned', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.community_feedback enable row level security;

drop policy if exists "community_feedback_select_all" on public.community_feedback;
create policy "community_feedback_select_all"
  on public.community_feedback for select
  using (true);

drop policy if exists "community_feedback_insert_any" on public.community_feedback;
create policy "community_feedback_insert_any"
  on public.community_feedback for insert
  with check (char_length(trim(title)) > 0);

drop policy if exists "community_feedback_update_upvotes" on public.community_feedback;
create policy "community_feedback_update_upvotes"
  on public.community_feedback for update
  using (true)
  with check (true);

drop policy if exists "community_feedback_delete_admin" on public.community_feedback;
create policy "community_feedback_delete_admin"
  on public.community_feedback for delete
  using (
    auth.uid() = user_id
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'kishaloyoffice@gmail.com'
  );

-- Enable Supabase Realtime replication for both tables
do $$
begin
  alter publication supabase_realtime add table public.community_messages;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.community_feedback;
exception when others then null;
end $$;
`;

const INITIAL_SEED_MESSAGES: CommunityChatMessage[] = [
  {
    id: 'seed-msg-1',
    channel: 'general',
    user_id: null,
    author_name: 'Falylio Yara Official',
    author_email: 'kishaloyoffice@gmail.com',
    author_role: 'admin',
    message:
      'Welcome to the Falylio Yara Real-Time Community Hub! Share tool ideas, AI prompts, or chat live with other creators.',
    created_at: '2026-11-10T04:00:00.000Z',
  },
  {
    id: 'seed-msg-2',
    channel: 'ai-prompts',
    user_id: null,
    author_name: 'Aarav Tech',
    author_email: null,
    author_role: 'member',
    message:
      'Tip: Combining the Yara Code Assistant with the JSON Formatter Workbench makes debugging API payloads 10x faster!',
    created_at: '2026-11-10T04:15:00.000Z',
  },
  {
    id: 'seed-msg-3',
    channel: 'gaming',
    user_id: null,
    author_name: 'NadiaPlays',
    author_email: null,
    author_role: 'member',
    message: 'Just scored 100% on the Cyber Memory Matrix in Gaming Zone! Who can beat 14 moves?',
    created_at: '2026-11-10T04:30:00.000Z',
  },
];

const INITIAL_SEED_FEEDBACK: CommunityFeedbackItem[] = [
  {
    id: 'seed-fb-1',
    user_id: null,
    author_name: 'Rohan Dev',
    author_role: 'member',
    category: 'New Tool Request',
    title: 'PDF to Markdown & AI Summary Converter',
    description:
      'Would love a 1-click utility to extract clean Markdown and key bullet points from technical PDFs.',
    upvotes: 28,
    status: 'planned',
    created_at: '2026-11-10T03:00:00.000Z',
  },
  {
    id: 'seed-fb-2',
    user_id: null,
    author_name: 'Tania Creative',
    author_role: 'member',
    category: 'AI Feature',
    title: 'Bangla & English Voice-to-Text Prompt Input in Yara AI',
    description:
      'Allow speaking directly in Bangla or English inside Yara AI Studio for hands-free content creation.',
    upvotes: 19,
    status: 'open',
    created_at: '2026-11-10T03:30:00.000Z',
  },
  {
    id: 'seed-fb-3',
    user_id: null,
    author_name: 'Falylio Yara Official',
    author_role: 'admin',
    category: 'UI/UX Feedback',
    title: 'Installable Mobile & Desktop PWA + Offline Support',
    description:
      'Direct 1-click app install for Android, iOS Safari, and Desktop Chrome with offline caching.',
    upvotes: 42,
    status: 'completed',
    created_at: '2026-11-10T04:50:00.000Z',
  },
];

export function readLocalChatMessages(): CommunityChatMessage[] {
  if (typeof window === 'undefined') return INITIAL_SEED_MESSAGES;
  try {
    const raw = localStorage.getItem(LOCAL_CHAT_STORAGE_KEY);
    if (!raw) return INITIAL_SEED_MESSAGES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_MESSAGES;
  } catch {
    return INITIAL_SEED_MESSAGES;
  }
}

export function writeLocalChatMessages(items: CommunityChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CHAT_STORAGE_KEY, JSON.stringify(items.slice(-100)));
  } catch {
    // Ignore storage quota errors
  }
}

export function readLocalFeedbackItems(): CommunityFeedbackItem[] {
  if (typeof window === 'undefined') return INITIAL_SEED_FEEDBACK;
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_STORAGE_KEY);
    if (!raw) return INITIAL_SEED_FEEDBACK;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_FEEDBACK;
  } catch {
    return INITIAL_SEED_FEEDBACK;
  }
}

export function writeLocalFeedbackItems(items: CommunityFeedbackItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_FEEDBACK_STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {
    // Ignore storage quota errors
  }
}

export function readUpvotedFeedbackIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_UPVOTED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markFeedbackUpvoted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = readUpvotedFeedbackIds();
    if (!current.includes(id)) {
      localStorage.setItem(LOCAL_UPVOTED_IDS_KEY, JSON.stringify([...current, id]));
    }
  } catch {
    // Ignore
  }
}

export async function fetchCommunityInitialData(): Promise<{
  messages: CommunityChatMessage[];
  feedback: CommunityFeedbackItem[];
  tablesReady: boolean;
}> {
  const supabase = createSafeBrowserClient();
  if (!supabase) {
    return {
      messages: readLocalChatMessages(),
      feedback: readLocalFeedbackItems(),
      tablesReady: false,
    };
  }

  let tablesReady = true;
  let messages: CommunityChatMessage[] = [];
  let feedback: CommunityFeedbackItem[] = [];

  try {
    const { data: msgData, error: msgError } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(80);

    if (msgError) {
      tablesReady = false;
      messages = readLocalChatMessages();
    } else if (Array.isArray(msgData) && msgData.length > 0) {
      messages = msgData as CommunityChatMessage[];
      writeLocalChatMessages(messages);
    } else {
      messages = readLocalChatMessages();
    }
  } catch {
    tablesReady = false;
    messages = readLocalChatMessages();
  }

  try {
    const { data: fbData, error: fbError } = await supabase
      .from('community_feedback')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(50);

    if (fbError) {
      tablesReady = false;
      feedback = readLocalFeedbackItems();
    } else if (Array.isArray(fbData) && fbData.length > 0) {
      feedback = fbData as CommunityFeedbackItem[];
      writeLocalFeedbackItems(feedback);
    } else {
      feedback = readLocalFeedbackItems();
    }
  } catch {
    tablesReady = false;
    feedback = readLocalFeedbackItems();
  }

  return { messages, feedback, tablesReady };
}

export async function sendCommunityChatMessage(input: {
  channel: ChatChannelId;
  authorName: string;
  authorEmail?: string | null;
  userId?: string | null;
  message: string;
}): Promise<{
  ok: boolean;
  record: CommunityChatMessage;
  persistedInDb: boolean;
}> {
  const trimmed = input.message.trim();
  const role: 'admin' | 'member' | 'guest' = isAdminEmail(input.authorEmail)
    ? 'admin'
    : input.userId
    ? 'member'
    : 'guest';

  const optimisticRecord: CommunityChatMessage = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `msg-${Date.now()}`,
    channel: input.channel,
    user_id: input.userId || null,
    author_name: input.authorName.trim() || 'Community Member',
    author_email: input.authorEmail || null,
    author_role: role,
    message: trimmed,
    created_at: new Date().toISOString(),
  };

  const supabase = createSafeBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          id: optimisticRecord.id,
          channel: optimisticRecord.channel,
          user_id: optimisticRecord.user_id,
          author_name: optimisticRecord.author_name,
          author_email: optimisticRecord.author_email,
          author_role: optimisticRecord.author_role,
          message: optimisticRecord.message,
        })
        .select('*')
        .single();

      if (!error && data) {
        const saved = data as CommunityChatMessage;
        const nextLocal = [...readLocalChatMessages().filter((m) => m.id !== saved.id), saved];
        writeLocalChatMessages(nextLocal);
        return { ok: true, record: saved, persistedInDb: true };
      }
    } catch {
      // Fallback to realtime broadcast + local storage
    }
  }

  const nextLocal = [
    ...readLocalChatMessages().filter((m) => m.id !== optimisticRecord.id),
    optimisticRecord,
  ];
  writeLocalChatMessages(nextLocal);
  return { ok: true, record: optimisticRecord, persistedInDb: false };
}

export async function createCommunityFeedbackItem(input: {
  authorName: string;
  authorEmail?: string | null;
  userId?: string | null;
  category: FeedbackCategory;
  title: string;
  description: string;
}): Promise<{
  ok: boolean;
  record: CommunityFeedbackItem;
  persistedInDb: boolean;
}> {
  const role: 'admin' | 'member' | 'guest' = isAdminEmail(input.authorEmail)
    ? 'admin'
    : input.userId
    ? 'member'
    : 'guest';

  const optimisticRecord: CommunityFeedbackItem = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `fb-${Date.now()}`,
    user_id: input.userId || null,
    author_name: input.authorName.trim() || 'Creator',
    author_role: role,
    category: input.category,
    title: input.title.trim(),
    description: input.description.trim(),
    upvotes: 1,
    status: 'open',
    created_at: new Date().toISOString(),
  };

  const supabase = createSafeBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('community_feedback')
        .insert({
          id: optimisticRecord.id,
          user_id: optimisticRecord.user_id,
          author_name: optimisticRecord.author_name,
          author_role: optimisticRecord.author_role,
          category: optimisticRecord.category,
          title: optimisticRecord.title,
          description: optimisticRecord.description,
          upvotes: 1,
          status: 'open',
        })
        .select('*')
        .single();

      if (!error && data) {
        const saved = data as CommunityFeedbackItem;
        const nextLocal = [saved, ...readLocalFeedbackItems().filter((f) => f.id !== saved.id)];
        writeLocalFeedbackItems(nextLocal);
        return { ok: true, record: saved, persistedInDb: true };
      }
    } catch {
      // Fallback to realtime broadcast + local storage
    }
  }

  const nextLocal = [
    optimisticRecord,
    ...readLocalFeedbackItems().filter((f) => f.id !== optimisticRecord.id),
  ];
  writeLocalFeedbackItems(nextLocal);
  return { ok: true, record: optimisticRecord, persistedInDb: false };
}

export async function upvoteCommunityFeedbackItem(
  item: CommunityFeedbackItem
): Promise<{ ok: boolean; updated: CommunityFeedbackItem }> {
  const nextVotes = item.upvotes + 1;
  const updated: CommunityFeedbackItem = { ...item, upvotes: nextVotes };

  markFeedbackUpvoted(item.id);
  const localList = readLocalFeedbackItems().map((f) => (f.id === item.id ? updated : f));
  writeLocalFeedbackItems(localList);

  const supabase = createSafeBrowserClient();
  if (supabase) {
    try {
      await supabase
        .from('community_feedback')
        .update({ upvotes: nextVotes })
        .eq('id', item.id);
    } catch {
      // Ignore if table not yet migrated
    }
  }

  return { ok: true, updated };
}

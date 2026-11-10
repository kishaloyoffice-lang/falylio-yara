'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Wrench,
  GraduationCap,
  ShoppingBag,
  AppWindow,
  Briefcase,
  Image as ImageIcon,
  Share2,
  Code2,
  FileText,
  Video,
  Music,
  FileCheck,
  AlignLeft,
  PenTool,
  Globe,
  FolderKanban,
  Calculator,
  FlaskConical,
  Palette,
  LayoutGrid,
  Receipt,
  CalendarClock,
  ShieldCheck,
  MessageSquare,
  Languages,
  BookOpen,
  Mic,
  Bookmark,
  ArrowRight,
  Menu,
  X,
  Compass,
  Home,
  Gamepad2,
  Bot,
  ShoppingCart,
  Megaphone,
  PlaySquare,
  Newspaper,
  Crown,
  Settings,
  Moon,
  Bell,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Zap,
  Shield,
  Star,
  Trophy,
  Play,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  PLATFORM_TOOLS,
  ALL_TOOL_CATEGORIES,
  YARA_AI_MODULES,
  BROWSER_GAMES,
  SOFTWARE_APPS,
  MARKETPLACE_PRODUCTS,
  EDUCATION_COURSES,
  STOCK_MEDIA_ITEMS,
  COMMUNITY_POSTS,
  type PlatformTool,
  type ToolCategory,
  type YaraAiModule,
  type CourseItem,
  type BrowserGameItem,
} from '@/lib/platform-data';
import { filterTools, searchPlatformCatalog } from '@/lib/platform-utils';
import {
  ToolWorkbenchModal,
  YaraAiStudioModal,
  CourseQuizModal,
  BrowserGameModal,
} from './InteractiveWorkbenches';
import {
  AccountAndAdminModal,
  type AuthenticatedUserSummary,
} from './AccountAndAdminModal';
import { createSafeBrowserClient } from '@/utils/supabase/client';
import {
  getAccountState,
  postAccountAction,
} from '@/utils/supabase/account-client';
import {
  fetchPublicAdminContent,
  type PlatformAnnouncementRecord,
  type PlatformCustomItemRecord,
} from '@/utils/supabase/admin-client';

function getIconComponent(iconName: string, className = 'h-5 w-5 text-[#00D2FF]') {
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'AppWindow':
      return <AppWindow className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Image':
      return <ImageIcon className={className} />;
    case 'Share2':
      return <Share2 className={className} />;
    case 'Video':
      return <Video className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'FileCheck':
      return <FileCheck className={className} />;
    case 'AlignLeft':
      return <AlignLeft className={className} />;
    case 'PenTool':
      return <PenTool className={className} />;
    case 'Code2':
      return <Code2 className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'FolderKanban':
      return <FolderKanban className={className} />;
    case 'Calculator':
      return <Calculator className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'LayoutGrid':
      return <LayoutGrid className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'CalendarClock':
      return <CalendarClock className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'MessageSquare':
      return <MessageSquare className={className} />;
    case 'Languages':
      return <Languages className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Mic':
      return <Mic className={className} />;
    default:
      return <Compass className={className} />;
  }
}

interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { id: 'home', label: 'Home', href: '#top', icon: <Home className="h-4 w-4" /> },
  { id: 'gaming', label: 'Gaming Zone', href: '#gaming-zone', icon: <Gamepad2 className="h-4 w-4" /> },
  { id: 'tools', label: 'All Tools', href: '#all-tools', icon: <Wrench className="h-4 w-4" /> },
  { id: 'ai', label: 'AI Center', href: '#ai-center', icon: <Bot className="h-4 w-4" />, badge: 'New' },
  { id: 'apps', label: 'Apps & Software', href: '#apps-software', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'marketplace', label: 'Marketplace', href: '#marketplace', icon: <ShoppingCart className="h-4 w-4" /> },
  { id: 'education', label: 'Education', href: '#education', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'stock', label: 'Stock Media', href: '#stock-media', icon: <ImageIcon className="h-4 w-4" /> },
  { id: 'social', label: 'Social Studio', href: '#social-studio', icon: <Megaphone className="h-4 w-4" /> },
  { id: 'builder', label: 'Website Builder', href: '#website-builder', icon: <Code2 className="h-4 w-4" /> },
  { id: 'business', label: 'Business Tools', href: '#business-tools', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'entertainment', label: 'Entertainment', href: '#entertainment', icon: <PlaySquare className="h-4 w-4" /> },
  { id: 'community', label: 'News & Community', href: '#news-community', icon: <Globe className="h-4 w-4" /> },
];

const HERO_SLIDES = [
  {
    id: 'slide-1',
    welcome: 'Welcome to',
    subtitle: 'All-in-One Digital Platform',
    tagline: 'Explore • Play • Learn • Create • Grow',
  },
  {
    id: 'slide-2',
    welcome: 'Discover Next-Gen',
    subtitle: 'AI Studio, Tools & Gaming Hub',
    tagline: 'Dream • Create • Grow with Falylio Yara',
  },
  {
    id: 'slide-3',
    welcome: 'Empowering Creators',
    subtitle: '17+ Tool Categories & Courses',
    tagline: 'Fast • Free • Worldwide Digital Ecosystem',
  },
];

export default function FalylioYaraPlatform() {
  // Active Sidebar Item
  const [activeNav, setActiveNav] = useState<string>('home');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search States
  const [globalQuery, setGlobalQuery] = useState('');
  const [heroQuery, setHeroQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const topSearchInputRef = useRef<HTMLInputElement>(null);

  // Hero Slide State
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Tools Filtering State
  const [selectedToolTab, setSelectedToolTab] = useState<'all' | 'popular' | 'recent' | 'recommended' | 'free'>('all');
  const [selectedToolCategory, setSelectedToolCategory] = useState<ToolCategory | 'All'>('All');
  const [toolSearchQuery, setToolSearchQuery] = useState('');

  // Marketplace Filter State
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>('All');
  const [selectedProductNotice, setSelectedProductNotice] = useState<string | null>(null);

  // Education Filter State
  const [courseFilter, setCourseFilter] = useState<string>('All');

  // Stock Media Filter State
  const [mediaFilter, setMediaFilter] = useState<string>('All');

  // Community Filter State
  const [communityFilter, setCommunityFilter] = useState<string>('All');

  // Interactive Task Planner State
  const [tasks, setTasks] = useState([
    { id: 't1', text: 'Generate 4K YouTube Gaming & AI Studio thumbnail', done: true },
    { id: 't2', text: 'Export client invoice PDF from Business Tools', done: false },
    { id: 't3', text: 'Complete Applied AI Engineering module quiz', done: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Modals & Active Items
  const [activeTool, setActiveTool] = useState<PlatformTool | null>(null);
  const [activeAiModule, setActiveAiModule] = useState<YaraAiModule | null>(null);
  const [activeCourseQuiz, setActiveCourseQuiz] = useState<CourseItem | null>(null);
  const [activeGame, setActiveGame] = useState<BrowserGameItem | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<
    'dashboard' | 'auth' | 'profile' | 'saved' | 'security' | 'admin' | 'architecture'
  >('dashboard');
  const [authUser, setAuthUser] = useState<AuthenticatedUserSummary | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Favorites & Recently Viewed
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['tool-text-counter', 'tool-dev-json']);
  const [recentToolIds, setRecentToolIds] = useState<string[]>(['tool-office-invoice']);

  // Live Admin Announcements & Custom Catalog Items (from Supabase)
  const [adminAnnouncements, setAdminAnnouncements] = useState<PlatformAnnouncementRecord[]>([]);
  const [adminCustomItems, setAdminCustomItems] = useState<PlatformCustomItemRecord[]>([]);

  const refreshPublicAdminContent = () => {
    fetchPublicAdminContent()
      .then((res) => {
        setAdminAnnouncements(res.announcements);
        setAdminCustomItems(res.customItems);
      })
      .catch(() => {
        // Ignore offline error
      });
  };

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('fy_favorites');
      const savedRecents = localStorage.getItem('fy_recents');
      if (savedFavs) setFavoriteIds(JSON.parse(savedFavs));
      if (savedRecents) setRecentToolIds(JSON.parse(savedRecents));
    } catch {
      // Ignore storage errors
    }

    refreshPublicAdminContent();

    // Check Supabase session (via /api/account or direct browser client on static hosts)
    getAccountState()
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setAuthUser({
            id: data.user.id,
            email: data.user.email,
            emailConfirmedAt: data.user.emailConfirmedAt,
            createdAt: data.user.createdAt,
            fullName: data.profile?.full_name || data.user.email?.split('@')[0],
            username: data.profile?.username || '',
            avatarUrl: data.profile?.avatar_url || '/assets/fy/user-avatar.png',
          });
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
            setRecentToolIds((prev) => Array.from(new Set([...cloudRecs, ...prev])).slice(0, 12));
          }
        }
      })
      .catch(() => {
        // Ignore offline/unconfigured error
      });

    // Subscribe to Supabase Auth state changes
    const supabase = createSafeBrowserClient();
    const sub = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setAuthUser(null);
      } else if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email,
          emailConfirmedAt: session.user.email_confirmed_at,
          createdAt: session.user.created_at,
          fullName:
            session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          username: session.user.user_metadata?.username || '',
          avatarUrl:
            session.user.user_metadata?.avatar_url || '/assets/fy/user-avatar.png',
        });
      }
    });

    return () => {
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  // Ctrl + K keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        topSearchInputRef.current?.focus();
        setSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('fy_favorites', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    if (authUser) {
      postAccountAction({
        action: 'toggle_favorite',
        itemId: id,
        itemType: 'tool',
      }).catch(() => {
        // Preserve localStorage if cloud mutation fails
      });
    }
  };

  const handleOpenTool = (tool: PlatformTool) => {
    setActiveTool(tool);
    setRecentToolIds((prev) => {
      const next = [tool.id, ...prev.filter((id) => id !== tool.id)].slice(0, 6);
      try {
        localStorage.setItem('fy_recents', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    if (authUser) {
      postAccountAction({
        action: 'record_recent',
        itemId: tool.id,
        itemType: 'tool',
      }).catch(() => {
        // Preserve localStorage if cloud mutation fails
      });
    }
  };

  const filteredTools = filterTools(PLATFORM_TOOLS, {
    category: selectedToolCategory,
    tag: selectedToolTab,
    query: toolSearchQuery,
  });

  const activeSearchQuery = globalQuery.trim() || heroQuery.trim();
  const unifiedSearchResults = searchPlatformCatalog(activeSearchQuery);

  const handleGlobalSearchAction = (targetId: string, sectionType: string) => {
    setSearchFocused(false);
    if (sectionType === 'Tool') {
      const found = PLATFORM_TOOLS.find((t) => t.id === targetId);
      if (found) handleOpenTool(found);
    } else if (sectionType === 'AI Assistant') {
      const found = YARA_AI_MODULES.find((a) => a.id === targetId);
      if (found) setActiveAiModule(found);
    } else if (sectionType === 'Course') {
      const found = EDUCATION_COURSES.find((c) => c.id === targetId);
      if (found) setActiveCourseQuiz(found);
    } else if (sectionType === 'Browser Game') {
      const found = BROWSER_GAMES.find((g) => g.id === targetId);
      if (found) setActiveGame(found);
    } else {
      const el = document.getElementById('marketplace');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroQuery.trim()) {
      document.getElementById('all-tools')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const results = searchPlatformCatalog(heroQuery.trim());
    if (results.length > 0) {
      handleGlobalSearchAction(results[0].id, results[0].sectionType);
    } else {
      setToolSearchQuery(heroQuery.trim());
      document.getElementById('all-tools')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: `t-${Date.now()}`, text: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.includes('@') || !contactMessage.trim()) return;
    setContactSubmitted(true);
  };

  const scrollToSection = (id: string, navId?: string) => {
    if (navId) setActiveNav(navId);
    setMobileSidebarOpen(false);
    const cleanId = id.replace('#', '');
    if (cleanId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(cleanId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentSlide = HERO_SLIDES[heroSlideIndex];

  return (
    <div id="top" className="min-h-screen bg-[#060B19] text-white flex selection:bg-[#00D2FF]/30 selection:text-white">
      {/* =====================================================================
          MOBILE SIDEBAR BACKDROP
         ===================================================================== */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* =====================================================================
          LEFT FIXED SIDEBAR (Matches Reference Image)
         ===================================================================== */}
      <aside
        aria-label="Sidebar Navigation"
        className={`fixed top-0 left-0 bottom-0 z-50 w-[235px] bg-[#070D1F] border-r border-[#16264C] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Lockup */}
        <div>
          <div className="pt-4 pb-3 px-4 border-b border-[#142242]/80 flex flex-col items-center text-center relative">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden absolute right-3 top-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close Menu"
            >
              <X className="h-4 w-4" />
            </button>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#top', 'home');
              }}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="relative h-14 w-20 flex items-center justify-center">
                <img
                  src="/assets/fy/logo-mark.png"
                  alt="Falylio Yara Crown Emblem"
                  className="h-14 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,210,255,0.45)]"
                />
              </div>
              <div
                className="mt-0.5 text-[19px] font-extrabold tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                <span className="text-white">Falylio </span>
                <span className="text-[#00D2FF]">Yara</span>
              </div>
              <div className="mt-1 text-[10px] font-medium tracking-wider text-slate-400">
                Dream • Create • Grow
              </div>
            </a>
          </div>

          {/* 13 Navigation Links */}
          <nav className="px-3 py-2.5 space-y-0.5 overflow-y-auto max-h-[calc(100vh-290px)]">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href, item.id);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00A8FF] via-[#0072FF] to-[#0051D5] text-white font-semibold shadow-[0_0_16px_rgba(0,140,255,0.45)]'
                      : 'text-slate-300 hover:text-white hover:bg-[#101C38]'
                  }`}
                >
                  <span className="flex items-center gap-3 truncate">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="ml-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(147,51,234,0.5)]">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom Pro Member Card & Utility Icons */}
        <div className="p-3 space-y-2.5 border-t border-[#142242]/80 bg-[#070D1F]">
          <div className="rounded-2xl border border-[#1E3264] bg-gradient-to-b from-[#0E1936] to-[#091126] p-3.5 shadow-[0_0_20px_rgba(0,114,255,0.12)]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <Crown className="h-4 w-4 fill-amber-400" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-white">Upgrade to</div>
                <div className="text-xs font-bold text-white">Pro Member</div>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Unlock more features!
            </p>
            <button
              type="button"
              onClick={() => {
                setAccountModalTab('dashboard');
                setAccountModalOpen(true);
              }}
              className="mt-2.5 w-full rounded-xl bg-gradient-to-r from-[#00D2FF] via-[#3A7BD5] to-[#8B5CF6] py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,210,255,0.35)] hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
            >
              <span>Go Pro</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bottom 3 Circular Utility Buttons */}
          <div className="flex items-center justify-around pt-0.5">
            <button
              type="button"
              onClick={() => {
                setAccountModalTab('admin');
                setAccountModalOpen(true);
              }}
              aria-label="Platform Settings"
              className="h-9 w-9 rounded-full bg-[#101B37] border border-[#1E3264] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#00D2FF]/50 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountModalTab('architecture');
                setAccountModalOpen(true);
              }}
              aria-label="Theme & Architecture"
              className="h-9 w-9 rounded-full bg-[#101B37] border border-[#1E3264] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#00D2FF]/50 transition-colors"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountModalTab('dashboard');
                setAccountModalOpen(true);
              }}
              aria-label="Notifications"
              className="h-9 w-9 rounded-full bg-[#101B37] border border-[#1E3264] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#00D2FF]/50 transition-colors"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MAIN DASHBOARD CONTENT AREA
         ===================================================================== */}
      <div className="flex-1 lg:pl-[235px] flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="sticky top-0 z-30 h-[64px] bg-[#070D1F]/95 backdrop-blur-md border-b border-[#16264C] px-4 lg:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Trigger + Global Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl relative">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Navigation Menu"
              className="lg:hidden h-10 w-10 rounded-xl bg-[#101B37] border border-[#1E3264] flex items-center justify-center text-slate-200 hover:text-white shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={topSearchInputRef}
                type="search"
                aria-label="Search anything"
                value={globalQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setGlobalQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Search anything... (e.g. games, tools, AI)"
                className="w-full h-10 rounded-full bg-[#0E172E] border border-[#1E3264] pl-10 pr-20 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00D2FF] shadow-inner"
              />
              <span className="hidden sm:inline-flex items-center rounded-md bg-[#172546] border border-[#273E73] px-2 py-0.5 text-[11px] font-medium text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                Ctrl + K
              </span>

              {/* Live Global Search Dropdown */}
              {searchFocused && globalQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[#1E3A78] bg-[#0B142B] p-3 shadow-2xl z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#16264C]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Instant Results ({unifiedSearchResults.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchFocused(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  {unifiedSearchResults.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No matching tools, games, AI modules, or courses found for &ldquo;{globalQuery}&rdquo;.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-[#142242]">
                      {unifiedSearchResults.map((item) => (
                        <button
                          key={`${item.sectionType}-${item.id}`}
                          type="button"
                          onClick={() => handleGlobalSearchAction(item.id, item.sectionType)}
                          className="w-full py-2.5 px-3 text-left hover:bg-[#132347] flex items-center justify-between gap-3 rounded-xl transition-colors"
                        >
                          <div>
                            <div className="text-xs font-semibold text-white">{item.title}</div>
                            <div className="text-[11px] text-slate-400">{item.categoryLabel}</div>
                          </div>
                          <span className="rounded-full bg-[#0072FF]/20 border border-[#00D2FF]/40 px-2.5 py-0.5 text-[10px] font-semibold text-[#00D2FF] shrink-0">
                            {item.sectionType}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Controls: Yara AI Button + Bell Badge + User Profile */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveAiModule(YARA_AI_MODULES[0])}
              className="h-10 px-4 rounded-full bg-gradient-to-r from-[#091E46] via-[#0D2E6E] to-[#123A85] border border-[#00D2FF]/70 shadow-[0_0_16px_rgba(0,210,255,0.35)] hover:shadow-[0_0_22px_rgba(0,210,255,0.55)] flex items-center gap-2 text-xs sm:text-sm font-bold text-white transition-all"
            >
              <Bot className="h-4 w-4 text-[#00D2FF]" />
              <span>Yara AI</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </button>

            <div className="h-6 w-[1px] bg-[#1A2C56] hidden sm:block" />

            <button
              type="button"
              onClick={() => {
                setAccountModalTab('dashboard');
                setAccountModalOpen(true);
              }}
              aria-label="Notifications (3 unread)"
              className="relative h-10 w-10 rounded-full bg-[#0E172E] border border-[#1E3264] flex items-center justify-center text-slate-200 hover:text-white hover:border-[#00D2FF]/50 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-[10px] font-extrabold text-white flex items-center justify-center shadow">
                3
              </span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-[#101C38] transition-colors"
                aria-label="User Profile & Account"
              >
                <img
                  src={authUser?.avatarUrl || '/assets/fy/user-avatar.png'}
                  alt="User Profile Avatar"
                  className="h-9 w-9 rounded-full object-cover border border-[#00D2FF]/60"
                />
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-[#1E3A78] bg-[#0B142B] p-2 shadow-2xl z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[#162852]">
                    <div className="font-bold text-white truncate">
                      {authUser ? authUser.fullName || authUser.email : 'Guest Workspace'}
                    </div>
                    <div className="text-[11px] text-[#00D2FF] truncate">
                      {authUser ? authUser.email : 'Local Storage Active'}
                    </div>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setAccountModalTab('dashboard');
                        setAccountModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-[#132347] hover:text-white font-medium"
                    >
                      Account Overview &amp; Favorites
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setAccountModalTab('profile');
                        setAccountModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-[#132347] hover:text-white font-medium"
                    >
                      Profile Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setAccountModalTab('saved');
                        setAccountModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-[#132347] hover:text-white font-medium"
                    >
                      Saved Items
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setAccountModalTab('auth');
                        setAccountModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#00D2FF] hover:bg-[#132347] font-bold"
                    >
                      {authUser ? 'Session & Security' : 'Login / Sign Up'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setAccountModalTab('admin');
                        setAccountModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-amber-300 hover:bg-[#132347] font-bold flex items-center justify-between"
                    >
                      <span>Admin Control Panel</span>
                      <Shield className="h-3.5 w-3.5 text-amber-400" />
                    </button>
                    <a
                      href="/dashboard"
                      className="block w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-[#132347] hover:text-white font-medium"
                    >
                      Open Full Dashboard Page →
                    </a>
                    <a
                      href="/admin"
                      className="block w-full text-left px-3 py-2 rounded-xl text-amber-300/90 hover:bg-[#132347] hover:text-amber-200 font-medium"
                    >
                      Open Full Admin Center →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE WORKSPACE */}
        <main className="flex-1 px-4 lg:px-5 py-4 space-y-5 max-w-[1600px] w-full mx-auto">
          {/* LIVE SUPABASE ADMIN ANNOUNCEMENT BANNER */}
          {adminAnnouncements.length > 0 && (
            <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-r from-[#1A1438] via-[#0E1E45] to-[#0A1838] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_24px_rgba(0,168,255,0.2)]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="rounded-lg bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shrink-0">
                  {adminAnnouncements[0].badge || 'LIVE'}
                </span>
                <div className="text-xs sm:text-sm text-white truncate">
                  <strong className="font-extrabold text-[#00D2FF] mr-2">
                    {adminAnnouncements[0].title}:
                  </strong>
                  <span className="text-slate-200">{adminAnnouncements[0].message}</span>
                </div>
              </div>
              {adminAnnouncements[0].link_url && (
                <a
                  href={adminAnnouncements[0].link_url}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#0072FF] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0055FF] shrink-0"
                >
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}

          {/* =================================================================
              HERO BANNER (Matches Reference Design 1:1)
             ================================================================= */}
          <section className="relative rounded-2xl overflow-hidden border border-[#1D356B] bg-[#070E22] shadow-[0_10px_40px_rgba(0,0,0,0.65)] min-h-[270px] sm:min-h-[300px] flex items-center">
            {/* Right Gamer/Creator Artwork & Ambient Cyber Studio Backdrop */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <img
                src="/assets/fy/hero-gamer.png"
                alt="Falylio Yara Digital Studio"
                className="absolute right-0 top-0 h-full w-full lg:w-[68%] object-cover object-right opacity-90"
              />
              {/* Smooth gradient masks so left typography is crisp and readable */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#060C1E] via-[#07112A]/90 lg:via-[#07112A]/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060C1E] via-transparent to-[#060C1E]/40" />
            </div>

            {/* Left / Center Hero Content */}
            <div className="relative z-10 w-full lg:w-[58%] px-5 sm:px-10 pt-6 pb-11 sm:py-6 flex flex-col items-center text-center">
              {/* Welcome Pill */}
              <div className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-white mb-1">
                <span className="text-lg">👋</span>
                <span>{currentSlide.welcome}</span>
                <span className="text-lg">👋</span>
              </div>

              {/* Main Falylio Yara Heading */}
              <h1
                className="text-4xl sm:text-5xl md:text-[54px] font-black tracking-tight leading-none drop-shadow-[0_4px_24px_rgba(0,210,255,0.3)]"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                <span className="text-white">Falylio </span>
                <span className="bg-gradient-to-r from-[#00E5FF] via-[#00B8FF] to-[#0088FF] bg-clip-text text-transparent">
                  Yara
                </span>
              </h1>

              {/* Subtitle */}
              <div className="mt-1.5 text-lg sm:text-2xl font-extrabold tracking-tight">
                <span className="text-white">All-in-One Digital </span>
                <span className="text-[#00D2FF]">Platform</span>
              </div>

              {/* Tagline */}
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-200 tracking-wide">
                {currentSlide.tagline}
              </p>

              {/* Hero Search Bar */}
              <form
                onSubmit={handleHeroSearchSubmit}
                className="mt-4 w-full max-w-lg relative flex items-center"
              >
                <Search className="h-4 w-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Search for games, tools, apps..."
                  aria-label="Search for games, tools, apps"
                  className="w-full h-11 rounded-full bg-[#091328]/90 border border-[#244385] pl-11 pr-16 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00D2FF] shadow-[0_0_25px_rgba(0,114,255,0.2)]"
                />
                <button
                  type="submit"
                  aria-label="Run Hero Search"
                  className="absolute right-1.5 h-8 w-11 rounded-full bg-gradient-to-r from-[#00B4FF] to-[#0066FF] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,180,255,0.65)] hover:opacity-95 transition-opacity"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {/* 3 Trust Features Row */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-medium text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>Fast &amp; Secure</span>
                </span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-sky-400" />
                  <span>100% Free</span>
                </span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Worldwide Access</span>
                </span>
              </div>
            </div>

            {/* Bottom Right Carousel Controls */}
            <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Slide ${idx + 1}`}
                    onClick={() => setHeroSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      heroSlideIndex === idx ? 'w-4 bg-[#00D2FF]' : 'w-1.5 bg-slate-500/60'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Previous Slide"
                onClick={() =>
                  setHeroSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                }
                className="h-7 w-7 rounded-full bg-[#0B1631]/85 border border-[#244385] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#00D2FF]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Next Slide"
                onClick={() => setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="h-7 w-7 rounded-full bg-[#0B1631]/85 border border-[#244385] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#00D2FF]"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          {/* LIVE ADMIN-PUBLISHED CUSTOM ITEMS (Games, Tools, Courses, Apps, Products) */}
          {adminCustomItems.length > 0 && (
            <section className="space-y-3 rounded-2xl border border-[#1E3A78] bg-[#09132B]/90 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#00D2FF]" />
                  <span>Newly Added by Admin ({adminCustomItems.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalTab('admin');
                    setAccountModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#00D2FF] hover:underline"
                >
                  Manage in Admin Panel →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {adminCustomItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#213B79] bg-[#0D1A3A] p-3.5 flex flex-col justify-between gap-2.5 hover:border-[#00D2FF] transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-[#0072FF]/25 border border-[#00D2FF]/40 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#00D2FF]">
                          {item.section_type} • {item.category}
                        </span>
                        <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#182C5A]">
                      <span className="text-[11px] font-bold text-emerald-300">
                        {item.price_label}
                      </span>
                      {item.action_url ? (
                        <a
                          href={item.action_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0072FF] px-3 py-1 text-xs font-bold text-white hover:bg-[#0055FF]"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#00D2FF] font-semibold">
                          Official Platform Item
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =================================================================
              POPULAR CATEGORIES (8 Glowing Cards Row)
             ================================================================= */}
          <section id="popular-categories" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2
                className="text-base sm:text-lg font-bold text-white flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span>Popular Categories</span>
              </h2>
              <button
                type="button"
                onClick={() => scrollToSection('#all-tools', 'tools')}
                className="text-xs font-semibold text-[#00D2FF] hover:underline inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
              {[
                {
                  id: 'cat-gaming',
                  title: 'Gaming\nZone',
                  href: '#gaming-zone',
                  navId: 'gaming',
                  glow: 'from-purple-600/25 via-indigo-900/20 to-[#0B132B]',
                  border: 'border-purple-500/35 hover:border-purple-400',
                  iconBg: 'bg-purple-500/20 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.45)]',
                  icon: <Gamepad2 className="h-6 w-6" />,
                },
                {
                  id: 'cat-tools',
                  title: 'All\nTools',
                  href: '#all-tools',
                  navId: 'tools',
                  glow: 'from-emerald-600/25 via-teal-900/20 to-[#0B132B]',
                  border: 'border-emerald-500/35 hover:border-emerald-400',
                  iconBg: 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.45)]',
                  icon: <Wrench className="h-6 w-6" />,
                },
                {
                  id: 'cat-ai',
                  title: 'AI\nCenter',
                  href: '#ai-center',
                  navId: 'ai',
                  glow: 'from-sky-500/30 via-blue-900/25 to-[#0B132B]',
                  border: 'border-[#00D2FF]/60 hover:border-[#00D2FF]',
                  iconBg: 'bg-sky-500/25 text-[#00D2FF] shadow-[0_0_24px_rgba(0,210,255,0.6)]',
                  icon: <Bot className="h-6 w-6" />,
                },
                {
                  id: 'cat-apps',
                  title: 'Apps &\nSoftware',
                  href: '#apps-software',
                  navId: 'apps',
                  glow: 'from-amber-500/25 via-orange-900/20 to-[#0B132B]',
                  border: 'border-amber-500/35 hover:border-amber-400',
                  iconBg: 'bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.45)]',
                  icon: <AppWindow className="h-6 w-6" />,
                },
                {
                  id: 'cat-market',
                  title: 'Marketplace',
                  href: '#marketplace',
                  navId: 'marketplace',
                  glow: 'from-pink-600/25 via-rose-900/20 to-[#0B132B]',
                  border: 'border-pink-500/35 hover:border-pink-400',
                  iconBg: 'bg-pink-500/20 text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.45)]',
                  icon: <ShoppingCart className="h-6 w-6" />,
                },
                {
                  id: 'cat-edu',
                  title: 'Education',
                  href: '#education',
                  navId: 'education',
                  glow: 'from-teal-500/25 via-emerald-900/20 to-[#0B132B]',
                  border: 'border-teal-500/35 hover:border-teal-400',
                  iconBg: 'bg-teal-500/20 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.45)]',
                  icon: <GraduationCap className="h-6 w-6" />,
                },
                {
                  id: 'cat-stock',
                  title: 'Stock\nMedia',
                  href: '#stock-media',
                  navId: 'stock',
                  glow: 'from-violet-600/25 via-purple-900/20 to-[#0B132B]',
                  border: 'border-violet-500/35 hover:border-violet-400',
                  iconBg: 'bg-violet-500/20 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.45)]',
                  icon: <ImageIcon className="h-6 w-6" />,
                },
                {
                  id: 'cat-social',
                  title: 'Social\nStudio',
                  href: '#social-studio',
                  navId: 'social',
                  glow: 'from-yellow-500/25 via-amber-900/20 to-[#0B132B]',
                  border: 'border-yellow-500/35 hover:border-yellow-400',
                  iconBg: 'bg-yellow-500/20 text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.45)]',
                  icon: <Megaphone className="h-6 w-6" />,
                },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => scrollToSection(cat.href, cat.navId)}
                  className={`group relative rounded-2xl border ${cat.border} bg-gradient-to-b ${cat.glow} p-3.5 flex flex-col items-center justify-between min-h-[112px] text-center transition-all hover:-translate-y-0.5`}
                >
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${cat.iconBg}`}>
                    {cat.icon}
                  </div>
                  <div className="mt-2 text-xs font-bold text-white whitespace-pre-line leading-tight">
                    {cat.title}
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 h-5 w-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:border-white/30">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* =================================================================
              MIDDLE 3-COLUMN BENTO ROW:
              1. Featured Games | 2. Trending AI Tools | 3. Unlock the Power of AI
             ================================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* COLUMN 1: Featured Games (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-base font-bold text-white flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>Featured Games</span>
                </h3>
                <button
                  type="button"
                  onClick={() => scrollToSection('#gaming-zone', 'gaming')}
                  className="text-xs font-semibold text-[#00D2FF] hover:underline inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1">
                {/* Main Featured Game Card (Battlegrounds Mobile India) */}
                <div
                  onClick={() => setActiveGame(BROWSER_GAMES[0])}
                  className="sm:col-span-6 relative rounded-xl overflow-hidden border border-[#233E7D] group cursor-pointer min-h-[175px] flex flex-col justify-end p-3"
                >
                  <img
                    src="/assets/fy/game-bgmi.png"
                    alt="Battlegrounds Mobile India"
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050B1A] via-[#050B1A]/30 to-transparent" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0099FF] to-[#0055FF] px-4 py-1.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,153,255,0.65)]">
                      <span>Play Now</span>
                      <Play className="h-3 w-3 fill-white" />
                    </span>
                  </div>
                </div>

                {/* Right 3 Game Rows */}
                <div className="sm:col-span-6 flex flex-col justify-between gap-2">
                  {[
                    {
                      title: 'Free Fire',
                      subtitle: 'Battle Royale',
                      img: '/assets/fy/game-freefire.png',
                      game: BROWSER_GAMES[0],
                    },
                    {
                      title: 'Minecraft',
                      subtitle: 'Build & Survive',
                      img: '/assets/fy/game-minecraft.png',
                      game: BROWSER_GAMES[1] || BROWSER_GAMES[0],
                    },
                    {
                      title: 'GTA V',
                      subtitle: 'Open World',
                      img: '/assets/fy/game-gtav.png',
                      game: BROWSER_GAMES[2] || BROWSER_GAMES[0],
                    },
                  ].map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setActiveGame(item.game)}
                      className="w-full rounded-xl border border-[#192D5C] bg-[#0F1B38]/90 hover:bg-[#142449] hover:border-[#00D2FF]/50 p-2 flex items-center justify-between gap-2.5 transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="h-10 w-10 rounded-lg object-cover border border-white/15 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{item.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                        </div>
                      </div>
                      <span className="h-6 w-6 rounded-full bg-[#182952] flex items-center justify-center text-slate-300 shrink-0">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Trending AI Tools (3.5 -> 3 cols on 12-col grid) */}
            <div className="lg:col-span-3 rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-base font-bold text-white flex items-center gap-1.5"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  <Sparkles className="h-4 w-4 text-[#00D2FF]" />
                  <span>Trending AI Tools</span>
                </h3>
                <button
                  type="button"
                  onClick={() => scrollToSection('#ai-center', 'ai')}
                  className="text-xs font-semibold text-[#00D2FF] hover:underline inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-col justify-between gap-2.5 flex-1">
                {[
                  {
                    title: 'AI Image Generator',
                    subtitle: 'Create Stunning Images',
                    iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
                    icon: <ImageIcon className="h-4 w-4" />,
                    module:
                      YARA_AI_MODULES.find((m) => m.id === 'ai-image') || YARA_AI_MODULES[0],
                  },
                  {
                    title: 'AI Chat Assistant',
                    subtitle: 'Ask Anything',
                    iconBg: 'bg-sky-500/20 text-[#00D2FF] border-sky-400/30',
                    icon: <MessageSquare className="h-4 w-4" />,
                    module:
                      YARA_AI_MODULES.find((m) => m.id === 'ai-chat') || YARA_AI_MODULES[0],
                  },
                  {
                    title: 'Text Summarizer',
                    subtitle: 'Summarize Text',
                    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
                    icon: <FileText className="h-4 w-4" />,
                    module:
                      YARA_AI_MODULES.find((m) => m.id === 'ai-summarizer') || YARA_AI_MODULES[0],
                  },
                ].map((ai) => (
                  <button
                    key={ai.title}
                    type="button"
                    onClick={() => setActiveAiModule(ai.module)}
                    className="w-full rounded-xl border border-[#192D5C] bg-[#0F1B38]/90 hover:bg-[#142449] hover:border-[#00D2FF]/50 p-2.5 flex items-center justify-between gap-3 transition-all text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${ai.iconBg}`}
                      >
                        {ai.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{ai.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{ai.subtitle}</div>
                      </div>
                    </div>
                    <span className="h-6 w-6 rounded-full bg-[#182952] flex items-center justify-center text-slate-300 shrink-0">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* COLUMN 3: Unlock the Power of AI Banner (4 cols) */}
            <div className="lg:col-span-4 relative rounded-2xl overflow-hidden border border-[#2B4696] bg-[#0B173D] p-5 flex items-center justify-between shadow-[0_0_30px_rgba(0,114,255,0.2)] min-h-[225px]">
              {/* Right AI Robot Mascot Artwork */}
              <img
                src="/assets/fy/ai-robot.png"
                alt="Yara AI Robot Assistant"
                className="absolute right-0 bottom-0 h-full w-[45%] object-cover object-right pointer-events-none select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B173D] via-[#0E1C4A] via-60% to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-[64%] space-y-2.5">
                <h3
                  className="text-lg sm:text-[19px] font-extrabold text-white leading-tight whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Unlock the Power of AI
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Smarter Tools. Bigger Possibilities.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAiModule(YARA_AI_MODULES[0])}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00D2FF] via-[#3A7BD5] to-[#9333EA] px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(0,210,255,0.5)] hover:opacity-95 transition-opacity"
                  >
                    <span>Try Yara AI Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================
              BOTTOM 2-COLUMN BENTO ROW:
              1. Latest Apps [NEW] | 2. Popular Courses [HOT]
             ================================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT: Latest Apps [NEW] */}
            <div
              id="apps-software"
              className="lg:col-span-6 rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-[#00D2FF]">
                    <AppWindow className="h-3.5 w-3.5" />
                  </div>
                  <h3
                    className="text-base font-bold text-white"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Latest Apps
                  </h3>
                  <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                    NEW
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSection('#all-tools', 'tools')}
                  className="text-xs font-semibold text-[#00D2FF] hover:underline inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SOFTWARE_APPS.slice(0, 4).map((app, idx) => {
                  const gradients = [
                    'from-amber-500/30 via-orange-600/20 to-[#0F1B38] border-amber-400/35',
                    'from-emerald-500/30 via-teal-600/20 to-[#0F1B38] border-emerald-400/35',
                    'from-sky-500/30 via-blue-600/20 to-[#0F1B38] border-sky-400/35',
                    'from-purple-500/30 via-indigo-600/20 to-[#0F1B38] border-purple-400/35',
                  ];
                  return (
                    <div
                      key={app.id}
                      onClick={() => handleOpenTool(PLATFORM_TOOLS[idx % PLATFORM_TOOLS.length])}
                      className={`group cursor-pointer rounded-xl border bg-gradient-to-b ${
                        gradients[idx % gradients.length]
                      } p-3 flex flex-col justify-between hover:-translate-y-0.5 transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30 text-slate-200">
                          {app.platform}
                        </span>
                        <span className="text-[11px] font-bold text-amber-300">★ {app.rating}</span>
                      </div>
                      <div className="my-3 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                          <AppWindow className="h-6 w-6 text-[#00D2FF]" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate">{app.name}</div>
                        <div className="text-[10px] text-slate-300 truncate">{app.license}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Popular Courses [HOT] */}
            <div className="lg:col-span-6 rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                  <h3
                    className="text-base font-bold text-white"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Popular Courses
                  </h3>
                  <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                    HOT
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSection('#education', 'education')}
                  className="text-xs font-semibold text-[#00D2FF] hover:underline inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EDUCATION_COURSES.slice(0, 2).map((course, idx) => (
                  <div
                    key={course.id}
                    onClick={() => setActiveCourseQuiz(course)}
                    className="group cursor-pointer rounded-xl border border-[#213B75] bg-gradient-to-br from-[#102048] via-[#151D42] to-[#23154B] p-3.5 flex flex-col justify-between hover:border-[#00D2FF] transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#00D2FF]/20 border border-[#00D2FF]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#00D2FF]">
                        {course.track}
                      </span>
                      <span className="text-[11px] text-slate-300">{course.duration}</span>
                    </div>
                    <div className="my-2.5">
                      <div className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00D2FF] transition-colors line-clamp-1">
                        {course.title}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {course.lessonsCount} Lessons • {course.level}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-[11px] font-semibold text-amber-300">
                        Interactive MCQ Quiz
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-white group-hover:translate-x-0.5 transition-transform">
                        <span>Start</span>
                        <ArrowRight className="h-3 w-3 text-[#00D2FF]" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =================================================================
              ALL 17 TOOL CATEGORIES & SEARCHABLE TOOLS DIRECTORY (#all-tools)
             ================================================================= */}
          <section
            id="all-tools"
            className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-5 space-y-5 shadow-lg"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#162852] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00D2FF]">
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Complete 17-Category Utility Ecosystem</span>
                </div>
                <h2
                  className="text-xl sm:text-2xl font-bold text-white mt-1"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  All Online Tools Directory
                </h2>
              </div>

              {/* Filter Tabs + Search Input */}
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'popular', 'recent', 'recommended', 'free'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedToolTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                      selectedToolTab === tab
                        ? 'bg-gradient-to-r from-[#00A8FF] to-[#0055FF] text-white shadow-[0_0_12px_rgba(0,168,255,0.4)]'
                        : 'bg-[#101E3E] text-slate-300 hover:text-white border border-[#1E3468]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={toolSearchQuery}
                    onChange={(e) => setToolSearchQuery(e.target.value)}
                    placeholder="Filter tools..."
                    aria-label="Filter tools"
                    className="h-8 rounded-xl bg-[#0D1834] border border-[#213B75] pl-8 pr-3 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>
              </div>
            </div>

            {/* 17 Tool Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setSelectedToolCategory('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedToolCategory === 'All'
                    ? 'bg-[#00D2FF] text-[#050C1D] font-bold'
                    : 'bg-[#0F1B38] text-slate-300 border border-[#1B3164] hover:border-[#00D2FF]/50'
                }`}
              >
                All 17 Categories ({PLATFORM_TOOLS.length})
              </button>
              {ALL_TOOL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedToolCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedToolCategory === cat
                      ? 'bg-[#00D2FF] text-[#050C1D] font-bold'
                      : 'bg-[#0F1B38] text-slate-300 border border-[#1B3164] hover:border-[#00D2FF]/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {filteredTools.map((tool) => {
                const isFav = favoriteIds.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    className="rounded-xl border border-[#1B3164] bg-[#0E1936]/90 hover:border-[#00D2FF]/60 p-4 flex flex-col justify-between gap-3 transition-all group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-10 w-10 rounded-xl bg-[#14254E] border border-[#25448A] flex items-center justify-center text-[#00D2FF]">
                          {getIconComponent(tool.iconName, 'h-5 w-5 text-[#00D2FF]')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-[#15264E] px-2.5 py-0.5 text-[10px] font-semibold text-sky-300">
                            {tool.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleFavorite(tool.id)}
                            aria-label={`Bookmark ${tool.name}`}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isFav
                                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                                : 'bg-[#101E3E] border-[#1E3468] text-slate-400 hover:text-white'
                            }`}
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00D2FF] transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenTool(tool)}
                      className="w-full rounded-xl bg-gradient-to-r from-[#0072FF] to-[#00B4FF] py-2 text-xs font-bold text-white shadow-[0_0_12px_rgba(0,114,255,0.35)] hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
                    >
                      <span>Open Workbench</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =================================================================
              YARA AI CENTER — ALL 10 AI MODULES (#ai-center)
             ================================================================= */}
          <section
            id="ai-center"
            className="rounded-2xl border border-[#243E82] bg-gradient-to-b from-[#0C1736] to-[#081026] p-5 space-y-4 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#192E61] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00D2FF]">
                  <Bot className="h-4 w-4" />
                  <span>Server-Side Gemini AI Workspace</span>
                </div>
                <h2
                  className="text-xl sm:text-2xl font-bold text-white mt-0.5"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Yara AI Center — 10 Specialized Assistants
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveAiModule(YARA_AI_MODULES[0])}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00D2FF] to-[#7C3AED] px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,210,255,0.4)]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Launch Yara AI Studio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {YARA_AI_MODULES.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => setActiveAiModule(mod)}
                  className="cursor-pointer rounded-xl border border-[#1F3873] bg-[#0F1D40]/90 hover:border-[#00D2FF] p-3.5 flex flex-col justify-between gap-3 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-9 w-9 rounded-xl bg-[#162B5E] border border-[#00D2FF]/40 flex items-center justify-center text-[#00D2FF]">
                        {getIconComponent(mod.iconName, 'h-4 w-4 text-[#00D2FF]')}
                      </div>
                      <span className="rounded-full bg-purple-500/20 border border-purple-400/40 px-2 py-0.5 text-[10px] font-bold text-purple-200">
                        {mod.category}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00D2FF]">
                      {mod.name}
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{mod.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#00D2FF] pt-1">
                    <span>Open Studio</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* =================================================================
              GAMING ZONE & BROWSER GAMES (#gaming-zone)
             ================================================================= */}
          <section
            id="gaming-zone"
            className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-5 space-y-4 shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-[#162852] pb-3">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                  <Gamepad2 className="h-4 w-4" />
                  <span>Instant Play &amp; Esports Hub</span>
                </div>
                <h2
                  className="text-xl font-bold text-white mt-0.5"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Gaming Zone
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {BROWSER_GAMES.map((game) => (
                <div
                  key={game.id}
                  className="rounded-xl border border-[#223A74] bg-[#0F1B38] p-4 flex flex-col justify-between gap-3 hover:border-purple-400 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="rounded-full bg-purple-500/20 border border-purple-400/40 px-2.5 py-0.5 font-bold text-purple-300">
                        {game.category}
                      </span>
                      <span className="text-slate-400">{game.playersCount}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{game.title}</h3>
                    <p className="text-xs text-slate-300">{game.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveGame(game)}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-[#0072FF] py-2 text-xs font-bold text-white flex items-center justify-center gap-1.5 hover:opacity-95"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Play in Browser</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* =================================================================
              DIGITAL MARKETPLACE (#marketplace) & EDUCATION (#education)
             ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Digital Marketplace (6 cols) */}
            <section
              id="marketplace"
              className="lg:col-span-6 rounded-2xl border border-[#1B3164] bg-[#0A1329] p-5 space-y-4 shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#162852] pb-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Templates, E-Books &amp; Assets</span>
                  </div>
                  <h2
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Digital Marketplace
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Templates', 'Graphics', 'E-books', 'Software'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMarketplaceFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        marketplaceFilter === cat
                          ? 'bg-pink-500 text-white'
                          : 'bg-[#101E3E] text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {selectedProductNotice && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-3 text-xs text-emerald-200 flex items-center justify-between">
                  <span>{selectedProductNotice}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedProductNotice(null)}
                    className="text-emerald-300 underline ml-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MARKETPLACE_PRODUCTS.filter(
                  (p) => marketplaceFilter === 'All' || p.category === marketplaceFilter
                ).map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-[#1E3468] bg-[#0E1936] p-3.5 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-pink-300 font-semibold">{product.category}</span>
                        <span className="font-bold text-emerald-400">${product.price}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white mt-1">
                        {product.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        By {product.seller} • ★ {product.rating}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedProductNotice(
                          `Added "${product.title}" ($${product.price}) to your Falylio Yara workspace queue.`
                        )
                      }
                      className="w-full rounded-lg bg-[#162954] hover:bg-[#0072FF] border border-[#26468C] py-1.5 text-xs font-bold text-white transition-colors"
                    >
                      Get Digital Asset
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Education & Courses with MCQ Quizzes (6 cols) */}
            <section
              id="education"
              className="lg:col-span-6 rounded-2xl border border-[#1B3164] bg-[#0A1329] p-5 space-y-4 shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#162852] pb-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Interactive Academy &amp; MCQ Quizzes</span>
                  </div>
                  <h2
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Education &amp; Courses
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Programming', 'AI Learning', 'Graphic Design', 'Islamic Studies'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCourseFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          courseFilter === cat
                            ? 'bg-teal-500 text-slate-950 font-bold'
                            : 'bg-[#101E3E] text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EDUCATION_COURSES.filter(
                  (c) => courseFilter === 'All' || c.track === courseFilter
                ).map((course) => (
                  <div
                    key={course.id}
                    className="rounded-xl border border-[#1E3468] bg-[#0E1936] p-3.5 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-teal-300 font-bold">{course.track}</span>
                        <span className="text-slate-400">{course.level}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white mt-1">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {course.lessonsCount} Lessons • {course.duration}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveCourseQuiz(course)}
                      className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-[#0072FF] py-1.5 text-xs font-bold text-white"
                    >
                      Take Course Quiz
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* =================================================================
              STOCK MEDIA, SOCIAL STUDIO, WEBSITE BUILDER & BUSINESS TOOLS
             ================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Stock Media (#stock-media) */}
            <section
              id="stock-media"
              className="lg:col-span-4 rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-violet-400" />
                  <span>Stock Media Library</span>
                </h3>
                <select
                  aria-label="Filter Stock Media"
                  value={mediaFilter}
                  onChange={(e) => setMediaFilter(e.target.value)}
                  className="rounded-lg bg-[#101E3E] border border-[#213B75] px-2 py-1 text-xs text-white"
                >
                  <option value="All">All Types</option>
                  <option value="Photos">Photos</option>
                  <option value="Vectors">Vectors</option>
                  <option value="Wallpapers">Wallpapers</option>
                  <option value="Icons">Icons</option>
                </select>
              </div>
              <div className="space-y-2">
                {STOCK_MEDIA_ITEMS.filter(
                  (m) => mediaFilter === 'All' || m.type === mediaFilter
                )
                  .slice(0, 4)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#192D5C] bg-[#0F1B38] p-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.type} • {item.resolutionOrFormat} • {item.license}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenTool(PLATFORM_TOOLS[0])}
                        className="px-2.5 py-1 rounded-lg bg-[#182C59] text-[#00D2FF] font-semibold hover:bg-[#0072FF] hover:text-white transition-colors"
                      >
                        Open
                      </button>
                    </div>
                  ))}
              </div>
            </section>

            {/* Social Studio & Website Builder (#social-studio, #website-builder) */}
            <section
              id="social-studio"
              className="lg:col-span-4 rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4 space-y-3"
            >
              <div id="website-builder" className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-amber-400" />
                  <span>Social Studio &amp; Web Builder</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Thumbnail Maker', toolId: 'tool-social-hashtags' },
                  { label: 'Caption & Bio AI', toolId: 'tool-social-hashtags' },
                  { label: 'HTML Live Preview', toolId: 'tool-dev-json' },
                  { label: 'Color & CSS Studio', toolId: 'tool-color-contrast' },
                ].map((studio) => (
                  <button
                    key={studio.label}
                    type="button"
                    onClick={() => {
                      const found =
                        PLATFORM_TOOLS.find((t) => t.id === studio.toolId) || PLATFORM_TOOLS[0];
                      handleOpenTool(found);
                    }}
                    className="rounded-xl border border-[#1E3468] bg-[#0F1B38] hover:border-[#00D2FF] p-3 text-left transition-all"
                  >
                    <Code2 className="h-4 w-4 text-[#00D2FF] mb-1.5" />
                    <div className="text-xs font-bold text-white">{studio.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Launch Workbench →</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Business Tools & Task Planner (#business-tools) */}
            <section
              id="business-tools"
              className="lg:col-span-4 rounded-2xl border border-[#1B3164] bg-[#0A1329] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#00D2FF]" />
                  <span>Business &amp; Task Planner</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const inv =
                      PLATFORM_TOOLS.find((t) => t.id === 'tool-office-invoice') ||
                      PLATFORM_TOOLS[0];
                    handleOpenTool(inv);
                  }}
                  className="text-[11px] font-bold text-[#00D2FF] hover:underline"
                >
                  Invoice Builder →
                </button>
              </div>

              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Add workspace task..."
                  aria-label="Add workspace task"
                  className="flex-1 rounded-lg bg-[#0F1B38] border border-[#213B75] px-3 py-1.5 text-xs text-white placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#0072FF] px-3 py-1.5 text-xs font-bold text-white"
                >
                  Add
                </button>
              </form>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-center gap-2.5 rounded-lg bg-[#0F1B38] px-3 py-2 text-xs cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() =>
                        setTasks(
                          tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
                        )
                      }
                      className="rounded border-slate-600 text-[#00D2FF]"
                    />
                    <span className={task.done ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {task.text}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* =================================================================
              ENTERTAINMENT & NEWS / COMMUNITY (#entertainment, #news-community)
             ================================================================= */}
          <section
            id="entertainment"
            className="rounded-2xl border border-[#1B3164] bg-[#0A1329] p-5 space-y-4"
          >
            <div id="news-community" className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2
                  className="text-lg font-bold text-white flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  <Newspaper className="h-4 w-4 text-[#00D2FF]" />
                  <span>Entertainment, Tech News &amp; Community Hub</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'AI News', 'Technology News', 'Tutorials', 'Discussion Forum'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCommunityFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        communityFilter === cat
                          ? 'bg-[#0072FF] text-white'
                          : 'bg-[#101E3E] text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {COMMUNITY_POSTS.filter(
                (post) => communityFilter === 'All' || post.category === communityFilter
              ).map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-[#1E3468] bg-[#0E1936] p-3.5 flex flex-col justify-between gap-2"
                >
                  <div className="space-y-1.5">
                    <span className="rounded-full bg-[#162954] px-2.5 py-0.5 text-[10px] font-bold text-[#00D2FF]">
                      {post.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white">{post.title}</h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{post.summary}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span>{post.author}</span>
                    <span>{post.repliesCount} replies</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* =================================================================
              FOOTER & INTERACTIVE CONTACT (#contact-footer)
             ================================================================= */}
          <footer
            id="contact-footer"
            className="rounded-2xl border border-[#16264C] bg-[#070D1F] p-6 text-slate-300 space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/fy/logo-mark.png"
                    alt="Falylio Yara"
                    className="h-10 w-auto object-contain"
                  />
                  <div>
                    <div className="text-base font-extrabold text-white">
                      Falylio <span className="text-[#00D2FF]">Yara</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Dream • Create • Grow</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All-in-One Digital Platform bringing together Gaming, Online Tools, Yara AI Studio, Apps &amp; Software, Digital Marketplace, Education, and Creator Studios.
                </p>
              </div>

              <div className="lg:col-span-4 grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="font-bold text-white">Quick Navigation</div>
                  <ul className="space-y-1.5 text-slate-400">
                    <li>
                      <a href="#gaming-zone" className="hover:text-[#00D2FF]">
                        Gaming Zone
                      </a>
                    </li>
                    <li>
                      <a href="#all-tools" className="hover:text-[#00D2FF]">
                        All 17 Tool Categories
                      </a>
                    </li>
                    <li>
                      <a href="#ai-center" className="hover:text-[#00D2FF]">
                        Yara AI Center
                      </a>
                    </li>
                    <li>
                      <a href="#marketplace" className="hover:text-[#00D2FF]">
                        Digital Marketplace
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-white">Platform &amp; Account</div>
                  <ul className="space-y-1.5 text-slate-400">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountModalTab('dashboard');
                          setAccountModalOpen(true);
                        }}
                        className="hover:text-[#00D2FF]"
                      >
                        User Dashboard
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountModalTab('admin');
                          setAccountModalOpen(true);
                        }}
                        className="hover:text-[#00D2FF]"
                      >
                        Admin Console
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountModalTab('architecture');
                          setAccountModalOpen(true);
                        }}
                        className="hover:text-[#00D2FF]"
                      >
                        Supabase &amp; APK Status
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-4 rounded-xl border border-[#1B3164] bg-[#0B142B] p-4 space-y-2.5">
                <div className="text-xs font-bold text-white">Contact &amp; Support</div>
                {contactSubmitted ? (
                  <div className="rounded-lg border border-sky-500/40 bg-sky-950/50 p-3 text-xs text-sky-200 space-y-1.5">
                    <div className="font-bold">Thank you, {contactName}!</div>
                    <p>Your inquiry has been received by the Falylio Yara team.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Your Name"
                        aria-label="Your Name"
                        className="rounded-lg bg-[#0F1B38] border border-[#213B75] px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Email"
                        aria-label="Your Email"
                        className="rounded-lg bg-[#0F1B38] border border-[#213B75] px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Message..."
                      aria-label="Your Message"
                      className="w-full rounded-lg bg-[#0F1B38] border border-[#213B75] px-2.5 py-1.5 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-gradient-to-r from-[#0072FF] to-[#00D2FF] py-1.5 text-xs font-bold text-white"
                    >
                      Send Inquiry
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="border-t border-[#142242] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <div>© {new Date().getFullYear()} Falylio Yara. All rights reserved. Dream • Create • Grow.</div>
              <div>All-in-One Digital Platform • Fast &amp; Secure • 100% Free • Worldwide Access</div>
            </div>
          </footer>
        </main>
      </div>

      {/* =====================================================================
          INTERACTIVE MODALS
         ===================================================================== */}
      <ToolWorkbenchModal
        tool={activeTool}
        onClose={() => setActiveTool(null)}
        isFavorite={activeTool ? favoriteIds.includes(activeTool.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      <YaraAiStudioModal
        moduleItem={activeAiModule}
        onClose={() => setActiveAiModule(null)}
      />

      <CourseQuizModal
        course={activeCourseQuiz}
        onClose={() => setActiveCourseQuiz(null)}
      />

      <BrowserGameModal
        game={activeGame}
        onClose={() => setActiveGame(null)}
      />

      <AccountAndAdminModal
        isOpen={accountModalOpen}
        initialTab={accountModalTab}
        onClose={() => setAccountModalOpen(false)}
        favoriteIds={favoriteIds}
        recentToolIds={recentToolIds}
        onSelectTool={(tool) => handleOpenTool(tool)}
        onRemoveFavorite={handleToggleFavorite}
        onCloudStateSynced={(mergedFavs, mergedRecs) => {
          setFavoriteIds(mergedFavs);
          setRecentToolIds(mergedRecs);
          try {
            localStorage.setItem('fy_favorites', JSON.stringify(mergedFavs));
            localStorage.setItem('fy_recents', JSON.stringify(mergedRecs));
          } catch {
            // Ignore
          }
        }}
        onAuthUserChanged={(u) => setAuthUser(u)}
        onAdminContentChanged={refreshPublicAdminContent}
      />
    </div>
  );
}

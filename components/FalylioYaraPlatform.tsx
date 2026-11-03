'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { FyMonogram } from './BrandLogo';
import {
  POPULAR_CATEGORIES,
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
import { AccountAndAdminModal } from './AccountAndAdminModal';

function getIconComponent(iconName: string, className = 'h-5 w-5 text-[#0284C7]') {
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

export default function FalylioYaraPlatform() {
  // Global Search State
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tools Filtering State
  const [selectedToolTab, setSelectedToolTab] = useState<'all' | 'popular' | 'recent' | 'recommended' | 'free'>('popular');
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

  // Interactive Task Planner State (Business & Productivity Section)
  const [tasks, setTasks] = useState([
    { id: 't1', text: 'Review Q3 design system accessibility contrast ratios', done: true },
    { id: 't2', text: 'Export client invoice summary PDF for milestone 2', done: false },
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
  const [accountModalTab, setAccountModalTab] = useState<'dashboard' | 'auth' | 'admin' | 'architecture'>('dashboard');

  // Favorites & Recently Viewed (Persisted in localStorage)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['tool-text-counter', 'tool-dev-json']);
  const [recentToolIds, setRecentToolIds] = useState<string[]>(['tool-office-invoice']);

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('fy_favorites');
      const savedRecents = localStorage.getItem('fy_recents');
      if (savedFavs) setFavoriteIds(JSON.parse(savedFavs));
      if (savedRecents) setRecentToolIds(JSON.parse(savedRecents));
    } catch {
      // Ignore storage access errors
    }
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
  };

  const filteredTools = filterTools(PLATFORM_TOOLS, {
    category: selectedToolCategory,
    tag: selectedToolTab,
    query: toolSearchQuery,
  });

  const unifiedSearchResults = searchPlatformCatalog(globalQuery);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* =====================================================================
          A. HEADER (Strict 3-Zone Top Bar Contract)
         ===================================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Zone 1: Single Brand Wordmark Lockup */}
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            <FyMonogram className="h-8 w-8 shrink-0" />
            <span>Falylio Yara</span>
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#popular-categories" className="hover:text-[#0F172A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
              Explore
            </a>
            <a href="#all-tools" className="hover:text-[#0F172A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
              Tools
            </a>
            <a href="#ai-center" className="hover:text-[#0F172A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
              AI Center
            </a>
            <a href="#marketplace" className="hover:text-[#0F172A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
              Marketplace
            </a>
            <a href="#education" className="hover:text-[#0F172A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">
              Education
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setAccountModalTab('dashboard');
                setAccountModalOpen(true);
              }}
              className="rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Account & Workspace
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium text-slate-700">
              <a href="#popular-categories" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                Explore Categories
              </a>
              <a href="#all-tools" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                All Tools (17)
              </a>
              <a href="#ai-center" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                Yara AI Center
              </a>
              <a href="#marketplace" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                Marketplace
              </a>
              <a href="#education" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                Education & MCQs
              </a>
              <a href="#apps-software" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                Apps & Software
              </a>
              <a href="#business-productivity" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                Business & CV
              </a>
              <a href="#contact-footer" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-50">
                About & Contact
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Secondary Quick-Jump Ecosystem Strip (Non-Sticky, Below Header) */}
      <div className="border-b border-slate-200/80 bg-[#F0F7FF]">
        <div className="mx-auto flex flex-wrap max-w-[1360px] items-center justify-between gap-x-4 gap-y-1.5 px-4 sm:px-6 lg:px-8 py-2 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-semibold text-[#0F172A]">Ecosystem:</span>
            <a href="#all-tools" className="hover:text-[#0284C7] transition-colors whitespace-nowrap">17 Tool Categories</a>
            <span aria-hidden="true">·</span>
            <a href="#apps-software" className="hover:text-[#0284C7] transition-colors whitespace-nowrap">Apps & Software</a>
            <span aria-hidden="true">·</span>
            <a href="#stock-media" className="hover:text-[#0284C7] transition-colors whitespace-nowrap">Stock Media</a>
            <span aria-hidden="true">·</span>
            <a href="#social-studio" className="hover:text-[#0284C7] transition-colors whitespace-nowrap">Social Studio</a>
            <span aria-hidden="true">·</span>
            <a href="#web-builder" className="hover:text-[#0284C7] transition-colors whitespace-nowrap">Web Builder</a>
            <span aria-hidden="true">·</span>
            <a href="#business-productivity" className="hover:text-[#0284C7] transition-colors whitespace-nowrap">Business Suite</a>
            <span aria-hidden="true">·</span>
            <a href="#gaming-zone" className="hover:text-[#0284C7] transition-colors whitespace-nowrap">Logic Games</a>
            <span aria-hidden="true">·</span>
            <a href="#community-news" className="hover:text-[#0284C7] transition-colors whitespace-nowrap">Community</a>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setAccountModalTab('dashboard');
                setAccountModalOpen(true);
              }}
              className="hover:text-[#0284C7] font-medium tabular-nums"
            >
              Saved Tools ({favoriteIds.length})
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                setAccountModalTab('auth');
                setAccountModalOpen(true);
              }}
              className="hover:text-[#0284C7] font-medium"
            >
              Login / Sign Up
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                setAccountModalTab('admin');
                setAccountModalOpen(true);
              }}
              className="hover:text-[#0284C7] font-medium"
            >
              Admin Console
            </button>
          </div>
        </div>
      </div>

      <main id="top" className="flex-1">
        {/* =====================================================================
            B. HERO SECTION
           ===================================================================== */}
        <section className="relative border-b border-slate-200/80 bg-gradient-to-b from-[#F0F7FF] via-white to-white py-14 lg:py-20">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Core Proposition & Global Search */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#0369A1]">
                  <span className="whitespace-nowrap">Welcome to Falylio Yara</span>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">Dream • Create • Grow</span>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">All-in-One Digital Platform</span>
                </div>

                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.15]"
                  style={{ fontFamily: 'var(--font-display), sans-serif', textWrap: 'balance' }}
                >
                  Everything You Need, All in One Place
                </h1>

                <p className="max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
                  A calm, unified digital workspace bringing together 17 categories of browser utilities, Yara AI assistants, structured courses, software directories, stock media, and creator templates—built for clarity and everyday productivity.
                </p>

                {/* Unified Global Search Bar */}
                <div className="relative max-w-2xl">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSearchFocused(true);
                    }}
                    className="flex items-center rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm focus-within:border-[#0284C7]"
                  >
                    <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
                    <input
                      type="search"
                      aria-label="Search tools, AI assistants, courses, apps, or templates"
                      value={globalQuery}
                      onFocus={() => setSearchFocused(true)}
                      onChange={(e) => {
                        setGlobalQuery(e.target.value);
                        setSearchFocused(true);
                      }}
                      placeholder="Search tools, AI assistants, courses, invoices, JSON, or templates..."
                      className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    {globalQuery && (
                      <button
                        type="button"
                        onClick={() => setGlobalQuery('')}
                        aria-label="Clear search query"
                        className="px-2 text-xs text-slate-400 hover:text-slate-600"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0F172A] px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                    >
                      Search Platform
                    </button>
                  </form>

                  {/* Live Global Search Dropdown Results */}
                  {searchFocused && globalQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 px-2">
                        <span className="text-xs font-medium text-slate-500 tabular-nums">
                          {unifiedSearchResults.length} matching resources across Falylio Yara
                        </span>
                        <button
                          type="button"
                          onClick={() => setSearchFocused(false)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Close
                        </button>
                      </div>
                      {unifiedSearchResults.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No matches found for &ldquo;{globalQuery}&rdquo;. Try searching for &ldquo;PDF&rdquo;, &ldquo;JSON&rdquo;, &ldquo;Invoice&rdquo;, or &ldquo;TypeScript&rdquo;.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {unifiedSearchResults.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleGlobalSearchAction(item.actionTarget, item.sectionType)}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[#F0F7FF] transition-colors"
                            >
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                                <div className="text-xs text-slate-500">
                                  {item.sectionType} · {item.categoryLabel}
                                </div>
                              </div>
                              <span className="text-xs font-medium text-[#0284C7] whitespace-nowrap ml-3">
                                Open →
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Shortcuts */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#popular-categories"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0284C7] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0369A1] transition-colors whitespace-nowrap"
                  >
                    Explore Services
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveAiModule(YARA_AI_MODULES[0])}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4 text-[#0284C7]" />
                    Launch Yara AI Assistant
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenTool(PLATFORM_TOOLS[5])}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
                  >
                    Try Word & Text Analyzer
                  </button>
                </div>
              </div>

              {/* Right Column: Subtle Professional SaaS Ecosystem Illustration */}
              <div className="lg:col-span-5">
                <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div>
                      <div className="text-xs text-slate-500">Unified Platform Architecture</div>
                      <div
                        className="text-sm font-semibold text-slate-900 mt-0.5"
                        style={{ fontFamily: 'var(--font-display), sans-serif' }}
                      >
                        Falylio Yara Workspace Hub
                      </div>
                    </div>
                    <span className="text-xs text-[#0284C7] font-medium tabular-nums">12 Integrated Verticals</span>
                  </div>

                  {/* Clean SVG Architectural Diagram */}
                  <svg
                    viewBox="0 0 420 220"
                    className="w-full h-auto rounded-lg bg-[#F8FAFC] border border-slate-200/60 p-3"
                    role="img"
                    aria-label="Falylio Yara Unified Digital Platform Ecosystem Illustration"
                  >
                    <line x1="0" y1="55" x2="420" y2="55" stroke="#E2E8F0" strokeDasharray="4 4" />
                    <line x1="0" y1="110" x2="420" y2="110" stroke="#E2E8F0" strokeDasharray="4 4" />
                    <line x1="0" y1="165" x2="420" y2="165" stroke="#E2E8F0" strokeDasharray="4 4" />

                    <path d="M125 60 L210 110 L295 60" stroke="#93C5FD" strokeWidth="2" fill="none" />
                    <path d="M125 160 L210 110 L295 160" stroke="#93C5FD" strokeWidth="2" fill="none" />

                    <rect x="24" y="28" width="120" height="58" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
                    <text x="38" y="52" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                      17 Tool Categories
                    </text>
                    <text x="38" y="68" fill="#64748B" fontSize="9.5" fontFamily="sans-serif">
                      PDF · JSON · Color · Math
                    </text>

                    <rect x="276" y="28" width="120" height="58" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
                    <text x="290" y="52" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                      Yara AI Center
                    </text>
                    <text x="290" y="68" fill="#64748B" fontSize="9.5" fontFamily="sans-serif">
                      Write · Code · Translate
                    </text>

                    <rect x="24" y="134" width="120" height="58" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
                    <text x="38" y="158" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                      Education & MCQs
                    </text>
                    <text x="38" y="174" fill="#64748B" fontSize="9.5" fontFamily="sans-serif">
                      6 Tracks · Live Quizzes
                    </text>

                    <rect x="276" y="134" width="120" height="58" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
                    <text x="290" y="158" fill="#0F172A" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                      Digital Marketplace
                    </text>
                    <text x="290" y="174" fill="#64748B" fontSize="9.5" fontFamily="sans-serif">
                      Templates · Stock Media
                    </text>

                    <circle cx="210" cy="110" r="34" fill="#0F172A" />
                    <text x="210" y="107" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700" fontFamily="sans-serif">
                      FY HUB
                    </text>
                    <text x="210" y="121" textAnchor="middle" fill="#38BDF8" fontSize="8.5" fontWeight="500" fontFamily="sans-serif">
                      UNIFIED
                    </text>
                  </svg>

                  {/* Quick Interactive Launchers */}
                  <div className="mt-4 grid grid-cols-3 gap-2 pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenTool(PLATFORM_TOOLS[7])}
                      className="rounded-lg bg-[#F8FAFC] hover:bg-[#F0F7FF] p-2.5 text-left transition-colors"
                    >
                      <div className="text-xs font-semibold text-slate-900">JSON Validator</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Developer Utility</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenTool(PLATFORM_TOOLS[14])}
                      className="rounded-lg bg-[#F8FAFC] hover:bg-[#F0F7FF] p-2.5 text-left transition-colors"
                    >
                      <div className="text-xs font-semibold text-slate-900">Invoice Builder</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Business Suite</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCourseQuiz(EDUCATION_COURSES[1])}
                      className="rounded-lg bg-[#F8FAFC] hover:bg-[#F0F7FF] p-2.5 text-left transition-colors"
                    >
                      <div className="text-xs font-semibold text-slate-900">TypeScript Quiz</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Interactive MCQ</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            C. POPULAR CATEGORIES
           ===================================================================== */}
        <section id="popular-categories" className="py-14 lg:py-16 border-b border-slate-200/80 bg-white">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-[#0284C7]">01. Platform Ecosystem</div>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Popular Categories
                </h2>
              </div>
              <p className="text-sm text-slate-600 max-w-md">
                Navigate directly to any core vertical. Every workspace shares a consistent, clutter-free interface.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {POPULAR_CATEGORIES.map((cat) => (
                <a
                  key={cat.id}
                  href={cat.sectionAnchor}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-[#F8FAFC]/60 p-5 hover:border-[#0284C7] hover:bg-white transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0284C7]">
                        {getIconComponent(cat.iconName, 'h-5 w-5 text-[#0284C7]')}
                      </div>
                      <span className="text-xs text-slate-500 tabular-nums">{cat.itemCount}</span>
                    </div>
                    <h3
                      className="text-base font-semibold text-slate-900 group-hover:text-[#0284C7] transition-colors"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-slate-700 group-hover:text-[#0284C7]">
                    <span>Explore Category</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            D. FEATURED TOOLS & ALL 17 CATEGORIES DIRECTORY
           ===================================================================== */}
        <section id="all-tools" className="py-14 lg:py-16 border-b border-slate-200/80 bg-[#F8FAFC]">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-[#0284C7]">02. Online Utilities Directory</div>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Featured Tools & Complete 17-Category Directory
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Click any utility card below to open its interactive browser workbench.
                </p>
              </div>

              {/* Interactive Segmented Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1 self-start">
                {(
                  [
                    ['popular', 'Popular Tools'],
                    ['recent', 'Recently Added'],
                    ['recommended', 'Recommended'],
                    ['free', 'Free Tools'],
                    ['all', 'All Tools'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedToolTab(key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      selectedToolTab === key
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector & Tool Search Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="search"
                    aria-label="Filter tools by name or category"
                    value={toolSearchQuery}
                    onChange={(e) => setToolSearchQuery(e.target.value)}
                    placeholder="Filter tools by keyword (e.g., PDF, JSON, Color, Password, Invoice)..."
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
                  />
                </div>
                <div className="text-xs text-slate-500 tabular-nums">
                  Showing {filteredTools.length} of {PLATFORM_TOOLS.length} utilities across 17 categories
                </div>
              </div>

              {/* All 17 Categories Interactive Filter Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedToolCategory('All');
                    setSelectedToolTab('all');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedToolCategory === 'All'
                      ? 'bg-[#0F172A] text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All 17 Categories
                </button>
                {ALL_TOOL_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedToolCategory(category);
                      setSelectedToolTab('all');
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedToolCategory === category
                        ? 'bg-[#0284C7] text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tools Grid */}
            {filteredTools.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3">
                <p className="text-sm text-slate-600">No tools matched your current category and search filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedToolCategory('All');
                    setSelectedToolTab('all');
                    setToolSearchQuery('');
                  }}
                  className="rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-medium text-white"
                >
                  Reset Tool Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTools.map((tool) => {
                  const isFav = favoriteIds.includes(tool.id);
                  return (
                    <div
                      key={tool.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 hover:border-[#0284C7] transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{tool.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{tool.usageCount}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleFavorite(tool.id)}
                            aria-label={`${isFav ? 'Remove' : 'Save'} ${tool.name} to favorites`}
                            className={`p-1.5 rounded-md border transition-colors ${
                              isFav
                                ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0284C7]'
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0F7FF]">
                            {getIconComponent(tool.iconName, 'h-5 w-5 text-[#0284C7]')}
                          </div>
                          <div>
                            <h3
                              className="text-base font-semibold text-slate-900"
                              style={{ fontFamily: 'var(--font-display), sans-serif' }}
                            >
                              {tool.name}
                            </h3>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{tool.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">100% Free Browser Utility</span>
                        <button
                          type="button"
                          onClick={() => handleOpenTool(tool)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                        >
                          Open Tool
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================================
            E. YARA AI CENTER
           ===================================================================== */}
        <section id="ai-center" className="py-14 lg:py-16 border-b border-slate-200/80 bg-white">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-[#0284C7]">03. Yara AI Center</div>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Dedicated AI Assistants & Workspaces
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md">
                Connected to our server-side `/api/ai` route with transparent API connection status verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {YARA_AI_MODULES.map((mod) => (
                <div
                  key={mod.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-[#F0F7FF]/40 p-4 hover:border-[#0284C7] hover:bg-white transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200/80">
                        {getIconComponent(mod.iconName, 'h-4 w-4 text-[#0284C7]')}
                      </div>
                      <span className="text-[11px] text-slate-500">{mod.category}</span>
                    </div>
                    <h3
                      className="text-sm font-semibold text-slate-900"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      {mod.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{mod.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveAiModule(mod)}
                    className="mt-4 w-full rounded-lg border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-900 hover:border-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-colors whitespace-nowrap"
                  >
                    Launch Assistant
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            H. MARKETPLACE
           ===================================================================== */}
        <section id="marketplace" className="py-14 lg:py-16 border-b border-slate-200/80 bg-[#F8FAFC]">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-[#0284C7]">04. Digital Marketplace</div>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Templates, Graphics, E-Books, Software & Creator Services
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1">
                {['All', 'Templates', 'Graphics', 'E-books', 'Software', 'Creator Services'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMarketplaceFilter(cat)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      marketplaceFilter === cat
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {selectedProductNotice && (
              <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-[#F0F9FF] px-4 py-3 text-xs text-slate-800">
                <span>{selectedProductNotice}</span>
                <button
                  type="button"
                  onClick={() => setSelectedProductNotice(null)}
                  className="font-semibold text-[#0284C7] hover:underline ml-4"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {MARKETPLACE_PRODUCTS.filter(
                (p) => marketplaceFilter === 'All' || p.category === marketplaceFilter
              ).map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {product.category} · By {product.seller}
                      </span>
                      <span className="tabular-nums font-medium text-slate-700">
                        ★ {product.rating} ({product.reviewsCount})
                      </span>
                    </div>
                    <h3
                      className="text-base font-semibold text-slate-900"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
                    <div className="pt-1 text-xs text-slate-500">
                      Deliverables: {product.deliverables.join(' · ')}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900 tabular-nums">${product.price}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedProductNotice(
                          `Selected "${product.title}" ($${product.price}). Live payment checkout activates once merchant payment credentials & Supabase order tables are connected in Phase 6.`
                        )
                      }
                      className="rounded-lg bg-[#0F172A] px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      Inspect Product & License
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            I. EDUCATION & COURSES (With Interactive MCQ Quiz System)
           ===================================================================== */}
        <section id="education" className="py-14 lg:py-16 border-b border-slate-200/80 bg-white">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-[#0284C7]">05. Education & Structured Learning</div>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Featured Courses, Learning Tracks & Interactive MCQs
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                {[
                  'All',
                  'Computer Learning',
                  'Programming',
                  'AI Learning',
                  'Graphic Design',
                  'Language Learning',
                  'Islamic Studies',
                ].map((track) => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => setCourseFilter(track)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      courseFilter === track
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {EDUCATION_COURSES.filter((c) => courseFilter === 'All' || c.track === courseFilter).map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC]/70 p-5 hover:bg-white hover:border-[#0284C7] transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{course.track}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.level}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{course.duration}</span>
                    </div>
                    <h3
                      className="text-base font-semibold text-slate-900"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
                    <p className="text-xs text-slate-500 pt-1 tabular-nums">
                      Instructor: {course.instructor} · {course.lessonsCount} Structured Lessons
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#0284C7] tabular-nums">
                      {course.quizQuestions.length} Practice MCQs Ready
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveCourseQuiz(course)}
                      className="rounded-lg bg-[#0F172A] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap"
                    >
                      Start Lesson & MCQ Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            G. APPS & SOFTWARE + F. GAMING ZONE (Balanced Side-by-Side Split)
           ===================================================================== */}
        <section id="apps-software" className="py-14 lg:py-16 border-b border-slate-200/80 bg-[#F8FAFC]">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 7 Columns: Apps & Software Directory */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <div className="text-xs font-medium text-[#0284C7]">06. Verified Software Directory</div>
                  <h2
                    className="mt-1 text-2xl font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Apps, Desktop Utilities & Open-Source Releases
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Android Applications, Windows Software, Open-source packages, and Browser Extensions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SOFTWARE_APPS.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="space-y-2">
                        <div className="text-xs text-slate-500 tabular-nums">
                          {app.platform} · {app.size}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">{app.name}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{app.description}</p>
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 tabular-nums">{app.version} · ★ {app.rating}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAccountModalTab('architecture');
                            setAccountModalOpen(true);
                          }}
                          className="font-semibold text-[#0284C7] hover:underline"
                        >
                          Specs & APK Info
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 5 Columns: Calm, Balanced Gaming Zone (Cognitive & Browser Puzzles) */}
              <div id="gaming-zone" className="lg:col-span-5 space-y-5">
                <div>
                  <div className="text-xs font-medium text-[#0284C7]">07. Mindful Break & Logic Zone</div>
                  <h2
                    className="mt-1 text-2xl font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Browser Logic, Word & Casual Puzzles
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Lightweight, distraction-free browser puzzles and cognitive games playable directly in your browser.
                  </p>
                </div>

                <div className="space-y-3">
                  {BROWSER_GAMES.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-[#0284C7] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">
                          {game.category} · {game.difficulty}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">{game.title}</h3>
                        <p className="text-xs text-slate-600">{game.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveGame(game)}
                        className="rounded-lg bg-[#0F172A] px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                      >
                        Play in Browser
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            J. STOCK MEDIA LIBRARY
           ===================================================================== */}
        <section id="stock-media" className="py-14 lg:py-16 border-b border-slate-200/80 bg-white">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-[#0284C7]">08. Royalty-Free Stock Media</div>
                <h2
                  className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Photos, Vectors, Illustrations, Icons, Video, Audio & Fonts
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                {['All', 'Photos', 'Vectors', 'Illustrations', 'Wallpapers', 'Icons', 'Videos', 'Sound Effects', 'Fonts'].map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMediaFilter(type)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                        mediaFilter === type
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STOCK_MEDIA_ITEMS.filter((m) => mediaFilter === 'All' || m.type === mediaFilter).map((media) => (
                <div
                  key={media.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4"
                >
                  <div>
                    <div
                      className="h-24 w-full rounded-lg border border-slate-200/60 flex items-end justify-between p-3"
                      style={{
                        background: `linear-gradient(135deg, ${media.palette[0]} 0%, ${media.palette[1]} 100%)`,
                      }}
                    >
                      <span className="text-[11px] font-medium text-white/90">{media.type}</span>
                      <div className="flex gap-1">
                        {media.palette.map((hex) => (
                          <span
                            key={hex}
                            className="h-3.5 w-3.5 rounded-full border border-white/50"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-slate-900">{media.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 tabular-nums">
                      {media.resolutionOrFormat} · By {media.author}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{media.license}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenTool(PLATFORM_TOOLS[12])}
                      className="font-semibold text-[#0284C7] hover:underline"
                    >
                      Inspect Palette
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            K. SOCIAL MEDIA STUDIO + L. WEBSITE & APP BUILDER + M. BUSINESS & PRODUCTIVITY
           ===================================================================== */}
        <section id="social-studio" className="py-14 lg:py-16 border-b border-slate-200/80 bg-[#F8FAFC]">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Row 1: Social Media Studio & Website Builder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* K. Social Media Studio */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <div>
                  <div className="text-xs font-medium text-[#0284C7]">09. Social Media Studio</div>
                  <h2
                    className="mt-1 text-xl font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Content Creation & Editorial Planning Tools
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Generate captions, hashtag sets, channel bios, and thumbnail aspect-ratio layouts.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    'Thumbnail Maker',
                    'Post Designer',
                    'Caption Generator',
                    'Hashtag Generator',
                    'Bio Generator',
                    'Content Planner',
                  ].map((studioTool) => (
                    <button
                      key={studioTool}
                      type="button"
                      onClick={() =>
                        handleOpenTool({
                          id: `social-${studioTool}`,
                          name: `Social Studio: ${studioTool}`,
                          slug: 'social-generator',
                          category: 'Writing Tools',
                          description: `Interactive ${studioTool} workspace for clean social publishing.`,
                          iconName: 'Share2',
                          tags: ['popular', 'free'],
                          workbenchMode: 'social-generator',
                          usageCount: '9.1k monthly uses',
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 text-left hover:border-[#0284C7] hover:bg-[#F0F7FF] transition-colors"
                    >
                      <div className="text-xs font-semibold text-slate-900">{studioTool}</div>
                      <div className="mt-0.5 text-[11px] text-[#0284C7]">Open Studio →</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* L. Website & App Builder */}
              <div id="web-builder" className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <div>
                  <div className="text-xs font-medium text-[#0284C7]">10. Website & App Builder</div>
                  <h2
                    className="mt-1 text-xl font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Templates, Portfolio Builder & Live HTML Preview
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Test HTML5 snippets in real time, inspect responsive landing page blocks, and generate SEO meta tags.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    'Website Templates',
                    'Landing Page Resources',
                    'Portfolio Builder',
                    'Live HTML Preview',
                    'Web Dev Tools',
                    'Capacitor APK Guide',
                  ].map((builderItem) => (
                    <button
                      key={builderItem}
                      type="button"
                      onClick={() => handleOpenTool(PLATFORM_TOOLS[8])}
                      className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 text-left hover:border-[#0284C7] hover:bg-[#F0F7FF] transition-colors"
                    >
                      <div className="text-xs font-semibold text-slate-900">{builderItem}</div>
                      <div className="mt-0.5 text-[11px] text-[#0284C7]">Launch Sandbox →</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: M. Business & Productivity Suite (with Live Interactive Task Planner & Invoice Launcher) */}
            <div id="business-productivity" className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <div className="text-xs font-medium text-[#0284C7]">11. Business & Productivity Suite</div>
                    <h2
                      className="mt-1 text-2xl font-bold text-slate-900"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      CV Maker, Invoice Generator, Financial Calculators & Task Planner
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      Practical office tools designed for freelancers, students, and growing teams.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Invoice & Tax Generator', toolIdx: 14 },
                      { label: 'CV & Resume Structure', toolIdx: 4 },
                      { label: 'Compound & ROI Calculator', toolIdx: 10 },
                      { label: 'Project Date Estimator', toolIdx: 15 },
                      { label: 'Brand Color Token Kit', toolIdx: 12 },
                      { label: 'AI Business Strategist', isAi: true },
                    ].map((bItem) => (
                      <button
                        key={bItem.label}
                        type="button"
                        onClick={() => {
                          if (bItem.isAi) {
                            setActiveAiModule(YARA_AI_MODULES[6]);
                          } else {
                            handleOpenTool(PLATFORM_TOOLS[bItem.toolIdx!]);
                          }
                        }}
                        className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3.5 text-left hover:border-[#0284C7] transition-colors"
                      >
                        <div className="text-xs font-semibold text-slate-900">{bItem.label}</div>
                        <div className="mt-1 text-[11px] text-slate-500">Launch Tool →</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Interactive Task Planner Widget */}
                <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Quick Workspace Task Planner</h3>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {tasks.filter((t) => t.done).length}/{tasks.length} Completed
                    </span>
                  </div>

                  <form onSubmit={handleAddTask} className="flex gap-2">
                    <input
                      type="text"
                      aria-label="New workspace task"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Add a milestone or daily task..."
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap"
                    >
                      Add Task
                    </button>
                  </form>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {tasks.map((task) => (
                      <label
                        key={task.id}
                        className="flex items-center gap-2.5 rounded-md bg-white px-3 py-2 text-xs text-slate-800 border border-slate-200/70 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() =>
                            setTasks(tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
                          }
                          className="rounded border-slate-300 text-[#0284C7]"
                        />
                        <span className={task.done ? 'line-through text-slate-400' : 'text-slate-800'}>
                          {task.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            N. ENTERTAINMENT & MEDIA + O. NEWS & COMMUNITY
           ===================================================================== */}
        <section id="community-news" className="py-14 lg:py-16 border-b border-slate-200/80 bg-white">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-12">
            {/* N. Entertainment & Educational Media */}
            <div className="space-y-5">
              <div>
                <div className="text-xs font-medium text-[#0284C7]">12. Mindful Entertainment & Cultural Media</div>
                <h2
                  className="mt-1 text-2xl font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Educational Videos, Documentaries, Short Films & Multilingual Podcasts
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'The Architecture of Submarine Fiber Optic Cables',
                    type: 'Documentary · 28 mins',
                    lang: 'English / Arabic Subtitles',
                    desc: 'How transoceanic optical networks carry 99% of global internet traffic across the seabed.',
                  },
                  {
                    title: 'Golden Age of Optics: From Ibn al-Haytham to Modern Lenses',
                    type: 'Educational Video · 19 mins',
                    lang: 'Multilingual Subtitles (EN · AR · UR)',
                    desc: 'Tracing the experimental method and camera obscura discoveries that shaped modern physics.',
                  },
                  {
                    title: 'Calm Engineering Podcast: Designing Software That Lasts',
                    type: 'Audio Podcast · Ep. 42 · 36 mins',
                    lang: 'Full Transcript & SRT Included',
                    desc: 'Conversations with principal engineers on simplicity, testing, and sustainable software.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-5"
                  >
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500">
                        {item.type} · {item.lang}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Curated Stream & SRT</span>
                      <button
                        type="button"
                        onClick={() => setActiveAiModule(YARA_AI_MODULES[9])}
                        className="font-semibold text-[#0284C7] hover:underline"
                      >
                        Inspect Transcript & Subtitles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* O. News & Community */}
            <div className="space-y-5 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-[#0284C7]">13. News, Tutorials & Community Forum</div>
                  <h2
                    className="mt-1 text-2xl font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Technology News, AI Updates, Tutorials & Q&A Discussions
                  </h2>
                </div>

                <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
                  {['All', 'Technology News', 'AI News', 'Tutorials', 'App Reviews'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCommunityFilter(cat)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                        communityFilter === cat
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMMUNITY_POSTS.filter((p) => communityFilter === 'All' || p.category === communityFilter).map(
                  (post) => (
                    <article
                      key={post.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{post.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.publishedAt}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">{post.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{post.summary}</p>
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>By {post.author}</span>
                        <span className="tabular-nums">{post.repliesCount} Community Replies</span>
                      </div>
                    </article>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            P. WHY CHOOSE FALYLIO YARA?
           ===================================================================== */}
        <section id="about-platform" className="py-14 lg:py-16 border-b border-slate-200/80 bg-[#F0F7FF]">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl">
              <div className="text-xs font-medium text-[#0284C7]">14. Platform Principles</div>
              <h2
                className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                Why Choose Falylio Yara?
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Designed from the ground up as a trustworthy, welcoming SaaS platform for beginners and professionals alike.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  title: 'Easy to Use',
                  desc: 'Clean visual hierarchy, generous whitespace, and plain human labels with zero clutter.',
                },
                {
                  title: 'Multiple Services',
                  desc: '17 tool categories, 10 AI assistants, courses, software, and stock media under one roof.',
                },
                {
                  title: 'Organized Resources',
                  desc: 'Instant global search and structured category filtering find any tool in under two seconds.',
                },
                {
                  title: 'Responsive Experience',
                  desc: 'Works smoothly across desktop monitors, laptops, tablets, and Android phones (Capacitor-ready).',
                },
                {
                  title: 'Secure User Accounts',
                  desc: 'Server-side API isolation and Supabase Row-Level Security architecture protect user privacy.',
                },
              ].map((benefit, index) => (
                <div key={benefit.title} className="rounded-xl border border-slate-200/90 bg-white p-5 space-y-2">
                  <div className="text-xs font-semibold text-[#0284C7] tabular-nums">0{index + 1}.</div>
                  <h3
                    className="text-sm font-semibold text-slate-900"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          Q. FOOTER & INTERACTIVE CONTACT
         ===================================================================== */}
      <footer id="contact-footer" className="bg-[#0F172A] text-slate-300 py-14">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Brand & About Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <FyMonogram className="h-8 w-8" />
                <div>
                  <div
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    Falylio Yara
                  </div>
                  <div className="text-xs text-sky-400">Dream • Create • Grow</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Falylio Yara is an All-in-One Digital Platform uniting online utilities, Yara AI workspaces, structured education, software directories, stock media, and digital marketplace services.
              </p>
              <div className="text-xs text-slate-400 space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setAccountModalTab('architecture');
                    setAccountModalOpen(true);
                  }}
                  className="text-sky-400 hover:underline"
                >
                  View Phase 1–8 Architecture Status
                </button>
              </div>
            </div>

            {/* Quick Links Columns */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-6 text-xs">
              <div className="space-y-2.5">
                <div className="font-semibold text-white">Platform Directory</div>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#popular-categories" className="hover:text-white">Popular Categories</a></li>
                  <li><a href="#all-tools" className="hover:text-white">All 17 Tool Categories</a></li>
                  <li><a href="#ai-center" className="hover:text-white">Yara AI Center</a></li>
                  <li><a href="#marketplace" className="hover:text-white">Digital Marketplace</a></li>
                  <li><a href="#education" className="hover:text-white">Education & Courses</a></li>
                  <li><a href="#stock-media" className="hover:text-white">Stock Media Library</a></li>
                </ul>
              </div>
              <div className="space-y-2.5">
                <div className="font-semibold text-white">Support & Governance</div>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#about-platform" className="hover:text-white">About Us</a></li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountModalTab('auth');
                        setAccountModalOpen(true);
                      }}
                      className="hover:text-white"
                    >
                      User Account & Security
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountModalTab('admin');
                        setAccountModalOpen(true);
                      }}
                      className="hover:text-white"
                    >
                      Admin Console
                    </button>
                  </li>
                  <li><span>Help Center & Documentation</span></li>
                  <li><span>Privacy Policy & Terms</span></li>
                </ul>
              </div>
            </div>

            {/* Interactive Contact & Inquiry Box */}
            <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <div className="text-sm font-semibold text-white">Contact & Partnership Inquiry</div>
              {contactSubmitted ? (
                <div className="rounded-lg border border-sky-800 bg-sky-950/60 p-4 text-xs text-sky-200 space-y-2">
                  <p className="font-semibold">Thank you, {contactName}.</p>
                  <p>Your message has been logged in the client session. Connect Supabase database tables in Phase 7 to persist support tickets.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactName('');
                      setContactEmail('');
                      setContactMessage('');
                    }}
                    className="text-sky-400 underline"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      aria-label="Your Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your Name"
                      className="rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
                    />
                    <input
                      type="email"
                      required
                      aria-label="Your Email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    aria-label="Your Message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="How can the Falylio Yara team help you?"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#0284C7] py-2 text-xs font-semibold text-white hover:bg-[#0369A1] transition-colors"
                  >
                    Send Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>© {new Date().getFullYear()} Falylio Yara. All rights reserved. Dream • Create • Grow.</div>
            <div>Built with Next.js, TypeScript, Tailwind CSS · Supabase & Capacitor APK Ready</div>
          </div>
        </div>
      </footer>

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
      />
    </div>
  );
}

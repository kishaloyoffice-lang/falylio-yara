export type ToolCategory =
  | 'Image Tools'
  | 'Video Tools'
  | 'Audio Tools'
  | 'PDF Tools'
  | 'Document Tools'
  | 'Text Tools'
  | 'Writing Tools'
  | 'Developer Tools'
  | 'Webmaster Tools'
  | 'File Tools'
  | 'Mathematics Tools'
  | 'Science Tools'
  | 'Color Tools'
  | 'Design Tools'
  | 'Office Tools'
  | 'Date and Time Tools'
  | 'Privacy and Security Tools';

export const ALL_TOOL_CATEGORIES: ToolCategory[] = [
  'Image Tools',
  'Video Tools',
  'Audio Tools',
  'PDF Tools',
  'Document Tools',
  'Text Tools',
  'Writing Tools',
  'Developer Tools',
  'Webmaster Tools',
  'File Tools',
  'Mathematics Tools',
  'Science Tools',
  'Color Tools',
  'Design Tools',
  'Office Tools',
  'Date and Time Tools',
  'Privacy and Security Tools',
];

export type WorkbenchMode =
  | 'text-analyzer'
  | 'json-formatter'
  | 'password-generator'
  | 'color-converter'
  | 'invoice-calculator'
  | 'unit-math-solver'
  | 'html-preview'
  | 'social-generator'
  | 'date-calculator'
  | 'file-inspector';

export interface PlatformTool {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  iconName: string;
  tags: ('popular' | 'recent' | 'recommended' | 'free')[];
  workbenchMode: WorkbenchMode;
  usageCount: string;
}

export interface PopularCategoryCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
  itemCount: string;
  sectionAnchor: string;
  viewKey: string;
}

export interface YaraAiModule {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  systemPrompt: string;
  placeholderInput: string;
  samplePrompt: string;
  requiresIntegrationNote?: string;
}

export interface BrowserGameItem {
  id: string;
  title: string;
  category: 'Browser Games' | 'Puzzle Games' | 'Casual Games' | 'Strategy & Logic';
  description: string;
  playMode: '2048-grid' | 'memory-match' | 'word-scramble' | 'sudoku-mini';
  playersCount: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Relaxed';
}

export interface SoftwareAppItem {
  id: string;
  name: string;
  platform: 'Android Applications' | 'Windows Software' | 'Open-source Software' | 'Browser Extensions';
  version: string;
  size: string;
  license: string;
  rating: string;
  description: string;
  isLatest?: boolean;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  category: 'Templates' | 'Graphics' | 'E-books' | 'Software' | 'Creator Services';
  seller: string;
  sellerRole: string;
  price: number;
  rating: string;
  reviewsCount: number;
  description: string;
  deliverables: string[];
}

export interface CourseItem {
  id: string;
  title: string;
  track:
    | 'Computer Learning'
    | 'Programming'
    | 'AI Learning'
    | 'Graphic Design'
    | 'Language Learning'
    | 'Islamic Studies';
  instructor: string;
  lessonsCount: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'All Levels';
  description: string;
  quizQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface StockMediaItem {
  id: string;
  title: string;
  type: 'Photos' | 'Illustrations' | 'Vectors' | 'Wallpapers' | 'Icons' | 'Videos' | 'Sound Effects' | 'Fonts';
  resolutionOrFormat: string;
  license: string;
  palette: [string, string, string];
  author: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  category: 'Technology News' | 'AI News' | 'Gaming News' | 'App Reviews' | 'Tutorials' | 'Discussion Forum' | 'Questions and Answers';
  author: string;
  publishedAt: string;
  readTime: string;
  repliesCount: number;
  summary: string;
}

export const POPULAR_CATEGORIES: PopularCategoryCard[] = [
  {
    id: 'cat-ai',
    title: 'Yara AI Center',
    description: 'Intelligent writing, translation, research, coding, and document summarization workspaces.',
    iconName: 'Sparkles',
    itemCount: '10 AI Assistants',
    sectionAnchor: '#ai-center',
    viewKey: 'ai',
  },
  {
    id: 'cat-tools',
    title: 'All Online Tools',
    description: 'Instant browser-based utilities across 17 specialized categories with zero installation.',
    iconName: 'Wrench',
    itemCount: '34+ Utilities',
    sectionAnchor: '#all-tools',
    viewKey: 'tools',
  },
  {
    id: 'cat-education',
    title: 'Education & Courses',
    description: 'Structured learning tracks, interactive lessons, and instant self-assessment MCQs.',
    iconName: 'GraduationCap',
    itemCount: '80+ Lessons',
    sectionAnchor: '#education',
    viewKey: 'education',
  },
  {
    id: 'cat-marketplace',
    title: 'Digital Marketplace',
    description: 'Verified UI kits, templates, e-books, vector graphics, and creator services.',
    iconName: 'ShoppingBag',
    itemCount: '120+ Assets',
    sectionAnchor: '#marketplace',
    viewKey: 'marketplace',
  },
  {
    id: 'cat-apps',
    title: 'Apps & Software',
    description: 'Curated Android packages, Windows utilities, open-source releases, and extensions.',
    iconName: 'AppWindow',
    itemCount: '45+ Releases',
    sectionAnchor: '#apps-software',
    viewKey: 'home',
  },
  {
    id: 'cat-business',
    title: 'Business & Productivity',
    description: 'CV builders, invoice calculators, financial estimators, and structured task planners.',
    iconName: 'Briefcase',
    itemCount: '14 Workbenches',
    sectionAnchor: '#business-productivity',
    viewKey: 'home',
  },
  {
    id: 'cat-media',
    title: 'Stock Media Library',
    description: 'Royalty-free vectors, illustrations, icons, wallpapers, typography, and audio assets.',
    iconName: 'Image',
    itemCount: '250+ Media Files',
    sectionAnchor: '#stock-media',
    viewKey: 'home',
  },
  {
    id: 'cat-social',
    title: 'Social Media Studio',
    description: 'Post layout designers, caption generators, hashtag researchers, and content calendars.',
    iconName: 'Share2',
    itemCount: '8 Studio Tools',
    sectionAnchor: '#social-studio',
    viewKey: 'home',
  },
];

export const PLATFORM_TOOLS: PlatformTool[] = [
  {
    id: 'tool-img-compress',
    name: 'Smart Image Optimizer & Resizer',
    slug: 'image-optimizer',
    category: 'Image Tools',
    description: 'Calculate aspect ratios, target file budgets, and inspect resolution scaling for web assets.',
    iconName: 'Image',
    tags: ['popular', 'free', 'recommended'],
    workbenchMode: 'file-inspector',
    usageCount: '14.2k monthly uses',
  },
  {
    id: 'tool-video-bitrate',
    name: 'Video Bitrate & Frame Calculator',
    slug: 'video-bitrate-calculator',
    category: 'Video Tools',
    description: 'Compute exact storage sizes and streaming bitrates for 1080p, 4K, and 60fps video exports.',
    iconName: 'Video',
    tags: ['free', 'recent'],
    workbenchMode: 'unit-math-solver',
    usageCount: '4.8k monthly uses',
  },
  {
    id: 'tool-audio-tempo',
    name: 'Audio Tempo & Frequency Reference',
    slug: 'audio-tempo-calculator',
    category: 'Audio Tools',
    description: 'Convert BPM to millisecond delay intervals and calculate sample storage requirements.',
    iconName: 'Music',
    tags: ['free'],
    workbenchMode: 'unit-math-solver',
    usageCount: '3.1k monthly uses',
  },
  {
    id: 'tool-pdf-metadata',
    name: 'PDF Structure & Page Estimator',
    slug: 'pdf-page-estimator',
    category: 'PDF Tools',
    description: 'Estimate print signatures, word-to-page density, and document layout specifications.',
    iconName: 'FileText',
    tags: ['popular', 'recommended', 'free'],
    workbenchMode: 'text-analyzer',
    usageCount: '19.5k monthly uses',
  },
  {
    id: 'tool-doc-formatter',
    name: 'Document Clean-Up & Markdown Formatter',
    slug: 'document-markdown-formatter',
    category: 'Document Tools',
    description: 'Strip redundant line breaks, normalize whitespace, and convert plain notes into structured sections.',
    iconName: 'FileCheck',
    tags: ['recommended', 'free'],
    workbenchMode: 'text-analyzer',
    usageCount: '8.7k monthly uses',
  },
  {
    id: 'tool-text-counter',
    name: 'Precision Word, Character & Reading Analyzer',
    slug: 'word-character-counter',
    category: 'Text Tools',
    description: 'Analyze word count, character density, sentence length, and speaking/reading time in real time.',
    iconName: 'AlignLeft',
    tags: ['popular', 'recommended', 'free'],
    workbenchMode: 'text-analyzer',
    usageCount: '28.4k monthly uses',
  },
  {
    id: 'tool-writing-clarity',
    name: 'Editorial Readability & Tone Checker',
    slug: 'editorial-readability-checker',
    category: 'Writing Tools',
    description: 'Evaluate paragraph pacing, vocabulary complexity, and active-voice structure for essays and articles.',
    iconName: 'PenTool',
    tags: ['popular', 'recent', 'free'],
    workbenchMode: 'text-analyzer',
    usageCount: '11.9k monthly uses',
  },
  {
    id: 'tool-dev-json',
    name: 'JSON Validator, Minifier & Schema Inspector',
    slug: 'json-validator-formatter',
    category: 'Developer Tools',
    description: 'Validate, pretty-print, or minify JSON payloads with instant syntax error diagnostics.',
    iconName: 'Code2',
    tags: ['popular', 'recommended', 'free'],
    workbenchMode: 'json-formatter',
    usageCount: '31.0k monthly uses',
  },
  {
    id: 'tool-web-meta',
    name: 'SEO Meta Tag & OpenGraph Generator',
    slug: 'seo-meta-generator',
    category: 'Webmaster Tools',
    description: 'Generate compliant HTML head metadata, canonical tags, and OpenGraph social cards.',
    iconName: 'Globe',
    tags: ['recent', 'recommended', 'free'],
    workbenchMode: 'html-preview',
    usageCount: '9.4k monthly uses',
  },
  {
    id: 'tool-file-checksum',
    name: 'MIME Type & Payload Size Inspector',
    slug: 'file-payload-inspector',
    category: 'File Tools',
    description: 'Calculate byte sizes, base64 overhead percentages, and transfer durations across network speeds.',
    iconName: 'FolderKanban',
    tags: ['free'],
    workbenchMode: 'file-inspector',
    usageCount: '5.2k monthly uses',
  },
  {
    id: 'tool-math-solver',
    name: 'Scientific Percentage & Compound Calculator',
    slug: 'compound-math-calculator',
    category: 'Mathematics Tools',
    description: 'Compute compound growth, percentage deltas, standard deviation, and ratio proportions.',
    iconName: 'Calculator',
    tags: ['popular', 'free'],
    workbenchMode: 'unit-math-solver',
    usageCount: '16.3k monthly uses',
  },
  {
    id: 'tool-science-units',
    name: 'SI Unit, Energy & Molar Converter',
    slug: 'science-unit-converter',
    category: 'Science Tools',
    description: 'Convert temperature scales (Kelvin, Celsius, Fahrenheit), pressure, and physical constants.',
    iconName: 'FlaskConical',
    tags: ['recent', 'free'],
    workbenchMode: 'unit-math-solver',
    usageCount: '6.8k monthly uses',
  },
  {
    id: 'tool-color-studio',
    name: 'HEX, RGB & Contrast Accessibility Converter',
    slug: 'color-contrast-converter',
    category: 'Color Tools',
    description: 'Convert between HEX, RGB, and HSL values while verifying WCAG AA/AAA text contrast ratios.',
    iconName: 'Palette',
    tags: ['popular', 'recommended', 'free'],
    workbenchMode: 'color-converter',
    usageCount: '22.1k monthly uses',
  },
  {
    id: 'tool-design-grid',
    name: 'Modular Type Scale & Golden Ratio Calculator',
    slug: 'type-scale-calculator',
    category: 'Design Tools',
    description: 'Generate harmonious UI spacing tokens and responsive CSS clamp() typography scales.',
    iconName: 'LayoutGrid',
    tags: ['recent', 'recommended', 'free'],
    workbenchMode: 'unit-math-solver',
    usageCount: '10.5k monthly uses',
  },
  {
    id: 'tool-office-invoice',
    name: 'Professional Invoice & Tax Estimator',
    slug: 'invoice-tax-calculator',
    category: 'Office Tools',
    description: 'Build itemized service invoices with automated tax rates, discounts, and printable summaries.',
    iconName: 'Receipt',
    tags: ['popular', 'recommended', 'free'],
    workbenchMode: 'invoice-calculator',
    usageCount: '24.7k monthly uses',
  },
  {
    id: 'tool-datetime-diff',
    name: 'Global Timezone & Date Duration Calculator',
    slug: 'date-duration-calculator',
    category: 'Date and Time Tools',
    description: 'Compute exact business days, calendar intervals, and Unix epoch timestamps between dates.',
    iconName: 'CalendarClock',
    tags: ['recent', 'free'],
    workbenchMode: 'date-calculator',
    usageCount: '7.9k monthly uses',
  },
  {
    id: 'tool-security-pass',
    name: 'Cryptographic Password & Entropy Generator',
    slug: 'password-entropy-generator',
    category: 'Privacy and Security Tools',
    description: 'Generate high-entropy passphrases locally in your browser and audit bit-strength security.',
    iconName: 'ShieldCheck',
    tags: ['popular', 'recommended', 'free'],
    workbenchMode: 'password-generator',
    usageCount: '35.6k monthly uses',
  },
];

export const YARA_AI_MODULES: YaraAiModule[] = [
  {
    id: 'ai-chat',
    name: 'AI Chat Assistant',
    category: 'Conversational Intelligence',
    description: 'Multi-purpose reasoning assistant for daily questions, brainstorming, and structured problem solving.',
    iconName: 'MessageSquare',
    systemPrompt: 'You are Yara AI Chat Assistant inside the Falylio Yara platform. Provide clear, helpful, well-structured answers.',
    placeholderInput: 'Ask a question or describe a problem you want to solve...',
    samplePrompt: 'Create a 5-step weekly productivity workflow for a remote software designer.',
  },
  {
    id: 'ai-writing',
    name: 'AI Writing Assistant',
    category: 'Editorial & Copywriting',
    description: 'Draft articles, professional emails, proposals, and clear documentation in seconds.',
    iconName: 'PenTool',
    systemPrompt: 'You are Yara AI Writing Assistant. Write clear, polished, professional prose without clichés.',
    placeholderInput: 'Describe the article, email, or document you need written...',
    samplePrompt: 'Draft a professional project kickoff email to a client outlining milestones and communication cadence.',
  },
  {
    id: 'ai-translation',
    name: 'AI Translation',
    category: 'Multilingual Studio',
    description: 'Context-aware translation across English, Arabic, Urdu, Spanish, French, German, and Mandarin.',
    iconName: 'Languages',
    systemPrompt: 'You are Yara AI Translator. Translate the provided text accurately while preserving tone, and explain key idiomatic choices.',
    placeholderInput: 'Enter text and target language (e.g., Translate to Arabic and French)...',
    samplePrompt: 'Translate into formal Arabic and French: "Welcome to our digital learning ecosystem, where curiosity meets practical skill."',
  },
  {
    id: 'ai-summarizer',
    name: 'AI Summarizer',
    category: 'Knowledge Synthesis',
    description: 'Condense long reports, research articles, and meeting notes into executive bullet points.',
    iconName: 'FileText',
    systemPrompt: 'You are Yara AI Summarizer. Extract key takeaways, action items, and a concise executive summary.',
    placeholderInput: 'Paste long article or meeting transcript to summarize...',
    samplePrompt: 'Summarize the core benefits of modular software architecture in 4 crisp bullet points for non-technical stakeholders.',
  },
  {
    id: 'ai-coding',
    name: 'AI Coding Assistant',
    category: 'Software Engineering',
    description: 'Generate clean TypeScript, Python, SQL, and React components with architectural explanations.',
    iconName: 'Code2',
    systemPrompt: 'You are Yara AI Coding Assistant. Provide clean, well-typed code with brief explanations of edge cases.',
    placeholderInput: 'Describe the function, SQL query, or UI component you want to build...',
    samplePrompt: 'Write a TypeScript debounce hook for React with proper cleanup on unmount.',
  },
  {
    id: 'ai-research',
    name: 'AI Research Assistant',
    category: 'Academic & Market Analysis',
    description: 'Synthesize structured literature overviews, comparative matrices, and study guides.',
    iconName: 'BookOpen',
    systemPrompt: 'You are Yara AI Research Assistant. Structure responses with clear methodology, comparisons, and objective analysis.',
    placeholderInput: 'Enter a research topic or technical comparison question...',
    samplePrompt: 'Compare PostgreSQL relational indexing strategies (B-Tree vs GIN) for high-read SaaS applications.',
  },
  {
    id: 'ai-business',
    name: 'AI Business Assistant',
    category: 'Strategy & Operations',
    description: 'Build business model canvases, Go-To-Market checklists, financial unit assumptions, and SOPs.',
    iconName: 'Briefcase',
    systemPrompt: 'You are Yara AI Business Strategist. Deliver concrete operational frameworks and measurable KPIs.',
    placeholderInput: 'Describe your business concept or operational challenge...',
    samplePrompt: 'Outline a 90-day customer onboarding SOP for a B2B SaaS design agency.',
  },
  {
    id: 'ai-pdf',
    name: 'AI PDF Assistant',
    category: 'Document Q&A',
    description: 'Analyze extracted document text, contracts, and syllabi for instant clause & section answers.',
    iconName: 'FileCheck',
    systemPrompt: 'You are Yara AI Document & PDF Analyst. Answer questions strictly based on the text provided and highlight key clauses.',
    placeholderInput: 'Paste text from your PDF document and ask a specific question...',
    samplePrompt: 'Extract the deliverables and payment schedule from this clause: "Vendor shall deliver Phase 1 wireframes within 14 days (40% fee) and final production code within 30 days (60% fee)."',
  },
  {
    id: 'ai-image',
    name: 'AI Image Generation Studio',
    category: 'Visual Prompt Engineering',
    description: 'Craft studio-grade visual prompts and aspect-ratio specifications ready for image synthesis pipelines.',
    iconName: 'Image',
    systemPrompt: 'You are Yara AI Visual Prompt Architect. Generate detailed photography and illustration prompt specifications including lighting, lens, palette, and composition.',
    placeholderInput: 'Describe the visual concept you want to design...',
    samplePrompt: 'Create a detailed architectural illustration prompt for a sunlit Nordic library with timber beams.',
    requiresIntegrationNote: 'Direct raster rendering pipeline connects via server-side Imagen API in Phase 4.',
  },
  {
    id: 'ai-voice',
    name: 'AI Voice & Script Tools',
    category: 'Audio & Narration',
    description: 'Format podcast scripts, phonetic pronunciation guides, and timed voiceover narration cues.',
    iconName: 'Mic',
    systemPrompt: 'You are Yara AI Voice Script Director. Write natural spoken-word scripts with pacing markers [PAUSE], emphasis cues, and timing estimates.',
    placeholderInput: 'Describe your video or podcast topic for a timed voiceover script...',
    samplePrompt: 'Write a 45-second welcoming voiceover script introducing the Falylio Yara platform.',
    requiresIntegrationNote: 'Direct neural TTS audio stream connects via server-side Audio API in Phase 4.',
  },
];

export const BROWSER_GAMES: BrowserGameItem[] = [
  {
    id: 'game-memory',
    title: 'Logic Grid Memory Match',
    category: 'Puzzle Games',
    description: 'Clean cognitive pattern-matching board designed for quick mental refresh breaks.',
    playMode: 'memory-match',
    playersCount: 'Single Player · Instant Browser Play',
    difficulty: 'Beginner',
  },
  {
    id: 'game-word',
    title: 'Lexicon Word Unscramble',
    category: 'Browser Games',
    description: 'Unscramble vocabulary terms across technology, science, and literature under gentle time goals.',
    playMode: 'word-scramble',
    playersCount: 'Single Player · Vocabulary Puzzle',
    difficulty: 'Intermediate',
  },
  {
    id: 'game-number',
    title: 'Binary Tile 2048 Logic',
    category: 'Casual Games',
    description: 'Combine powers of two on a minimalist 4x4 grid using keyboard arrows or touch controls.',
    playMode: '2048-grid',
    playersCount: 'Single Player · Math Strategy',
    difficulty: 'Intermediate',
  },
  {
    id: 'game-sudoku',
    title: 'Daily 4x4 Rapid Sudoku',
    category: 'Puzzle Games',
    description: 'A distraction-free mini Latin-square deduction puzzle playable in under three minutes.',
    playMode: 'sudoku-mini',
    playersCount: 'Single Player · Daily Logic',
    difficulty: 'Relaxed',
  },
];

export const SOFTWARE_APPS: SoftwareAppItem[] = [
  {
    id: 'app-fy-companion',
    name: 'Falylio Yara Mobile Companion',
    platform: 'Android Applications',
    version: 'v2.4.0 (Capacitor Ready)',
    size: '18.4 MB',
    license: 'Free Official App',
    rating: '4.9 / 5.0',
    description: 'Access all 17 utility categories, saved notes, and offline calculators on Android devices.',
    isLatest: true,
  },
  {
    id: 'app-win-quickcapture',
    name: 'DeskScribe Screen & OCR Utility',
    platform: 'Windows Software',
    version: 'v3.1.2 (64-bit)',
    size: '42.0 MB',
    license: 'Open Source MIT',
    rating: '4.8 / 5.0',
    description: 'Lightweight Windows tray utility for region snipping, color picking, and plain-text extraction.',
    isLatest: true,
  },
  {
    id: 'app-oss-markvault',
    name: 'MarkVault Local Knowledge Base',
    platform: 'Open-source Software',
    version: 'v1.9.4',
    size: '29.1 MB',
    license: 'GPL-3.0 Verified',
    rating: '4.9 / 5.0',
    description: 'Local-first Markdown notebook with bidirectional links, LaTeX math support, and Git sync.',
  },
  {
    id: 'app-ext-cleanreader',
    name: 'Clarity View Article Reader',
    platform: 'Browser Extensions',
    version: 'v1.5.0 (Chromium / Firefox)',
    size: '1.2 MB',
    license: 'Free Extension',
    rating: '4.7 / 5.0',
    description: 'Transforms cluttered web articles into clean, distraction-free typography with one click.',
  },
];

export const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'mp-saas-ui',
    title: 'Aurora Enterprise Design System & Figma Kit',
    category: 'Templates',
    seller: 'Nordic Grid Studio',
    sellerRole: 'Verified UI Partner',
    price: 39,
    rating: '4.9',
    reviewsCount: 128,
    description: 'Complete Next.js + Tailwind CSS & Figma component library with 90+ accessible SaaS screens.',
    deliverables: ['Figma Source File', 'Next.js 15 TypeScript Templates', 'WCAG AA Color Tokens'],
  },
  {
    id: 'mp-vector-pack',
    title: '240 Clean Isometric Technical Illustrations',
    category: 'Graphics',
    seller: 'Lumina Vector Lab',
    sellerRole: 'Featured Illustrator',
    price: 24,
    rating: '4.8',
    reviewsCount: 84,
    description: 'Scalable SVG and PNG editorial illustrations for cloud infrastructure, fintech, and education.',
    deliverables: ['240 Editable SVG Files', 'High-Res PNG Renders', 'Commercial License'],
  },
  {
    id: 'mp-ebook-arch',
    title: 'Practical Full-Stack Architecture with Next.js & SQL',
    category: 'E-books',
    seller: 'Tariq Al-Mansoor',
    sellerRole: 'Principal Architect',
    price: 19,
    rating: '5.0',
    reviewsCount: 215,
    description: '320-page engineering handbook covering authentication, multi-tenant schemas, and testing.',
    deliverables: ['PDF + EPUB Formats', 'Companion GitHub Repository', 'Architecture Diagrams'],
  },
  {
    id: 'mp-invoice-suite',
    title: 'Freelance Agency Client Portal Starter',
    category: 'Software',
    seller: 'CraftOps Collective',
    sellerRole: 'Verified Developer',
    price: 49,
    rating: '4.9',
    reviewsCount: 62,
    description: 'Ready-to-deploy project tracker, milestone approval portal, and invoice ledger template.',
    deliverables: ['Full TypeScript Source Code', 'Supabase Schema SQL', 'Setup Documentation'],
  },
  {
    id: 'mp-audit-service',
    title: 'Comprehensive UX & Accessibility Audit',
    category: 'Creator Services',
    seller: 'Elena Rostova',
    sellerRole: 'Senior UX Consultant',
    price: 120,
    rating: '5.0',
    reviewsCount: 47,
    description: 'Detailed heuristic review of your web application with annotated video walkthrough and action plan.',
    deliverables: ['15-Page Audit Report', '30-Min Video Walkthrough', 'Prioritized Fix Backlog'],
  },
];

export const EDUCATION_COURSES: CourseItem[] = [
  {
    id: 'course-comp',
    title: 'Digital Literacy & Modern Operating Systems',
    track: 'Computer Learning',
    instructor: 'Prof. Nadia Rahman',
    lessonsCount: 14,
    duration: '4h 30m',
    level: 'Beginner',
    description: 'Master file management, cloud synchronization, keyboard efficiency, and digital security fundamentals.',
    quizQuestions: [
      {
        question: 'Which file extension represents a lossless vector graphic format ideal for web logos?',
        options: ['.jpg', '.svg', '.mp4', '.exe'],
        correctIndex: 1,
        explanation: 'SVG (Scalable Vector Graphics) stores geometry in XML format so it scales to any resolution without losing sharpness.',
      },
      {
        question: 'What is the primary purpose of Two-Factor Authentication (2FA)?',
        options: [
          'To speed up browser page rendering',
          'To add a second independent verification layer beyond a password',
          'To compress hard drive storage',
          'To automatically translate web pages',
        ],
        correctIndex: 1,
        explanation: '2FA requires both something you know (password) and something you possess (authenticator code or hardware key).',
      },
    ],
  },
  {
    id: 'course-prog',
    title: 'Full-Stack TypeScript & React Architecture',
    track: 'Programming',
    instructor: 'Devon Vance',
    lessonsCount: 24,
    duration: '9h 15m',
    level: 'Intermediate',
    description: 'Build maintainable web applications with strict TypeScript types, Server Components, and modular state.',
    quizQuestions: [
      {
        question: 'In Next.js App Router, what is the default rendering model for components inside the app/ directory?',
        options: ['Client Components', 'React Server Components', 'Web Workers', 'Static iFrames'],
        correctIndex: 1,
        explanation: 'Components in the Next.js App Router are React Server Components by default unless marked with "use client".',
      },
      {
        question: 'Which TypeScript utility type constructs a type with all properties of Type set to optional?',
        options: ['Required<Type>', 'Partial<Type>', 'Readonly<Type>', 'Pick<Type, K>'],
        correctIndex: 1,
        explanation: 'Partial<Type> makes every property on the target interface optional.',
      },
    ],
  },
  {
    id: 'course-ai',
    title: 'Applied AI Engineering & Prompt Systems',
    track: 'AI Learning',
    instructor: 'Dr. Samir Patel',
    lessonsCount: 16,
    duration: '5h 45m',
    level: 'All Levels',
    description: 'Learn structured output schemas, retrieval-augmented generation (RAG), and responsible AI evaluation.',
    quizQuestions: [
      {
        question: 'Why should LLM API keys always be kept on the server rather than prefixed with NEXT_PUBLIC_?',
        options: [
          'Server environment variables prevent exposing secret credentials in client browser bundles',
          'Browser variables cannot store strings longer than 10 characters',
          'NEXT_PUBLIC_ variables only work on mobile devices',
          'It changes the font size of the output',
        ],
        correctIndex: 0,
        explanation: 'Any variable prefixed with NEXT_PUBLIC_ is bundled into client-side JavaScript and visible to anyone inspecting network traffic.',
      },
    ],
  },
  {
    id: 'course-design',
    title: 'UI Systems, Typography & Visual Hierarchy',
    track: 'Graphic Design',
    instructor: 'Clara Lindqvist',
    lessonsCount: 18,
    duration: '6h 10m',
    level: 'Beginner',
    description: 'Design balanced interfaces using grid geometry, WCAG contrast ratios, and intentional type scales.',
    quizQuestions: [
      {
        question: 'What is the minimum WCAG AA contrast ratio required for standard body text?',
        options: ['1.5 : 1', '2.0 : 1', '4.5 : 1', '10.0 : 1'],
        correctIndex: 2,
        explanation: 'WCAG 2.1 AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.',
      },
    ],
  },
  {
    id: 'course-lang',
    title: 'Professional English & Arabic Communication',
    track: 'Language Learning',
    instructor: 'Omar Al-Faruq',
    lessonsCount: 20,
    duration: '7h 00m',
    level: 'All Levels',
    description: 'Develop clear written and spoken communication for international business, research, and correspondence.',
    quizQuestions: [
      {
        question: 'In professional business correspondence, what belongs in the opening paragraph?',
        options: [
          'The core purpose or request of the message clearly stated',
          'Unrelated personal anecdotes',
          'Raw server logs',
          'No greeting or context',
        ],
        correctIndex: 0,
        explanation: 'Stating the purpose concisely in the opening lines respects the reader’s time and improves response clarity.',
      },
    ],
  },
  {
    id: 'course-islamic',
    title: 'Foundations of Islamic Ethics, History & Scholarship',
    track: 'Islamic Studies',
    instructor: 'Sheikh Ibrahim Khalil',
    lessonsCount: 15,
    duration: '5h 20m',
    level: 'All Levels',
    description: 'Explore classical scholarship, ethical principles in commerce and daily life, and historical contributions to science.',
    quizQuestions: [
      {
        question: 'Which 9th-century scholar authored the foundational treatise on Algebra (Al-Jabr) in Baghdad?',
        options: ['Al-Khwarizmi', 'Ibn Battuta', 'Al-Jazari', 'Ibn Khaldun'],
        correctIndex: 0,
        explanation: 'Muhammad ibn Musa al-Khwarizmi wrote Kitab al-Jabr, from which the words "algebra" and "algorithm" derive.',
      },
    ],
  },
];

export const STOCK_MEDIA_ITEMS: StockMediaItem[] = [
  {
    id: 'media-1',
    title: 'Minimalist Nordic Workspace Architecture',
    type: 'Photos',
    resolutionOrFormat: '6000 × 4000 px · JPG',
    license: 'CC0 Commercial Free',
    palette: ['#0F172A', '#0284C7', '#E2E8F0'],
    author: 'Studio Fjord',
  },
  {
    id: 'media-2',
    title: 'Modular Cloud Infrastructure Isometric Set',
    type: 'Vectors',
    resolutionOrFormat: 'SVG + EPS Vector',
    license: 'Royalty-Free License',
    palette: ['#1E3A8A', '#06B6D4', '#F0F9FF'],
    author: 'Yara Design Lab',
  },
  {
    id: 'media-3',
    title: 'Editorial Collaboration & Learning Scenes',
    type: 'Illustrations',
    resolutionOrFormat: 'Figma + SVG Pack',
    license: 'Royalty-Free License',
    palette: ['#0F172A', '#38BDF8', '#F8FAFC'],
    author: 'Amina Visuals',
  },
  {
    id: 'media-4',
    title: 'Serene Horizon Daylight Desktop Gradients',
    type: 'Wallpapers',
    resolutionOrFormat: '5120 × 2880 (5K) · PNG',
    license: 'Free Personal & Commercial',
    palette: ['#0369A1', '#7DD3FC', '#F0F9FF'],
    author: 'Horizon Collective',
  },
  {
    id: 'media-5',
    title: 'Precision 24px Linear Interface Icons (400+)',
    type: 'Icons',
    resolutionOrFormat: 'SVG Sprite + React Components',
    license: 'MIT Open License',
    palette: ['#0F172A', '#475569', '#94A3B8'],
    author: 'Falylio Core System',
  },
  {
    id: 'media-6',
    title: 'Clean UI Micro-Interaction Sound Effects',
    type: 'Sound Effects',
    resolutionOrFormat: '24-bit WAV · 48kHz',
    license: 'Royalty-Free Audio',
    palette: ['#0F172A', '#0284C7', '#BAE6FD'],
    author: 'SonicCraft Studio',
  },
  {
    id: 'media-7',
    title: 'Clean Timelapse of Sunlit Library Study Hall',
    type: 'Videos',
    resolutionOrFormat: '4K 60fps · MP4 (H.264)',
    license: 'Royalty-Free Footage',
    palette: ['#1E293B', '#0284C7', '#F1F5F9'],
    author: 'FrameLine Media',
  },
  {
    id: 'media-8',
    title: 'Yara Sans Geometric Display & Tabular Numerals',
    type: 'Fonts',
    resolutionOrFormat: 'WOFF2 + OTF Variable Font',
    license: 'SIL Open Font License',
    palette: ['#0F172A', '#334155', '#E2E8F0'],
    author: 'Foundry North',
  },
];

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    title: 'How Modular Web Utilities Replace Heavy Desktop Bloatware in 2026',
    category: 'Technology News',
    author: 'Rayan Siddiqui',
    publishedAt: '2 hours ago',
    readTime: '4 min read',
    repliesCount: 19,
    summary: 'Browser-native WebAssembly and clean client-side TypeScript workbenches now perform PDF, JSON, and image inspections without uploading sensitive files.',
  },
  {
    id: 'post-2',
    title: 'Designing Calm, Trustworthy Interfaces: Why Visual Restraint Wins',
    category: 'Tutorials',
    author: 'Elena Rostova',
    publishedAt: '5 hours ago',
    readTime: '6 min read',
    repliesCount: 34,
    summary: 'A practical breakdown of 60-30-10 color balance, crisp light-mode surfaces, and accessible contrast for all-in-one digital platforms.',
  },
  {
    id: 'post-3',
    title: 'Structured Prompt Engineering for Multilingual Document Summarization',
    category: 'AI News',
    author: 'Dr. Samir Patel',
    publishedAt: 'Yesterday',
    readTime: '5 min read',
    repliesCount: 27,
    summary: 'Combining system instructions with deterministic bullet templates dramatically reduces hallucination rates in technical translations.',
  },
  {
    id: 'post-4',
    title: 'Best Open-Source Markdown & Knowledge Base Tools Compared',
    category: 'App Reviews',
    author: 'Devon Vance',
    publishedAt: '2 days ago',
    readTime: '7 min read',
    repliesCount: 42,
    summary: 'Evaluating local-first storage, startup latency, and keyboard accessibility across modern cross-platform note applications.',
  },
];

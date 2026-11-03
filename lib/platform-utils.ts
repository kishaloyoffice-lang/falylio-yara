import {
  PLATFORM_TOOLS,
  YARA_AI_MODULES,
  EDUCATION_COURSES,
  MARKETPLACE_PRODUCTS,
  SOFTWARE_APPS,
  BROWSER_GAMES,
  type PlatformTool,
  type ToolCategory,
} from './platform-data';

export interface UnifiedSearchResult {
  id: string;
  title: string;
  categoryLabel: string;
  sectionType: 'Tool' | 'AI Assistant' | 'Course' | 'Marketplace' | 'Software' | 'Browser Game';
  description: string;
  actionTarget: string;
}

/**
 * Filter tools by category, tag filter, and search query.
 */
export function filterTools(
  tools: PlatformTool[],
  options: {
    category?: ToolCategory | 'All';
    tag?: 'all' | 'popular' | 'recent' | 'recommended' | 'free';
    query?: string;
  }
): PlatformTool[] {
  const { category = 'All', tag = 'all', query = '' } = options;
  const normalizedQuery = query.trim().toLowerCase();

  return tools.filter((tool) => {
    if (category !== 'All' && tool.category !== category) {
      return false;
    }
    if (tag !== 'all' && !tool.tags.includes(tag)) {
      return false;
    }
    if (normalizedQuery.length > 0) {
      const hay = `${tool.name} ${tool.category} ${tool.description}`.toLowerCase();
      return hay.includes(normalizedQuery);
    }
    return true;
  });
}

/**
 * Perform unified global search across Tools, AI Assistants, Courses, Marketplace, Apps, and Games.
 */
export function searchPlatformCatalog(query: string): UnifiedSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: UnifiedSearchResult[] = [];

  for (const t of PLATFORM_TOOLS) {
    if (`${t.name} ${t.category} ${t.description}`.toLowerCase().includes(q)) {
      results.push({
        id: t.id,
        title: t.name,
        categoryLabel: t.category,
        sectionType: 'Tool',
        description: t.description,
        actionTarget: t.id,
      });
    }
  }

  for (const ai of YARA_AI_MODULES) {
    if (`${ai.name} ${ai.category} ${ai.description}`.toLowerCase().includes(q)) {
      results.push({
        id: ai.id,
        title: ai.name,
        categoryLabel: ai.category,
        sectionType: 'AI Assistant',
        description: ai.description,
        actionTarget: ai.id,
      });
    }
  }

  for (const c of EDUCATION_COURSES) {
    if (`${c.title} ${c.track} ${c.description}`.toLowerCase().includes(q)) {
      results.push({
        id: c.id,
        title: c.title,
        categoryLabel: c.track,
        sectionType: 'Course',
        description: c.description,
        actionTarget: c.id,
      });
    }
  }

  for (const m of MARKETPLACE_PRODUCTS) {
    if (`${m.title} ${m.category} ${m.description}`.toLowerCase().includes(q)) {
      results.push({
        id: m.id,
        title: m.title,
        categoryLabel: m.category,
        sectionType: 'Marketplace',
        description: m.description,
        actionTarget: m.id,
      });
    }
  }

  for (const app of SOFTWARE_APPS) {
    if (`${app.name} ${app.platform} ${app.description}`.toLowerCase().includes(q)) {
      results.push({
        id: app.id,
        title: app.name,
        categoryLabel: app.platform,
        sectionType: 'Software',
        description: app.description,
        actionTarget: app.id,
      });
    }
  }

  for (const g of BROWSER_GAMES) {
    if (`${g.title} ${g.category} ${g.description}`.toLowerCase().includes(q)) {
      results.push({
        id: g.id,
        title: g.title,
        categoryLabel: g.category,
        sectionType: 'Browser Game',
        description: g.description,
        actionTarget: g.id,
      });
    }
  }

  return results;
}

/**
 * Analyze text for word count, character count, sentences, paragraphs, and reading time.
 */
export function analyzeTextMetrics(text: string): {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      characters: text.length,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, '').length;
  const sentences = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
  };
}

/**
 * Calculate invoice subtotal, discount, tax, and grand total.
 */
export function calculateInvoiceSummary(
  items: { description: string; quantity: number; unitPrice: number }[],
  taxRatePercent: number,
  discountPercent: number
): {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
} {
  const subtotal = items.reduce((acc, item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    return acc + qty * price;
  }, 0);

  const clampedDiscount = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  const clampedTax = Math.max(0, Number(taxRatePercent) || 0);

  const discountAmount = Number(((subtotal * clampedDiscount) / 100).toFixed(2));
  const taxableAmount = Number((subtotal - discountAmount).toFixed(2));
  const taxAmount = Number(((taxableAmount * clampedTax) / 100).toFixed(2));
  const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount,
    taxableAmount,
    taxAmount,
    grandTotal,
  };
}

/**
 * Convert HEX color to RGB and relative luminance contrast against white and navy.
 */
export function parseHexColor(hexInput: string): {
  valid: boolean;
  hex: string;
  r: number;
  g: number;
  b: number;
  rgbString: string;
  contrastWithWhite: number;
  contrastWithNavy: number;
} {
  const cleaned = hexInput.trim().replace(/^#/, '');
  const fullHex =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;

  if (!/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
    return {
      valid: false,
      hex: '#0284C7',
      r: 2,
      g: 132,
      b: 199,
      rgbString: 'rgb(2, 132, 199)',
      contrastWithWhite: 4.1,
      contrastWithNavy: 3.9,
    };
  }

  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);

  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];

  const whiteLum = 1.0;
  const navyLum = 0.011; // #0F172A approx luminance

  const contrastWithWhite = Number(((Math.max(lum, whiteLum) + 0.05) / (Math.min(lum, whiteLum) + 0.05)).toFixed(2));
  const contrastWithNavy = Number(((Math.max(lum, navyLum) + 0.05) / (Math.min(lum, navyLum) + 0.05)).toFixed(2));

  return {
    valid: true,
    hex: `#${fullHex.toUpperCase()}`,
    r,
    g,
    b,
    rgbString: `rgb(${r}, ${g}, ${b})`,
    contrastWithWhite,
    contrastWithNavy,
  };
}

/**
 * Evaluate MCQ Quiz score and percentage.
 */
export function evaluateQuizAnswers(
  questions: { correctIndex: number }[],
  selectedIndices: Record<number, number>
): {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
} {
  const totalQuestions = questions.length;
  if (totalQuestions === 0) {
    return { correctCount: 0, totalQuestions: 0, percentage: 0, passed: false };
  }

  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedIndices[idx] === q.correctIndex) {
      correctCount += 1;
    }
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  return {
    correctCount,
    totalQuestions,
    percentage,
    passed: percentage >= 50,
  };
}

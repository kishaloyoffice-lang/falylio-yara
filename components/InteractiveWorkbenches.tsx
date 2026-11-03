'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Calculator,
  Code2,
  AlignLeft,
  Palette,
  Receipt,
  CalendarClock,
  Globe,
  Share2,
  FolderKanban,
  Award,
  Lock,
  Bookmark,
  Clock,
  Settings,
  Layers,
  Database,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  type PlatformTool,
  type YaraAiModule,
  type CourseItem,
  type BrowserGameItem,
  PLATFORM_TOOLS,
  ALL_TOOL_CATEGORIES,
} from '@/lib/platform-data';
import {
  analyzeTextMetrics,
  calculateInvoiceSummary,
  parseHexColor,
  evaluateQuizAnswers,
} from '@/lib/platform-utils';

/* -------------------------------------------------------------------------- */
/* 1. TOOL WORKBENCH MODAL                                                    */
/* -------------------------------------------------------------------------- */

export function ToolWorkbenchModal({
  tool,
  onClose,
  isFavorite,
  onToggleFavorite,
}: {
  tool: PlatformTool | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  // Text Analyzer State
  const [textInput, setTextInput] = useState(
    'Falylio Yara brings together online utilities, educational courses, productivity tools, and developer workflows into a single calm workspace. Everything runs with clean typography and instant feedback.'
  );

  // JSON Formatter State
  const [jsonInput, setJsonInput] = useState(
    '{"platform":"Falylio Yara","tagline":"Dream • Create • Grow","categories":17,"capacitorReady":true}'
  );
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Password Generator State
  const [passLength, setPassLength] = useState(18);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [generatedPass, setGeneratedPass] = useState('Fy9#mK2$pL8@vQ4!xR');

  // Color Converter State
  const [hexInput, setHexInput] = useState('#0284C7');

  // Invoice Calculator State
  const [invoiceItems, setInvoiceItems] = useState([
    { description: 'UI/UX Architecture & System Tokens', quantity: 1, unitPrice: 850 },
    { description: 'Frontend Next.js Component Engineering', quantity: 2, unitPrice: 600 },
  ]);
  const [taxRate, setTaxRate] = useState(8.5);
  const [discountRate, setDiscountRate] = useState(5);

  // Math / Unit / Science / Bitrate Solver State
  const [mathBase, setMathBase] = useState(1200);
  const [mathRate, setMathRate] = useState(12.5);
  const [mathYears, setMathYears] = useState(3);
  const [celsiusInput, setCelsiusInput] = useState(25);

  // HTML Preview State
  const [htmlSnippet, setHtmlSnippet] = useState(
    `<div style="padding: 20px; background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 10px; font-family: sans-serif; color: #0F172A;">
  <h3 style="margin: 0 0 8px 0; color: #0369A1;">Falylio Yara Live Component Preview</h3>
  <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155;">Edit HTML & inline CSS on the left to inspect real-time rendering.</p>
  <button style="background: #0F172A; color: #FFFFFF; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px;">Sample Action</button>
</div>`
  );

  // Social Studio State
  const [socialTopic, setSocialTopic] = useState('Launching our new clean SaaS productivity toolkit');
  const [socialTone, setSocialTone] = useState<'Professional' | 'Educational' | 'Minimalist'>('Professional');

  // Date Calculator State
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  // File / Image Inspector State
  const [imgWidth, setImgWidth] = useState(1920);
  const [imgHeight, setImgHeight] = useState(1080);
  const [fileSizeMb, setFileSizeMb] = useState(15);

  useEffect(() => {
    if (!tool) return;
    if (tool.workbenchMode === 'json-formatter') {
      try {
        const parsed = JSON.parse(jsonInput);
        setJsonOutput(JSON.stringify(parsed, null, 2));
        setJsonError('');
      } catch (e: unknown) {
        setJsonError(e instanceof Error ? e.message : 'Invalid JSON syntax');
      }
    }
  }, [tool, jsonInput]);

  if (!tool) return null;

  const handleCopy = (value: string) => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const generateNewPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()-_=+[]{};:,.<>?';
    let pool = chars;
    if (includeNumbers) pool += nums;
    if (includeSymbols) pool += syms;
    let out = '';
    for (let i = 0; i < passLength; i++) {
      out += pool.charAt(Math.floor(Math.random() * pool.length));
    }
    setGeneratedPass(out);
  };

  const textMetrics = analyzeTextMetrics(textInput);
  const invoiceSummary = calculateInvoiceSummary(invoiceItems, taxRate, discountRate);
  const colorData = parseHexColor(hexInput);

  // Greatest common divisor for aspect ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const safeW = Math.max(1, imgWidth);
  const safeH = Math.max(1, imgHeight);
  const divisor = gcd(safeW, safeH);
  const ratioString = `${safeW / divisor}:${safeH / divisor}`;

  // Date difference calculation
  const d1 = new Date(startDate);
  const d2 = new Date(endDate);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = isNaN(diffMs) ? 0 : Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = (diffDays / 7).toFixed(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workbench-modal-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#F8FAFC] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{tool.category}</span>
              <span aria-hidden="true">·</span>
              <span>Client-Side Interactive Utility</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{tool.usageCount}</span>
            </div>
            <h2
              id="workbench-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              {tool.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(tool.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isFavorite
                  ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0369A1]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              {isFavorite ? 'Saved to Favorites' : 'Save Tool'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close tool workbench"
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <p className="text-sm text-slate-600">{tool.description}</p>

          {/* MODE 1: TEXT ANALYZER */}
          {tool.workbenchMode === 'text-analyzer' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="tool-text-input" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Source Document or Paragraph Text
                </label>
                <textarea
                  id="tool-text-input"
                  rows={5}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-[#0284C7] focus:outline-none"
                  placeholder="Type or paste text to inspect metrics..."
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-slate-200 pt-4">
                <div>
                  <span className="text-xs text-slate-500">Words</span>
                  <p className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">{textMetrics.words}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Characters</span>
                  <p className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">{textMetrics.characters}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">No Spaces</span>
                  <p className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">{textMetrics.charactersNoSpaces}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Sentences</span>
                  <p className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">{textMetrics.sentences}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Est. Read Time</span>
                  <p className="mt-0.5 text-xl font-semibold text-[#0284C7] tabular-nums">{textMetrics.readingTimeMinutes} min</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTextInput(textInput.replace(/\s+/g, ' ').trim())}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap"
                >
                  Normalize Extra Spaces
                </button>
                <button
                  type="button"
                  onClick={() => setTextInput(textInput.toUpperCase())}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap"
                >
                  Convert UPPERCASE
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(textInput)}
                  className="rounded-lg bg-[#0F172A] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap"
                >
                  {copied ? 'Copied Text' : 'Copy Result'}
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: JSON FORMATTER */}
          {tool.workbenchMode === 'json-formatter' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="json-raw-input" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Raw JSON Input
                </label>
                <textarea
                  id="json-raw-input"
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-700">Validated & Formatted Output</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(jsonOutput)}
                    className="text-xs font-medium text-[#0284C7] hover:underline"
                  >
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </button>
                </div>
                {jsonError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    Syntax Error: {jsonError}
                  </div>
                ) : (
                  <pre className="h-[182px] overflow-auto rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-sky-200">
                    {jsonOutput}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* MODE 3: PASSWORD GENERATOR */}
          {tool.workbenchMode === 'password-generator' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
                <code className="font-mono text-base font-semibold text-slate-900 break-all">
                  {generatedPass}
                </code>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={generateNewPassword}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedPass)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label htmlFor="pass-len" className="block text-xs font-medium text-slate-700">
                    Character Length: <span className="tabular-nums font-semibold">{passLength}</span>
                  </label>
                  <input
                    id="pass-len"
                    type="range"
                    min={8}
                    max={40}
                    value={passLength}
                    onChange={(e) => setPassLength(Number(e.target.value))}
                    className="mt-2 w-full accent-[#0284C7]"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="rounded border-slate-300 text-[#0284C7]"
                  />
                  Include Numeric Digits (0-9)
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="rounded border-slate-300 text-[#0284C7]"
                  />
                  Include Special Symbols (!@#$)
                </label>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-200 pt-3 tabular-nums">
                Estimated Entropy Strength: ~{Math.round(passLength * (includeSymbols ? 6.1 : 5.2))} bits · Generated 100% locally in browser memory
              </div>
            </div>
          )}

          {/* MODE 4: COLOR CONVERTER */}
          {tool.workbenchMode === 'color-converter' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div
                  className="h-16 w-24 rounded-lg border border-slate-200 shrink-0 shadow-inner"
                  style={{ backgroundColor: colorData.hex }}
                />
                <div className="flex-1 w-full">
                  <label htmlFor="hex-color-input" className="block text-xs font-medium text-slate-700 mb-1">
                    HEX Color Code
                  </label>
                  <input
                    id="hex-color-input"
                    type="text"
                    value={hexInput}
                    onChange={(e) => setHexInput(e.target.value)}
                    className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 focus:border-[#0284C7] focus:outline-none"
                    placeholder="#0284C7"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                <div>
                  <span className="text-xs text-slate-500">RGB Value</span>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {colorData.rgbString}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Contrast vs White (#FFFFFF)</span>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {colorData.contrastWithWhite} : 1{' '}
                    <span className="font-sans text-xs font-normal text-slate-500">
                      ({colorData.contrastWithWhite >= 4.5 ? 'WCAG AA Pass' : 'Large Text Only'})
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Contrast vs Navy (#0F172A)</span>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {colorData.contrastWithNavy} : 1{' '}
                    <span className="font-sans text-xs font-normal text-slate-500">
                      ({colorData.contrastWithNavy >= 4.5 ? 'WCAG AA Pass' : 'Low Contrast'})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 5: INVOICE CALCULATOR */}
          {tool.workbenchMode === 'invoice-calculator' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {invoiceItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      aria-label={`Line item ${index + 1} description`}
                      value={item.description}
                      onChange={(e) => {
                        const copy = [...invoiceItems];
                        copy[index].description = e.target.value;
                        setInvoiceItems(copy);
                      }}
                      className="col-span-6 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                      placeholder="Service description"
                    />
                    <input
                      type="number"
                      aria-label={`Line item ${index + 1} quantity`}
                      value={item.quantity}
                      min={1}
                      onChange={(e) => {
                        const copy = [...invoiceItems];
                        copy[index].quantity = Number(e.target.value);
                        setInvoiceItems(copy);
                      }}
                      className="col-span-2 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 tabular-nums"
                    />
                    <input
                      type="number"
                      aria-label={`Line item ${index + 1} unit price`}
                      value={item.unitPrice}
                      min={0}
                      onChange={(e) => {
                        const copy = [...invoiceItems];
                        copy[index].unitPrice = Number(e.target.value);
                        setInvoiceItems(copy);
                      }}
                      className="col-span-3 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== index))}
                      aria-label={`Remove line item ${index + 1}`}
                      className="col-span-1 flex justify-center text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setInvoiceItems([...invoiceItems, { description: 'Additional Deliverable', quantity: 1, unitPrice: 250 }])
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0284C7] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Invoice Line Item
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                <div>
                  <label htmlFor="inv-discount" className="block text-xs text-slate-600 mb-1">
                    Discount (%)
                  </label>
                  <input
                    id="inv-discount"
                    type="number"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="inv-tax" className="block text-xs text-slate-600 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    id="inv-tax"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 tabular-nums">
                <div>
                  <span className="text-xs text-slate-500">Subtotal</span>
                  <p className="text-sm font-semibold text-slate-900">${invoiceSummary.subtotal.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Discount</span>
                  <p className="text-sm font-semibold text-slate-700">-${invoiceSummary.discountAmount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Tax</span>
                  <p className="text-sm font-semibold text-slate-700">+${invoiceSummary.taxAmount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Total Due</span>
                  <p className="text-base font-bold text-[#0284C7]">${invoiceSummary.grandTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 6: UNIT / MATH SOLVER */}
          {tool.workbenchMode === 'unit-math-solver' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="math-base" className="block text-xs font-medium text-slate-700 mb-1">
                    Base Value / Principal
                  </label>
                  <input
                    id="math-base"
                    type="number"
                    value={mathBase}
                    onChange={(e) => setMathBase(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="math-rate" className="block text-xs font-medium text-slate-700 mb-1">
                    Growth / Rate (%)
                  </label>
                  <input
                    id="math-rate"
                    type="number"
                    value={mathRate}
                    onChange={(e) => setMathRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="math-periods" className="block text-xs font-medium text-slate-700 mb-1">
                    Periods / Cycles
                  </label>
                  <input
                    id="math-periods"
                    type="number"
                    value={mathYears}
                    onChange={(e) => setMathYears(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 tabular-nums">
                <div>
                  <span className="text-xs text-slate-500">Compound Result</span>
                  <p className="mt-0.5 text-lg font-semibold text-slate-900">
                    {(mathBase * Math.pow(1 + mathRate / 100, mathYears)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Simple Delta</span>
                  <p className="mt-0.5 text-lg font-semibold text-slate-900">
                    +{(mathBase * (mathRate / 100) * mathYears).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">SI Temperature ({celsiusInput}°C)</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      aria-label="Celsius input"
                      value={celsiusInput}
                      onChange={(e) => setCelsiusInput(Number(e.target.value))}
                      className="w-16 rounded border border-slate-300 px-1.5 py-0.5 text-xs tabular-nums"
                    />
                    <span className="text-xs font-medium text-[#0284C7]">
                      = {((celsiusInput * 9) / 5 + 32).toFixed(1)}°F · {(celsiusInput + 273.15).toFixed(2)}K
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 7: HTML PREVIEW */}
          {tool.workbenchMode === 'html-preview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="html-code-editor" className="block text-xs font-medium text-slate-700 mb-1">
                  HTML5 & Inline CSS Markup
                </label>
                <textarea
                  id="html-code-editor"
                  rows={7}
                  value={htmlSnippet}
                  onChange={(e) => setHtmlSnippet(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs text-slate-900"
                />
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-700 mb-1">Rendered Sandbox Preview</span>
                <div
                  className="h-[168px] overflow-auto rounded-lg border border-slate-200 bg-white p-3"
                  dangerouslySetInnerHTML={{ __html: htmlSnippet }}
                />
              </div>
            </div>
          )}

          {/* MODE 8: SOCIAL GENERATOR */}
          {tool.workbenchMode === 'social-generator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="social-topic-input" className="block text-xs font-medium text-slate-700 mb-1">
                    Post Subject or Announcement
                  </label>
                  <input
                    id="social-topic-input"
                    type="text"
                    value={socialTopic}
                    onChange={(e) => setSocialTopic(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="social-tone-select" className="block text-xs font-medium text-slate-700 mb-1">
                    Editorial Tone
                  </label>
                  <select
                    id="social-tone-select"
                    value={socialTone}
                    onChange={(e) => setSocialTone(e.target.value as 'Professional' | 'Educational' | 'Minimalist')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Educational">Educational</option>
                    <option value="Minimalist">Minimalist</option>
                  </select>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 text-sm text-slate-800 space-y-2">
                <p className="font-medium text-slate-900">
                  [{socialTone} Post Draft] {socialTopic}
                </p>
                <p className="text-xs text-slate-600">
                  Built for clarity, speed, and everyday focus. Explore our unified workspace at Falylio Yara — Dream • Create • Grow.
                </p>
                <p className="font-mono text-xs text-[#0284C7]">
                  #FalylioYara #DigitalWorkspace #ProductivityTools #CleanDesign #SaaS
                </p>
              </div>
            </div>
          )}

          {/* MODE 9: DATE CALCULATOR */}
          {tool.workbenchMode === 'date-calculator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date-start" className="block text-xs font-medium text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    id="date-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="date-end" className="block text-xs font-medium text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    id="date-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 tabular-nums">
                <div>
                  <span className="text-xs text-slate-500">Total Calendar Days</span>
                  <p className="text-lg font-semibold text-slate-900">{diffDays} days</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Total Weeks</span>
                  <p className="text-lg font-semibold text-slate-900">{diffWeeks} weeks</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Total Hours</span>
                  <p className="text-lg font-semibold text-[#0284C7]">{diffDays * 24} hrs</p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 10: FILE & IMAGE INSPECTOR */}
          {tool.workbenchMode === 'file-inspector' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="img-w" className="block text-xs font-medium text-slate-700 mb-1">
                    Width (px)
                  </label>
                  <input
                    id="img-w"
                    type="number"
                    value={imgWidth}
                    onChange={(e) => setImgWidth(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="img-h" className="block text-xs font-medium text-slate-700 mb-1">
                    Height (px)
                  </label>
                  <input
                    id="img-h"
                    type="number"
                    value={imgHeight}
                    onChange={(e) => setImgHeight(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="file-mb" className="block text-xs font-medium text-slate-700 mb-1">
                    Payload Size (MB)
                  </label>
                  <input
                    id="file-mb"
                    type="number"
                    value={fileSizeMb}
                    onChange={(e) => setFileSizeMb(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 tabular-nums">
                <div>
                  <span className="text-xs text-slate-500">Aspect Ratio</span>
                  <p className="text-lg font-semibold text-slate-900">{ratioString}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Total Megapixels</span>
                  <p className="text-lg font-semibold text-slate-900">{((safeW * safeH) / 1_000_000).toFixed(2)} MP</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Est. 50Mbps Transfer</span>
                  <p className="text-lg font-semibold text-[#0284C7]">{((fileSizeMb * 8) / 50).toFixed(1)} sec</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. YARA AI CENTER INTERACTIVE STUDIO MODAL                                 */
/* -------------------------------------------------------------------------- */

export function YaraAiStudioModal({
  moduleItem,
  onClose,
}: {
  moduleItem: YaraAiModule | null;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!moduleItem) return;
    setPrompt(moduleItem.samplePrompt);
    setOutput('');
    setErrorMsg('');

    fetch('/api/ai')
      .then((r) => r.json())
      .then((data) => {
        setApiConnected(Boolean(data.aiConnected));
      })
      .catch(() => {
        setApiConnected(false);
      });
  }, [moduleItem]);

  if (!moduleItem) return null;

  const handleRunAi = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setOutput('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction: moduleItem.systemPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.connected) {
        setErrorMsg(
          data.error ||
            'AI API is not currently connected. Connect GEMINI_API_KEY in server settings to enable live responses.'
        );
      } else {
        setOutput(data.text);
      }
    } catch {
      setErrorMsg('Could not reach the server-side AI endpoint (/api/ai).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="yara-ai-modal-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#F0F7FF] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Yara AI Center</span>
              <span aria-hidden="true">·</span>
              <span>{moduleItem.category}</span>
              <span aria-hidden="true">·</span>
              <span>
                {apiConnected === null
                  ? 'Checking API Status...'
                  : apiConnected
                  ? 'Server-Side Gemini API Connected'
                  : 'API Key Required for Live Execution'}
              </span>
            </div>
            <h2
              id="yara-ai-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              {moduleItem.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Yara AI Studio"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleRunAi} className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-slate-600">{moduleItem.description}</p>

          {moduleItem.requiresIntegrationNote && (
            <div className="rounded-lg border border-sky-200 bg-[#F0F9FF] p-3 text-xs text-slate-700">
              <strong>Architecture Note:</strong> {moduleItem.requiresIntegrationNote}
            </div>
          )}

          <div>
            <label htmlFor="yara-prompt-input" className="block text-xs font-medium text-slate-700 mb-1.5">
              Workspace Prompt
            </label>
            <textarea
              id="yara-prompt-input"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={moduleItem.placeholderInput}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-[#0284C7] focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPrompt(moduleItem.samplePrompt)}
              className="text-xs font-medium text-[#0284C7] hover:underline"
            >
              Load Sample Prompt
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              {loading ? 'Processing via /api/ai...' : `Run ${moduleItem.name}`}
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-700" />
                Transparent API Integration Status
              </div>
              <p>{errorMsg}</p>
            </div>
          )}

          {output && (
            <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 space-y-2">
              <div className="text-xs font-medium text-slate-500">Yara AI Output</div>
              <div className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">{output}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. COURSE LESSON & MCQ QUIZ RUNNER MODAL                                   */
/* -------------------------------------------------------------------------- */

export function CourseQuizModal({
  course,
  onClose,
}: {
  course: CourseItem | null;
  onClose: () => void;
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelectedAnswers({});
    setSubmitted(false);
  }, [course]);

  if (!course) return null;

  const evaluation = evaluateQuizAnswers(course.quizQuestions, selectedAnswers);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-quiz-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#F8FAFC] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{course.track}</span>
              <span aria-hidden="true">·</span>
              <span>{course.instructor}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{course.lessonsCount} Lessons</span>
            </div>
            <h2
              id="course-quiz-title"
              className="mt-1 text-lg font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              {course.title} — Interactive Assessment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Course Quiz"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-sm text-slate-600">{course.description}</p>

          <div className="space-y-5">
            {course.quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-900">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[qIdx] === oIdx;
                    const isCorrect = q.correctIndex === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => {
                          if (!submitted) {
                            setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx });
                          }
                        }}
                        className={`w-full text-left rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                          submitted
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                              : isSelected
                              ? 'border-red-400 bg-red-50 text-red-900'
                              : 'border-slate-200 bg-white text-slate-600'
                            : isSelected
                            ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0F172A]'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="text-xs text-slate-600 border-t border-slate-200 pt-2">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            {submitted ? (
              <div className="text-sm font-semibold text-slate-900 tabular-nums">
                Score: {evaluation.correctCount} / {evaluation.totalQuestions} ({evaluation.percentage}%) —{' '}
                <span className={evaluation.passed ? 'text-emerald-700' : 'text-amber-700'}>
                  {evaluation.passed ? 'Module Passed' : 'Review Recommended'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Select an answer for each MCQ above to verify your knowledge.</span>
            )}
            <div className="flex items-center gap-2">
              {submitted && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnswers({});
                    setSubmitted(false);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Retry Quiz
                </button>
              )}
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap"
              >
                Check Answers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. CLEAN BROWSER LOGIC GAME MODAL                                          */
/* -------------------------------------------------------------------------- */

export function BrowserGameModal({
  game,
  onClose,
}: {
  game: BrowserGameItem | null;
  onClose: () => void;
}) {
  const symbols = ['Δ', 'Ω', 'Σ', 'Π', 'Φ', 'Ψ', 'Λ', 'Θ'];
  const [cards, setCards] = useState<{ symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  // Word Scramble State
  const [wordGuess, setWordGuess] = useState('');
  const [wordSolved, setWordSolved] = useState(false);

  const resetMemoryBoard = () => {
    const deck = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol) => ({ symbol, flipped: false, matched: false }));
    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
  };

  useEffect(() => {
    if (game) {
      resetMemoryBoard();
      setWordGuess('');
      setWordSolved(false);
    }
  }, [game]);

  if (!game) return null;

  const handleCardClick = (idx: number) => {
    if (cards[idx].flipped || cards[idx].matched || flippedIndices.length === 2) return;
    const updated = [...cards];
    updated[idx].flipped = true;
    const nextFlipped = [...flippedIndices, idx];
    setCards(updated);
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = nextFlipped;
      if (updated[first].symbol === updated[second].symbol) {
        updated[first].matched = true;
        updated[second].matched = true;
        setCards([...updated]);
        setFlippedIndices([]);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === first || i === second ? { ...c, flipped: false } : c))
          );
          setFlippedIndices([]);
        }, 650);
      }
    }
  };

  const matchedCount = cards.filter((c) => c.matched).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="browser-game-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#F8FAFC] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{game.category}</span>
              <span aria-hidden="true">·</span>
              <span>{game.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Moves: {moves}</span>
            </div>
            <h2
              id="browser-game-title"
              className="mt-1 text-lg font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              {game.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Browser Game"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600">{game.description}</p>

          {game.playMode === 'word-scramble' ? (
            <div className="space-y-4 rounded-lg border border-slate-200 bg-[#F8FAFC] p-5 text-center">
              <div className="text-xs uppercase tracking-wider text-slate-500">Unscramble the Platform Engineering Term</div>
              <div className="font-mono text-2xl font-bold tracking-widest text-[#0F172A]">
                E R U T C E T I H C R A
              </div>
              <p className="text-xs text-slate-500">Clue: The fundamental structure of a software system (12 letters)</p>
              <div className="flex gap-2 justify-center">
                <input
                  type="text"
                  value={wordGuess}
                  onChange={(e) => {
                    setWordGuess(e.target.value);
                    if (e.target.value.trim().toUpperCase() === 'ARCHITECTURE') {
                      setWordSolved(true);
                    }
                  }}
                  placeholder="Type answer..."
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    setWordGuess('ARCHITECTURE');
                    setWordSolved(true);
                  }}
                  className="rounded-lg bg-[#0F172A] px-3.5 py-2 text-xs font-medium text-white"
                >
                  Reveal
                </button>
              </div>
              {wordSolved && (
                <p className="text-xs font-semibold text-emerald-700">Correct! ARCHITECTURE solved.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2.5">
                {cards.map((card, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleCardClick(i)}
                    aria-label={`Grid tile ${i + 1}`}
                    className={`flex h-16 items-center justify-center rounded-lg border text-lg font-bold transition-colors ${
                      card.matched
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : card.flipped
                        ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0F172A]'
                        : 'border-slate-200 bg-[#F8FAFC] text-slate-400 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {card.flipped || card.matched ? card.symbol : '?'}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-600 tabular-nums">
                  Matched Pairs: {matchedCount / 2} / 8
                </span>
                <button
                  type="button"
                  onClick={resetMemoryBoard}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset Board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

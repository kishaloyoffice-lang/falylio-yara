import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterTools,
  searchPlatformCatalog,
  analyzeTextMetrics,
  calculateInvoiceSummary,
  parseHexColor,
  evaluateQuizAnswers,
} from './platform-utils';
import { PLATFORM_TOOLS, ALL_TOOL_CATEGORIES } from './platform-data';

test('ALL_TOOL_CATEGORIES has all 17 requested tool categories', () => {
  assert.equal(ALL_TOOL_CATEGORIES.length, 17);
  assert.ok(ALL_TOOL_CATEGORIES.includes('Image Tools'));
  assert.ok(ALL_TOOL_CATEGORIES.includes('Privacy and Security Tools'));
});

test('filterTools filters accurately by category, tag, and query', () => {
  const devTools = filterTools(PLATFORM_TOOLS, { category: 'Developer Tools' });
  assert.equal(devTools.length, 1);
  assert.equal(devTools[0].slug, 'json-validator-formatter');

  const queryTools = filterTools(PLATFORM_TOOLS, { query: 'invoice' });
  assert.equal(queryTools.length, 1);
  assert.equal(queryTools[0].category, 'Office Tools');
});

test('searchPlatformCatalog finds matches across multiple platform sections', () => {
  const results = searchPlatformCatalog('TypeScript');
  assert.ok(results.length >= 2);
  const types = new Set(results.map((r) => r.sectionType));
  assert.ok(types.has('Course') || types.has('AI Assistant') || types.has('Marketplace'));
});

test('analyzeTextMetrics computes word, character, and sentence counts', () => {
  const metrics = analyzeTextMetrics('Dream. Create. Grow! Welcome to Falylio Yara.');
  assert.equal(metrics.words, 7);
  assert.equal(metrics.sentences, 4);
  assert.equal(metrics.readingTimeMinutes, 1);
});

test('calculateInvoiceSummary computes subtotal, discount, tax, and grand total', () => {
  const res = calculateInvoiceSummary(
    [
      { description: 'UI Design', quantity: 2, unitPrice: 100 },
      { description: 'Development', quantity: 1, unitPrice: 300 },
    ],
    10, // 10% tax
    20  // 20% discount
  );
  assert.equal(res.subtotal, 500);
  assert.equal(res.discountAmount, 100);
  assert.equal(res.taxableAmount, 400);
  assert.equal(res.taxAmount, 40);
  assert.equal(res.grandTotal, 440);
});

test('parseHexColor parses 6-digit hex and computes WCAG contrast', () => {
  const navy = parseHexColor('#0F172A');
  assert.equal(navy.valid, true);
  assert.equal(navy.r, 15);
  assert.equal(navy.g, 23);
  assert.equal(navy.b, 42);
  assert.ok(navy.contrastWithWhite > 15);
});

test('evaluateQuizAnswers grades MCQ answers accurately', () => {
  const score = evaluateQuizAnswers(
    [{ correctIndex: 1 }, { correctIndex: 0 }],
    { 0: 1, 1: 0 }
  );
  assert.equal(score.correctCount, 2);
  assert.equal(score.percentage, 100);
  assert.equal(score.passed, true);
});

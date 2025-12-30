import { describe, it, expect } from 'vitest';
import {
  calculateDiversityScore,
  getTopDomains,
  classifySourceSignals,
  extractDateHints,
  type SourceSignal,
} from '../heuristics';
import type { Result } from '../../../shared/types';

const createMockResult = (
  domain: string,
  tags: string[] = ['citation'],
  snippet: string = '',
  title: string = 'Test'
): Result => ({
  id: `id-${domain}`,
  url: `https://${domain}/page`,
  domain,
  title,
  snippet,
  sourceMessageId: 'msg-1',
  sourceNodeSelectorHint: 'a',
  position: 0,
  tags,
});

describe('calculateDiversityScore', () => {
  it('should return 100 for all unique domains', () => {
    const results: Result[] = [
      createMockResult('example.com'),
      createMockResult('test.com'),
      createMockResult('demo.com'),
    ];
    expect(calculateDiversityScore(results)).toBe(100);
  });

  it('should return lower score for duplicate domains', () => {
    const results: Result[] = [
      createMockResult('example.com'),
      createMockResult('example.com'),
      createMockResult('example.com'),
    ];
    expect(calculateDiversityScore(results)).toBeLessThan(100);
  });

  it('should return 0 for empty results', () => {
    expect(calculateDiversityScore([])).toBe(0);
  });

  it('should calculate score correctly for mixed domains', () => {
    const results: Result[] = [
      createMockResult('example.com'),
      createMockResult('example.com'),
      createMockResult('test.com'),
    ];
    const score = calculateDiversityScore(results);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
    expect(score).toBe(66); // 2 unique / 3 total = 66%
  });
});

describe('getTopDomains', () => {
  it('should return top domains with counts', () => {
    const results: Result[] = [
      createMockResult('example.com'),
      createMockResult('example.com'),
      createMockResult('test.com'),
      createMockResult('demo.com'),
    ];
    const topDomains = getTopDomains(results, 3);
    expect(topDomains.length).toBe(3);
    expect(topDomains[0].domain).toBe('example.com');
    expect(topDomains[0].count).toBe(2);
  });

  it('should respect max count limit', () => {
    const results: Result[] = Array.from({ length: 10 }, (_, i) =>
      createMockResult(`domain${i}.com`)
    );
    const topDomains = getTopDomains(results, 5);
    expect(topDomains.length).toBe(5);
  });

  it('should return empty array for empty results', () => {
    expect(getTopDomains([], 5)).toEqual([]);
  });
});

describe('classifySourceSignals', () => {
  it('should classify as docs-heavy', () => {
    const results: Result[] = [
      createMockResult('docs.example.com', ['doc']),
      createMockResult('developer.test.com', ['developer']),
      createMockResult('github.com', ['doc']),
    ];
    expect(classifySourceSignals(results)).toBe('docs-heavy');
  });

  it('should classify as news-heavy', () => {
    const results: Result[] = [
      createMockResult('news.com', ['news']),
      createMockResult('bbc.com', ['news']),
      createMockResult('example.com', ['news']),
    ];
    expect(classifySourceSignals(results)).toBe('news-heavy');
  });

  it('should classify as forum-heavy', () => {
    const results: Result[] = [
      createMockResult('reddit.com', ['forum']),
      createMockResult('stackoverflow.com', ['forum']),
      createMockResult('example.com', ['forum']),
    ];
    expect(classifySourceSignals(results)).toBe('forum-heavy');
  });

  it('should classify as mixed when no clear majority', () => {
    const results: Result[] = [
      createMockResult('example.com', ['citation']),
      createMockResult('test.com', ['citation']),
    ];
    expect(classifySourceSignals(results)).toBe('mixed');
  });

  it('should return mixed for empty results', () => {
    expect(classifySourceSignals([])).toBe('mixed');
  });

  it('should require 30% threshold', () => {
    const results: Result[] = [
      createMockResult('docs.com', ['doc']),
      createMockResult('example.com', ['citation']),
      createMockResult('test.com', ['citation']),
      createMockResult('demo.com', ['citation']),
    ];
    // 1 out of 4 = 25%, not enough for docs-heavy
    expect(classifySourceSignals(results)).toBe('mixed');
  });
});

describe('extractDateHints', () => {
  it('should extract years from titles and snippets', () => {
    const results: Result[] = [
      createMockResult('example.com', [], 'Published in 2024', 'Article 2024'),
      createMockResult('test.com', [], 'Updated Dec 2025', 'News 2023'),
    ];
    const hints = extractDateHints(results);
    expect(hints.hasHints).toBe(true);
    expect(hints.minYear).toBe(2023);
    expect(hints.maxYear).toBe(2025);
    expect(hints.yearRange).toBe('2023–2025');
  });

  it('should handle single year', () => {
    const results: Result[] = [
      createMockResult('example.com', [], 'Published in 2024', 'Article'),
    ];
    const hints = extractDateHints(results);
    expect(hints.hasHints).toBe(true);
    expect(hints.minYear).toBe(2024);
    expect(hints.maxYear).toBe(2024);
    expect(hints.yearRange).toBe('2024');
  });

  it('should return no hints when no years found', () => {
    const results: Result[] = [
      createMockResult('example.com', [], 'No dates here', 'Article'),
    ];
    const hints = extractDateHints(results);
    expect(hints.hasHints).toBe(false);
  });

  it('should filter out invalid years', () => {
    const results: Result[] = [
      createMockResult('example.com', [], 'Year 1800 and 2100', 'Article'),
    ];
    const hints = extractDateHints(results);
    // Should filter years outside 1900-2100 range
    expect(hints.hasHints).toBe(false);
  });

  it('should handle empty results', () => {
    const hints = extractDateHints([]);
    expect(hints.hasHints).toBe(false);
  });
});


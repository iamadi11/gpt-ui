import { describe, it, expect } from 'vitest';
import { rankResults, getRankedTopResults } from '../rank';
import type { Result } from '../../../shared/types';

const createMockResult = (
  id: string,
  url: string,
  domain: string,
  title: string,
  snippet: string = '',
  tags: string[] = ['citation'],
  position: number = 0
): Result => ({
  id,
  url,
  domain,
  title,
  snippet,
  sourceMessageId: 'msg-1',
  sourceNodeSelectorHint: 'a',
  position,
  tags,
});

describe('rankResults', () => {
  it('should return empty array for empty input', () => {
    expect(rankResults([])).toEqual([]);
  });

  it('should boost documentation domains', () => {
    const results: Result[] = [
      createMockResult('1', 'https://example.com/page', 'example.com', 'Regular Page', 'Some content'),
      createMockResult('2', 'https://docs.example.com/guide', 'docs.example.com', 'Documentation', 'Guide content', ['doc']),
      createMockResult('3', 'https://github.com/user/repo', 'github.com', 'GitHub Repo', 'Code repository', ['doc']),
    ];

    const ranked = rankResults(results, 3);
    expect(ranked.length).toBe(3);
    // Documentation domains should be ranked higher
    expect(ranked[0].domain).toMatch(/docs|github/);
  });

  it('should prefer results with snippets', () => {
    const results: Result[] = [
      createMockResult('1', 'https://example.com/page1', 'example.com', 'Page 1', ''),
      createMockResult('2', 'https://example.com/page2', 'example.com', 'Page 2', 'This is a meaningful snippet with content'),
    ];

    const ranked = rankResults(results, 2);
    expect(ranked[0].snippet.length).toBeGreaterThan(0);
  });

  it('should prefer reasonable title lengths', () => {
    const results: Result[] = [
      createMockResult('1', 'https://example.com/page1', 'example.com', 'A', ''), // Too short
      createMockResult('2', 'https://example.com/page2', 'example.com', 'This is a reasonable title', ''),
      createMockResult('3', 'https://example.com/page3', 'example.com', 'A'.repeat(300), ''), // Too long
    ];

    const ranked = rankResults(results, 3);
    expect(ranked[0].title.length).toBeGreaterThan(5);
    expect(ranked[0].title.length).toBeLessThan(200);
  });

  it('should de-boost tracker URLs', () => {
    const results: Result[] = [
      createMockResult('1', 'https://example.com/page?utm_source=test', 'example.com', 'Tracker URL', ''),
      createMockResult('2', 'https://example.com/clean', 'example.com', 'Clean URL', ''),
    ];

    const ranked = rankResults(results, 2);
    expect(ranked[0].url).not.toContain('utm_source');
  });

  it('should prefer domain diversity', () => {
    const results: Result[] = [
      createMockResult('1', 'https://example.com/page1', 'example.com', 'Page 1'),
      createMockResult('2', 'https://example.com/page2', 'example.com', 'Page 2'),
      createMockResult('3', 'https://other.com/page', 'other.com', 'Other Page'),
    ];

    const ranked = rankResults(results, 3);
    // First result should be from a different domain if possible
    const firstDomain = ranked[0].domain;
    const uniqueDomains = new Set(ranked.map(r => r.domain));
    expect(uniqueDomains.size).toBeGreaterThan(1);
  });

  it('should return top N results', () => {
    const results: Result[] = Array.from({ length: 10 }, (_, i) =>
      createMockResult(`${i}`, `https://example${i}.com/page`, `example${i}.com`, `Page ${i}`, '', ['citation'], i)
    );

    const ranked = rankResults(results, 5);
    expect(ranked.length).toBe(5);
  });
});

describe('getRankedTopResults', () => {
  it('should return top and remaining results separately', () => {
    const results: Result[] = Array.from({ length: 10 }, (_, i) =>
      createMockResult(`${i}`, `https://example${i}.com/page`, `example${i}.com`, `Page ${i}`, '', ['citation'], i)
    );

    const { top, remaining } = getRankedTopResults(results, 6);
    expect(top.length).toBe(6);
    expect(remaining.length).toBe(4);
    expect(top.length + remaining.length).toBe(results.length);
  });

  it('should not duplicate results between top and remaining', () => {
    const results: Result[] = Array.from({ length: 10 }, (_, i) =>
      createMockResult(`${i}`, `https://example${i}.com/page`, `example${i}.com`, `Page ${i}`, '', ['citation'], i)
    );

    const { top, remaining } = getRankedTopResults(results, 6);
    const topIds = new Set(top.map(r => r.id));
    const remainingIds = new Set(remaining.map(r => r.id));

    // No overlap
    topIds.forEach(id => {
      expect(remainingIds.has(id)).toBe(false);
    });
  });

  it('should handle empty results', () => {
    const { top, remaining } = getRankedTopResults([], 6);
    expect(top.length).toBe(0);
    expect(remaining.length).toBe(0);
  });

  it('should handle fewer results than topN', () => {
    const results: Result[] = [
      createMockResult('1', 'https://example.com/page1', 'example.com', 'Page 1'),
      createMockResult('2', 'https://example.com/page2', 'example.com', 'Page 2'),
    ];

    const { top, remaining } = getRankedTopResults(results, 6);
    expect(top.length).toBe(2);
    expect(remaining.length).toBe(0);
  });
});


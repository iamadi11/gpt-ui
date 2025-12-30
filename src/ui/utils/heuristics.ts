/**
 * V3.1: Heuristic analysis for Knowledge Panel
 * All computations are local-only, never persisted
 */

import type { Result } from '../../shared/types';

/**
 * Calculate diversity score (0-100) based on unique domains vs total results
 */
export function calculateDiversityScore(results: Result[]): number {
  if (results.length === 0) {
    return 0;
  }

  const uniqueDomains = new Set(results.map(r => r.domain));
  const diversityRatio = uniqueDomains.size / results.length;

  // Score from 0-100: 100% when all unique, 0% when all same domain
  return Math.round(diversityRatio * 100);
}

/**
 * Get top N domains with counts
 */
export function getTopDomains(results: Result[], n: number = 5): Array<{ domain: string; count: number }> {
  const domainCounts = new Map<string, number>();

  results.forEach(result => {
    domainCounts.set(result.domain, (domainCounts.get(result.domain) || 0) + 1);
  });

  return Array.from(domainCounts.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * Classify source quality signals
 */
export type SourceSignal = 'docs-heavy' | 'news-heavy' | 'forum-heavy' | 'mixed';

export function classifySourceSignals(results: Result[]): SourceSignal {
  if (results.length === 0) {
    return 'mixed';
  }

  const total = results.length;
  let docsCount = 0;
  let newsCount = 0;
  let forumCount = 0;

  results.forEach(result => {
    if (result.tags.includes('doc') || result.tags.includes('developer')) {
      docsCount++;
    }
    if (result.tags.includes('news')) {
      newsCount++;
    }
    if (result.tags.includes('forum')) {
      forumCount++;
    }
  });

  const docsRatio = docsCount / total;
  const newsRatio = newsCount / total;
  const forumRatio = forumCount / total;

  // Threshold: 30% or more
  if (docsRatio >= 0.3) {
    return 'docs-heavy';
  }
  if (newsRatio >= 0.3) {
    return 'news-heavy';
  }
  if (forumRatio >= 0.3) {
    return 'forum-heavy';
  }

  return 'mixed';
}

/**
 * Extract date hints from results (years mentioned in snippets/titles)
 */
export interface DateHint {
  hasHints: boolean;
  minYear?: number;
  maxYear?: number;
  yearRange?: string;
}

export function extractDateHints(results: Result[]): DateHint {
  const years = new Set<number>();
  const yearPattern = /\b(19|20)\d{2}\b/g;

  results.forEach(result => {
    // Check title and snippet
    const textToCheck = `${result.title} ${result.snippet || ''}`;
    const matches = textToCheck.match(yearPattern);

    if (matches) {
      matches.forEach(match => {
        const year = parseInt(match, 10);
        if (year >= 1900 && year <= 2100) {
          years.add(year);
        }
      });
    }
  });

  if (years.size === 0) {
    return { hasHints: false };
  }

  const yearArray = Array.from(years).sort((a, b) => a - b);
  const minYear = yearArray[0];
  const maxYear = yearArray[yearArray.length - 1];

  return {
    hasHints: true,
    minYear,
    maxYear,
    yearRange: minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`,
  };
}

/**
 * Get suggested pins (top-ranked unpinned results)
 */
export function getSuggestedPins(
  results: Result[],
  pinnedIds: Set<string>,
  maxCount: number = 3
): Result[] {
  return results
    .filter(result => !pinnedIds.has(result.id))
    .slice(0, maxCount);
}

/**
 * Get pinned related results
 */
export function getPinnedRelated(
  results: Result[],
  pinnedIds: Set<string>,
  maxCount: number = 5
): Result[] {
  return results
    .filter(result => pinnedIds.has(result.id))
    .slice(0, maxCount);
}


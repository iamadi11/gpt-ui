import type { Result } from '../../shared/types';

/**
 * V3: Smart ranking for top results
 * Scores results locally using only visible data
 * 
 * Scoring factors:
 * - Domain diversity (prefer unique domains)
 * - Snippet existence (has snippet)
 * - Title quality (reasonable length)
 * - Domain tags (boost docs: docs.*, developer.*, github.com, w3.org, mdn)
 * - De-boost trackers/redirects
 */

interface RankedResult extends Result {
  score: number;
}

const DOC_DOMAINS = [
  'docs.',
  'developer.',
  'github.com',
  'w3.org',
  'mdn',
  'stackoverflow.com',
  'developer.mozilla.org',
];

const TRACKER_PATTERNS = [
  /utm_/,
  /ref=/,
  /redirect/,
  /tracking/,
];

/**
 * Calculate score for a single result
 */
function calculateScore(result: Result, _seenDomains: Set<string>, isUniqueDomain: boolean): number {
  let score = 0;
  
  // Domain diversity boost (+20 if unique domain in top results)
  if (isUniqueDomain) {
    score += 20;
  }
  
  // Snippet existence (+15 if snippet exists and meaningful)
  if (result.snippet && result.snippet.length > 20 && !result.snippet.startsWith('Content from')) {
    score += 15;
  }
  
  // Title quality (+10 if reasonable length, -5 if too short/long)
  const titleLength = result.title.length;
  if (titleLength >= 10 && titleLength <= 100) {
    score += 10;
  } else if (titleLength < 5 || titleLength > 200) {
    score -= 5;
  }
  
  // Domain tag boost: docs get +25
  const domainLower = result.domain.toLowerCase();
  if (DOC_DOMAINS.some(pattern => domainLower.includes(pattern))) {
    score += 25;
  } else if (result.tags.includes('doc')) {
    score += 20;
  }
  
  // Tag boosts (smaller than docs)
  if (result.tags.includes('news')) {
    score += 5;
  }
  
  // De-boost trackers/redirects
  if (TRACKER_PATTERNS.some(pattern => pattern.test(result.url))) {
    score -= 15;
  }
  
  // De-boost very short domains (likely redirects)
  if (result.domain.length < 5) {
    score -= 10;
  }
  
  return score;
}

/**
 * Rank results and return top N with scores
 * Preserves original order for non-ranked results
 */
export function rankResults(results: Result[], topN: number = 6): RankedResult[] {
  if (results.length === 0) {
    return [];
  }
  
  // Track domain diversity
  const seenDomains = new Set<string>();
  
  // Calculate scores for all results
  const ranked: RankedResult[] = results.map((result) => {
    const isUniqueDomain = !seenDomains.has(result.domain);
    if (isUniqueDomain) {
      seenDomains.add(result.domain);
    }
    
    const score = calculateScore(result, seenDomains, isUniqueDomain);
    
    return {
      ...result,
      score,
    };
  });
  
  // Sort by score (descending), then by original position
  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.position - b.position;
  });
  
  // Return top N
  return ranked.slice(0, topN);
}

/**
 * Get ranked top results and remaining results separately
 */
export function getRankedTopResults(results: Result[], topN: number = 6): {
  top: RankedResult[];
  remaining: Result[];
} {
  if (results.length === 0) {
    return { top: [], remaining: [] };
  }
  
  const ranked = rankResults(results, topN);
  const topIds = new Set(ranked.map(r => r.id));
  const remaining = results.filter(r => !topIds.has(r.id));
  
  return {
    top: ranked,
    remaining,
  };
}


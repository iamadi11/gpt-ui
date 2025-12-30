/**
 * V3.1: Keyword extraction and highlighting utilities
 * All processing is local-only, in-memory, never persisted
 */

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
  'had', 'what', 'said', 'each', 'which', 'she', 'do', 'how', 'their',
  'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
  'would', 'make', 'like', 'into', 'him', 'time', 'has', 'look', 'two',
  'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people',
  'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'sit',
  'now', 'find', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part',
]);

/**
 * Extract keywords from text by tokenizing and removing stopwords
 */
export function extractKeywords(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Tokenize: split by non-word characters, convert to lowercase
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2); // Minimum 3 characters

  // Remove stopwords and duplicates
  const keywords = Array.from(new Set(tokens.filter(token => !STOPWORDS.has(token))));

  return keywords.slice(0, 20); // Limit to top 20 keywords
}

/**
 * Highlight keywords in text (returns HTML string with <mark> tags)
 * Case-insensitive matching
 */
export function highlightKeywords(text: string, keywords: string[]): string {
  if (!text || keywords.length === 0) {
    return text;
  }

  // Create regex pattern from keywords (escape special regex chars)
  const escapedKeywords = keywords
    .filter(kw => kw.length > 0)
    .map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (escapedKeywords.length === 0) {
    return text;
  }

  const pattern = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');

  // Split text and wrap matches
  const parts = text.split(pattern);
  const result: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part && pattern.test(part)) {
      // Re-test since pattern is stateful
      const testPattern = new RegExp(`^${escapedKeywords.join('|')}$`, 'i');
      if (testPattern.test(part)) {
        result.push(`<mark>${escapeHtml(part)}</mark>`);
      } else {
        result.push(escapeHtml(part));
      }
    } else {
      result.push(escapeHtml(part));
    }
  }

  return result.join('');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  // Fallback for Node.js environments (tests)
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Check if text contains any of the keywords (case-insensitive)
 */
export function containsKeywords(text: string, keywords: string[]): boolean {
  if (!text || keywords.length === 0) {
    return false;
  }

  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}


/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Sanitize text (remove extra whitespace, normalize)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract snippet from text around a keyword
 */
export function extractSnippet(text: string, keyword?: string, contextLength: number = 50): string {
  if (!keyword) {
    return truncate(text, 150);
  }
  
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);
  
  if (index === -1) {
    return truncate(text, 150);
  }
  
  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + keyword.length + contextLength);
  let snippet = text.slice(start, end);
  
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return sanitizeText(snippet);
}


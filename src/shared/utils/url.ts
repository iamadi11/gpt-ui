/**
 * Extract domain from URL
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Normalize URL (remove trailing slash, UTM params, etc.)
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common tracking params
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source'];
    paramsToRemove.forEach((param) => {
      urlObj.searchParams.delete(param);
    });
    
    let normalized = urlObj.toString();
    // Remove trailing slash from path
    if (normalized.endsWith('/') && urlObj.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  } catch {
    return url;
  }
}

/**
 * Check if URL is external (not ChatGPT/OpenAI)
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return !hostname.includes('chatgpt.com') && 
           !hostname.includes('openai.com') &&
           !hostname.includes('chat.openai.com');
  } catch {
    return false;
  }
}

/**
 * Get favicon URL for a domain
 */
export function getFaviconUrl(domain: string): string {
  try {
    const urlObj = new URL(`https://${domain}`);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return '';
  }
}


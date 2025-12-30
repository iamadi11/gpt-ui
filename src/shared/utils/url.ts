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
 * Normalize URL for deduplication (remove trailing slash, UTM params, collapse http/https)
 * This version collapses http and https to https for dedupe purposes only.
 * Use normalizeUrlForDisplay() if you need to preserve the original scheme.
 */
export function normalizeUrl(url: string): string {
  try {
    // Ensure we have a protocol
    let urlStr = url;
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'https://' + urlStr;
    }
    
    const urlObj = new URL(urlStr);
    
    // Remove common tracking params
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source', 'fbclid', 'gclid'];
    paramsToRemove.forEach((param) => {
      urlObj.searchParams.delete(param);
    });
    
    // Collapse http to https for deduplication (but keep original URL in Result.url)
    if (urlObj.protocol === 'http:') {
      urlObj.protocol = 'https:';
    }
    
    let normalized = urlObj.toString();
    // Remove trailing slash from path (except root path)
    if (normalized.endsWith('/') && urlObj.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  } catch {
    return url;
  }
}

/**
 * Normalize URL for display (preserve http/https, but still clean params)
 */
export function normalizeUrlForDisplay(url: string): string {
  try {
    let urlStr = url;
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'https://' + urlStr;
    }
    
    const urlObj = new URL(urlStr);
    
    // Remove common tracking params
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source', 'fbclid', 'gclid'];
    paramsToRemove.forEach((param) => {
      urlObj.searchParams.delete(param);
    });
    
    let normalized = urlObj.toString();
    // Remove trailing slash from path (except root path)
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


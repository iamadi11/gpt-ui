import type { SearchResult } from '../shared/types';
import { normalizeUrl, getDomain } from '../shared/utils/url';
import {
  findAssistantMessages,
  hasSearchResults,
  findExternalLinks,
  extractTitleForLink,
  extractSnippetForLink,
} from './selectors';

/**
 * Extract search results from the current page
 */
export function extractResults(): SearchResult[] {
  const results: SearchResult[] = [];
  const seenUrls = new Set<string>();
  
  // Find all assistant messages
  const messages = findAssistantMessages();
  
  // Process each message that has search results
  messages.forEach((message) => {
    const hasResults = hasSearchResults(message);
    
    if (!hasResults) {
      return;
    }
    
    const links = findExternalLinks(message);
    
    links.forEach((link) => {
      try {
        // Try multiple ways to get the URL
        const href = link.getAttribute('href') || link.href || (link as any).getAttribute?.('data-href');
        if (!href) {
          console.log('[GPT-UI] Link has no href:', link);
          return;
        }
        
        const normalizedUrl = normalizeUrl(href);
        
        // Deduplicate by normalized URL
        if (seenUrls.has(normalizedUrl)) {
          return;
        }
        seenUrls.add(normalizedUrl);
        
        const title = extractTitleForLink(link);
        const snippet = extractSnippetForLink(link);
        const domain = getDomain(href);
        
        // Only add if we have meaningful data
        if (title && domain) {
          results.push({
            id: `${normalizedUrl}-${results.length}`,
            title: title,
            url: href, // Keep original URL for opening
            domain: domain,
            snippet: snippet || `Content from ${domain}`,
            position: results.length,
            element: link, // Store reference for highlighting
          });
        }
      } catch (error) {
        // Silently skip invalid links
      }
    });
  });
  
  return results;
}

/**
 * Get the latest assistant message (most recent)
 */
export function getLatestAssistantMessage(): HTMLElement | null {
  const messages = findAssistantMessages();
  // Return the last one (most recent)
  return messages.length > 0 ? messages[messages.length - 1] : null;
}


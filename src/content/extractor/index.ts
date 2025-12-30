import type { Result } from '../../shared/types';
import { normalizeUrl, getDomain } from '../../shared/utils/url';
import { hashUrl } from '../../shared/utils/hash';
import { deriveTags } from '../../shared/utils/tags';
import { generateMessageId, generateSelectorHint, hasSearchResults } from './heuristics';
import { extractSnippet } from './snippet';
import { findAssistantMessages, findExternalLinks, extractTitleForLink } from '../selectors';

/**
 * Extract search results from the current page with improved heuristics
 * Returns Results with all V2 fields
 */
export function extractResults(snippetLength: number = 150): Result[] {
  const results: Result[] = [];
  const seenNormalizedUrls = new Map<string, Result>(); // normalized URL -> first occurrence
  
  // Find all assistant messages
  const messages = findAssistantMessages();
  
  // Process each message that has search results
  messages.forEach((message, messageIndex) => {
    if (!hasSearchResults(message)) {
      return;
    }
    
    const sourceMessageId = generateMessageId(message, messageIndex);
    const links = findExternalLinks(message);
    
    links.forEach((link) => {
      try {
        // Get the URL
        const href = link.getAttribute('href') || link.href || (link as any).getAttribute?.('data-href');
        if (!href || (!href.startsWith('http://') && !href.startsWith('https://'))) {
          return;
        }
        
        // Normalize URL for deduplication (collapses http/https)
        const normalizedUrl = normalizeUrl(href);
        
        // Check if we've seen this normalized URL before
        const existingResult = seenNormalizedUrls.get(normalizedUrl);
        if (existingResult) {
          // Increment duplicate count
          existingResult.duplicateCount = (existingResult.duplicateCount || 1) + 1;
          return; // Skip adding duplicate
        }
        
        // Extract metadata
        const domain = getDomain(href);
        const title = extractTitleForLink(link);
        const snippet = extractSnippet(link, snippetLength);
        const tags = deriveTags(domain, href);
        const sourceNodeSelectorHint = generateSelectorHint(link);
        
        // Generate stable ID from normalized URL
        const id = hashUrl(normalizedUrl);
        
        // Only add if we have meaningful data
        if (title && domain) {
          const result: Result = {
            id,
            url: href, // Keep original URL (preserve http/https)
            domain,
            title,
            snippet: snippet || `Content from ${domain}`,
            sourceMessageId,
            sourceNodeSelectorHint,
            position: results.length,
            tags,
            duplicateCount: 1,
          };
          
          results.push(result);
          seenNormalizedUrls.set(normalizedUrl, result);
        }
      } catch (error) {
        // Silently skip invalid links
        console.debug('[GPT-UI] Error extracting link:', error);
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
  return messages.length > 0 ? messages[messages.length - 1] : null;
}


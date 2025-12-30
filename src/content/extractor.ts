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
  console.log('[GPT-UI] Found', messages.length, 'assistant messages');
  
  // Process each message that has search results
  messages.forEach((message, idx) => {
    // First, let's see what links are in this message
    const allLinksInMessage = message.querySelectorAll('a');
    console.log(`[GPT-UI] Message ${idx}: total <a> tags found:`, allLinksInMessage.length);
    if (allLinksInMessage.length > 0) {
      const sampleLinks = Array.from(allLinksInMessage).slice(0, 5).map(a => ({
        href: a.getAttribute('href') || a.href || 'NO HREF',
        hrefAttr: a.getAttribute('href'),
        hrefProp: a.href,
        text: a.textContent?.slice(0, 50),
        outerHTML: a.outerHTML.slice(0, 200),
      }));
      console.log(`[GPT-UI] Message ${idx}: sample links details:`, sampleLinks);
      
      // Also check all hrefs to see what we're dealing with
      const allHrefs = Array.from(allLinksInMessage).map(a => a.getAttribute('href') || a.href || 'NO HREF');
      const uniqueHrefs = [...new Set(allHrefs)];
      console.log(`[GPT-UI] Message ${idx}: unique hrefs (first 10):`, uniqueHrefs.slice(0, 10));
    }
    
    const hasResults = hasSearchResults(message);
    console.log(`[GPT-UI] Message ${idx}: hasSearchResults=${hasResults}`);
    
    if (!hasResults) {
      return;
    }
    
    const links = findExternalLinks(message);
    console.log(`[GPT-UI] Message ${idx}: found ${links.length} external links after filtering`);
    
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
        console.warn('Error extracting result from link:', error);
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


/**
 * Heuristics for detecting search-like assistant messages
 */

/**
 * Generate a stable ID for a message container
 * Uses a combination of structural attributes and position
 */
export function generateMessageId(message: HTMLElement, index: number): string {
  // Try to find stable identifiers
  const id = message.id;
  if (id) return `msg-${id}`;
  
  const dataId = message.getAttribute('data-id') || message.getAttribute('data-message-id');
  if (dataId) return `msg-${dataId}`;
  
  // Fallback: use position and a hash of first link's URL
  const firstLink = message.querySelector('a[href^="http"]') as HTMLAnchorElement;
  if (firstLink) {
    const href = firstLink.href;
    const hash = href.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    return `msg-${index}-${hash}`;
  }
  
  return `msg-${index}-${Date.now()}`;
}

/**
 * Generate a safe selector hint for highlighting
 * Uses stable attributes when available, falls back to structural hints
 */
export function generateSelectorHint(element: HTMLElement): string {
  // Prefer ID
  if (element.id) {
    return `#${element.id}`;
  }
  
  // Prefer data attributes
  const dataId = element.getAttribute('data-id') || 
                 element.getAttribute('data-message-id') ||
                 element.getAttribute('data-testid');
  if (dataId) {
    return `[data-id="${dataId}"]`;
  }
  
  // Try role attribute
  const role = element.getAttribute('role');
  if (role) {
    return `[role="${role}"]`;
  }
  
  // Fallback: use tag name and approximate position
  const tagName = element.tagName.toLowerCase();
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(element);
    if (index >= 0) {
      return `${tagName}:nth-of-type(${index + 1})`;
    }
  }
  
  return tagName;
}

/**
 * Check if message contains search-like results with improved heuristics
 */
export function hasSearchResults(message: HTMLElement): boolean {
  const text = (message.textContent || '').toLowerCase();
  
  // Check for citation/sources headers (case-insensitive)
  const hasSourcesHeader = /\b(sources?|citations?|references?)\b/i.test(text);
  
  // Find all external links
  const links = message.querySelectorAll('a[href]');
  const externalLinks: HTMLAnchorElement[] = [];
  
  links.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    
    const href = link.getAttribute('href') || link.href || '';
    if (!href.startsWith('http://') && !href.startsWith('https://')) {
      return;
    }
    
    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase();
      const isChatGPT = hostname.includes('chatgpt.com') || 
                        hostname.includes('openai.com');
      if (!isChatGPT) {
        externalLinks.push(link);
      }
    } catch {
      // Invalid URL, skip
    }
  });
  
  // Check for citation-style patterns (numbered/bracketed references)
  const hasCitationPattern = /\[?\d+\]?|\(\d+\)/.test(text) && externalLinks.length > 0;
  
  // Check for multiple links in proximity (citation clusters)
  const linkClusters = detectLinkClusters(externalLinks);
  const hasLinkCluster = linkClusters.length > 0;
  
  // Determine if this is a search-like message:
  // 1. Has sources header AND has external links
  // 2. Has 2+ external links
  // 3. Has citation patterns with links
  // 4. Has substantial text (300+ chars) AND at least 1 external link
  const hasSubstantialText = text.length > 300;
  
  return (hasSourcesHeader && externalLinks.length > 0) ||
         externalLinks.length >= 2 ||
         (hasCitationPattern && externalLinks.length > 0) ||
         (hasLinkCluster && externalLinks.length >= 2) ||
         (hasSubstantialText && externalLinks.length >= 1);
}

/**
 * Detect if links form clusters (indicating citations)
 */
function detectLinkClusters(links: HTMLAnchorElement[]): HTMLAnchorElement[][] {
  if (links.length < 2) return [];
  
  const clusters: HTMLAnchorElement[][] = [];
  const processed = new Set<HTMLAnchorElement>();
  
  links.forEach((link) => {
    if (processed.has(link)) return;
    
    const cluster: HTMLAnchorElement[] = [link];
    processed.add(link);
    
    // Find nearby links (within same parent container or adjacent)
    const linkParent = link.parentElement;
    if (linkParent) {
      links.forEach((otherLink) => {
        if (processed.has(otherLink)) return;
        
        const otherParent = otherLink.parentElement;
        if (otherParent === linkParent || 
            otherParent?.parentElement === linkParent ||
            linkParent?.parentElement === otherParent) {
          cluster.push(otherLink);
          processed.add(otherLink);
        }
      });
    }
    
    if (cluster.length >= 2) {
      clusters.push(cluster);
    }
  });
  
  return clusters;
}


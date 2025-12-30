/**
 * Highlight functionality for scrolling to and highlighting sources in chat
 */

/**
 * Find an element using a selector hint
 */
function findElementBySelectorHint(selectorHint: string, container: HTMLElement = document.body): HTMLElement | null {
  if (!selectorHint) return null;
  
  try {
    // Try to find the element using the selector hint
    if (selectorHint.startsWith('#')) {
      // ID selector
      const id = selectorHint.slice(1);
      // Try in container first, then document
      let element = container.querySelector(`#${id}`);
      if (!element) {
        element = document.getElementById(id);
      }
      if (element instanceof HTMLElement) {
        return element;
      }
    } else if (selectorHint.startsWith('[')) {
      // Attribute selector
      try {
        const element = container.querySelector(selectorHint);
        if (element instanceof HTMLElement) {
          return element;
        }
        // If not found in container, try document
        const docElement = document.querySelector(selectorHint);
        if (docElement instanceof HTMLElement) {
          return docElement;
        }
      } catch (selectorError) {
        // Invalid selector, continue to fallback
      }
    } else {
      // Tag selector (like 'a:nth-of-type(2)' or just 'a')
      try {
        const element = container.querySelector(selectorHint);
        if (element instanceof HTMLElement) {
          return element;
        }
        // If not found in container, try document (but only for simple selectors)
        if (selectorHint.includes(':nth-of-type') || selectorHint === 'a') {
          const docElement = document.querySelector(selectorHint);
          if (docElement instanceof HTMLElement) {
            return docElement;
          }
        }
      } catch (selectorError) {
        // Invalid selector, continue
      }
    }
  } catch (e) {
    console.debug('[GPT-UI] Error finding element by selector:', selectorHint, e);
  }
  
  return null;
}

/**
 * Find the original link element in the chat by searching for the URL
 * Returns the best matching link, prioritizing exact matches
 * Optionally accepts a selector hint to narrow down matches when multiple links have the same URL
 */
function findLinkByUrl(url: string, container: HTMLElement = document.body, selectorHint?: string): HTMLAnchorElement | null {
  try {
    const urlObj = new URL(url);
    const urlWithoutQuery = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    const urlHostPath = `${urlObj.hostname}${urlObj.pathname}`;
    const urlPathname = urlObj.pathname;
    
    const links = container.querySelectorAll('a[href]');
    let exactMatches: HTMLAnchorElement[] = [];
    let pathnameMatches: HTMLAnchorElement[] = [];
    let hostPathMatches: HTMLAnchorElement[] = [];
    
    for (const link of links) {
      if (link instanceof HTMLAnchorElement) {
        const href = link.getAttribute('href') || link.href;
        if (!href) continue;
        
        try {
          const linkUrl = new URL(href, window.location.href);
          const linkWithoutQuery = `${linkUrl.protocol}//${linkUrl.hostname}${linkUrl.pathname}`;
          const linkHostPath = `${linkUrl.hostname}${linkUrl.pathname}`;
          const linkPathname = linkUrl.pathname;
          
          // Priority 1: Exact URL match (with or without query)
          if (href === url || linkWithoutQuery === urlWithoutQuery) {
            exactMatches.push(link);
          }
          // Priority 2: Same hostname + pathname (exact path match)
          else if (linkHostPath === urlHostPath) {
            pathnameMatches.push(link);
          }
          // Priority 3: Same pathname only (fallback)
          else if (linkPathname === urlPathname && linkUrl.hostname === urlObj.hostname) {
            hostPathMatches.push(link);
          }
        } catch {
          // If href is not a valid URL, try simple exact string matching only
          if (href === url) {
            exactMatches.push(link);
          }
        }
      }
    }
    
    // If we have a selector hint and multiple matches, try to narrow it down
    if (selectorHint && (exactMatches.length > 1 || pathnameMatches.length > 1)) {
      const matchesToCheck = exactMatches.length > 0 ? exactMatches : pathnameMatches;
      for (const link of matchesToCheck) {
        // Check if this link matches the selector hint
        try {
          if (selectorHint.startsWith('#')) {
            const id = selectorHint.slice(1);
            if (link.id === id) return link;
          } else if (selectorHint.startsWith('[')) {
            // Try to match attribute selector
            const containerMatches = container.querySelector(selectorHint);
            if (containerMatches === link) return link;
          } else {
            // For tag selectors, check if link matches
            // This is less precise but might help
            const parent = link.parentElement;
            if (parent) {
              const siblings = Array.from(parent.children);
              const index = siblings.indexOf(link);
              if (index >= 0 && selectorHint === `${link.tagName.toLowerCase()}:nth-of-type(${index + 1})`) {
                return link;
              }
            }
          }
        } catch {
          // Selector hint doesn't match, continue
        }
      }
      // If selector hint didn't help, return first match
      return matchesToCheck[0] || null;
    }
    
    // Return best match found (first from best category)
    return exactMatches[0] || pathnameMatches[0] || hostPathMatches[0] || null;
  } catch (e) {
    console.debug('[GPT-UI] Error finding link by URL:', e);
  }
  
  return null;
}

/**
 * Highlight an element in the chat (scroll to it and add temporary outline)
 */
export function highlightInChat(
  sourceNodeSelectorHint: string,
  url: string,
  sourceMessageId?: string
): void {
  let element: HTMLElement | null = null;
  let foundInContainer = false;
  
  // Strategy 1: Try to find element by selector hint within the source message (PREFERRED)
  if (sourceMessageId) {
    const idPart = sourceMessageId.replace('msg-', '');
    // Try multiple selector strategies for message container
    const messageContainer = document.querySelector(`[id*="${idPart}"]`) as HTMLElement ||
                             document.querySelector(`[data-message-id*="${idPart}"]`) as HTMLElement ||
                             document.querySelector(`[data-testid*="${idPart}"]`) as HTMLElement;
    if (messageContainer) {
      // First try selector hint within container (most accurate)
      element = findElementBySelectorHint(sourceNodeSelectorHint, messageContainer);
      if (element) {
        // Verify this element has the correct URL (double-check)
        const elementHref = (element as HTMLAnchorElement).href || (element as HTMLAnchorElement).getAttribute('href');
        if (elementHref && elementHref !== url && !url.includes(elementHref.split('?')[0]) && !elementHref.includes(url.split('?')[0])) {
          // Wrong element, continue searching
          element = null;
        } else {
          foundInContainer = true;
        }
      }
      
      // If selector hint didn't work or found wrong element, try finding link by URL within message container
      // Pass selector hint to help narrow down if multiple links match
      if (!element) {
        element = findLinkByUrl(url, messageContainer, sourceNodeSelectorHint);
        if (element) {
          foundInContainer = true;
        }
      }
    }
  }
  
  // Strategy 2: Only if not found in container, try selector hint in entire document
  // (This is less accurate but better than URL matching across entire document)
  if (!element && sourceNodeSelectorHint && !foundInContainer) {
    element = findElementBySelectorHint(sourceNodeSelectorHint);
    // Verify URL match
    if (element) {
      const elementHref = (element as HTMLAnchorElement).href || (element as HTMLAnchorElement).getAttribute('href');
      if (elementHref && elementHref !== url && !url.includes(elementHref.split('?')[0]) && !elementHref.includes(url.split('?')[0])) {
        element = null;
      }
    }
  }
  
  // Strategy 3: Last resort - find link by URL in entire document
  // Only do this if we have no selector hint or it failed, and we didn't find in container
  // Pass selector hint to help narrow down if multiple links match
  if (!element && !foundInContainer) {
    element = findLinkByUrl(url, document.body, sourceNodeSelectorHint);
  }
  
  if (!element) {
    console.warn('[GPT-UI] Could not find element to highlight:', { sourceNodeSelectorHint, url, sourceMessageId });
    return;
  }
  
  try {
    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add temporary highlight class
    const originalOutline = element.style.outline;
    const originalOutlineOffset = element.style.outlineOffset;
    const originalTransition = element.style.transition;
    
    element.style.outline = '2px solid #1a73e8';
    element.style.outlineOffset = '2px';
    element.style.transition = 'outline 0.2s ease';
    
    // Remove highlight after ~1.2s
    setTimeout(() => {
      if (element) {
        element.style.outline = originalOutline;
        element.style.outlineOffset = originalOutlineOffset;
        setTimeout(() => {
          if (element) {
            element.style.transition = originalTransition;
          }
        }, 200);
      }
    }, 1200);
  } catch (e) {
    console.warn('[GPT-UI] Error highlighting element:', e);
  }
}

/**
 * Highlight multiple sources in chat (for toggle highlight feature)
 */
let highlightState: {
  elements: HTMLElement[];
  originalOutlines: Map<HTMLElement, string>;
  originalOutlineOffsets: Map<HTMLElement, string>;
} | null = null;

export function highlightSources(results: Array<{ sourceNodeSelectorHint: string; url: string; sourceMessageId?: string }>): void {
  // Clear existing highlights
  clearHighlights();
  
  const elements: HTMLElement[] = [];
  const originalOutlines = new Map<HTMLElement, string>();
  const originalOutlineOffsets = new Map<HTMLElement, string>();
  
  results.forEach((result) => {
    let element: HTMLElement | null = null;
    
    // Try to find element
    if (result.sourceMessageId) {
      const idPart = result.sourceMessageId.replace('msg-', '');
      const messageContainer = document.querySelector(`[id*="${idPart}"]`) as HTMLElement;
      if (messageContainer) {
        element = findElementBySelectorHint(result.sourceNodeSelectorHint, messageContainer);
      }
    }
    
    if (!element) {
      element = findElementBySelectorHint(result.sourceNodeSelectorHint);
    }
    
    if (!element) {
      element = findLinkByUrl(result.url);
    }
    
    if (element && !elements.includes(element)) {
      elements.push(element);
      originalOutlines.set(element, element.style.outline);
      originalOutlineOffsets.set(element, element.style.outlineOffset);
      
      element.style.outline = '2px solid #1a73e8';
      element.style.outlineOffset = '2px';
    }
  });
  
  if (elements.length > 0) {
    // Scroll to first element
    elements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    highlightState = {
      elements,
      originalOutlines,
      originalOutlineOffsets,
    };
  }
}

export function clearHighlights(): void {
  if (highlightState) {
    highlightState.elements.forEach((element) => {
      const originalOutline = highlightState!.originalOutlines.get(element) || '';
      const originalOutlineOffset = highlightState!.originalOutlineOffsets.get(element) || '';
      
      element.style.outline = originalOutline;
      element.style.outlineOffset = originalOutlineOffset;
    });
    
    highlightState = null;
  }
}

export function toggleHighlights(results: Array<{ sourceNodeSelectorHint: string; url: string; sourceMessageId?: string }>): boolean {
  if (highlightState) {
    clearHighlights();
    return false;
  } else {
    highlightSources(results);
    return true;
  }
}


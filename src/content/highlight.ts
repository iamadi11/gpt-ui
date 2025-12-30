/**
 * Highlight functionality for scrolling to and highlighting sources in chat
 */

/**
 * Find an element using a selector hint
 */
function findElementBySelectorHint(selectorHint: string, container: HTMLElement = document.body): HTMLElement | null {
  try {
    // Try to find the element using the selector hint
    if (selectorHint.startsWith('#')) {
      // ID selector
      const id = selectorHint.slice(1);
      const element = container.querySelector(`#${id}`) || document.getElementById(id);
      if (element instanceof HTMLElement) {
        return element;
      }
    } else if (selectorHint.startsWith('[')) {
      // Attribute selector
      const element = container.querySelector(selectorHint);
      if (element instanceof HTMLElement) {
        return element;
      }
    } else {
      // Tag selector (like 'a:nth-of-type(2)')
      const element = container.querySelector(selectorHint);
      if (element instanceof HTMLElement) {
        return element;
      }
    }
  } catch (e) {
    console.debug('[GPT-UI] Error finding element by selector:', selectorHint, e);
  }
  
  return null;
}

/**
 * Find the original link element in the chat by searching for the URL
 */
function findLinkByUrl(url: string, container: HTMLElement = document.body): HTMLAnchorElement | null {
  try {
    const links = container.querySelectorAll('a[href]');
    for (const link of links) {
      if (link instanceof HTMLAnchorElement) {
        const href = link.getAttribute('href') || link.href;
        if (href === url || href.includes(url.split('?')[0])) {
          return link;
        }
      }
    }
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
  
  // Strategy 1: Try to find element by selector hint within the source message
  if (sourceMessageId) {
    const idPart = sourceMessageId.replace('msg-', '');
    const messageContainer = document.querySelector(`[id*="${idPart}"]`) as HTMLElement;
    if (messageContainer) {
      element = findElementBySelectorHint(sourceNodeSelectorHint, messageContainer);
    }
  }
  
  // Strategy 2: Try to find by selector hint in entire document
  if (!element) {
    element = findElementBySelectorHint(sourceNodeSelectorHint);
  }
  
  // Strategy 3: Fallback to finding link by URL
  if (!element) {
    element = findLinkByUrl(url);
  }
  
  if (!element) {
    console.debug('[GPT-UI] Could not find element to highlight:', sourceNodeSelectorHint, url);
    return;
  }
  
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


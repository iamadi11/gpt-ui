import { sanitizeText, truncate } from '../../shared/utils/text';

/**
 * Extract a snippet from nearby text nodes for a link
 * Best-effort extraction with configurable length
 */
export function extractSnippet(
  link: HTMLAnchorElement,
  maxLength: number = 150
): string {
  // Strategy 1: Look for parent list item, paragraph, or div with text
  let container: Element | null = link.parentElement;
  let depth = 0;
  const maxDepth = 5;
  
  while (container && depth < maxDepth && container !== document.body) {
    const tagName = container.tagName;
    if (tagName === 'LI' || tagName === 'P' || tagName === 'DIV') {
      const text = container.textContent || '';
      const linkText = link.textContent || '';
      
      // If container has more text than just the link, extract snippet
      if (text.length > linkText.length + 20) {
        // Try to get text that doesn't include the link itself
        const textNodes: string[] = [];
        
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (node.textContent && node.parentElement !== link) {
            textNodes.push(node.textContent);
          }
        }
        
        if (textNodes.length > 0) {
          let snippet = sanitizeText(textNodes.join(' '));
          // Remove link text if it appears
          snippet = snippet.replace(new RegExp(linkText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '').trim();
          
          if (snippet.length > 10) {
            return truncate(snippet, maxLength);
          }
        }
        
        // Fallback: use all text minus link text
        const snippet = sanitizeText(text.replace(new RegExp(linkText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '').trim());
        if (snippet.length > 10) {
          return truncate(snippet, maxLength);
        }
      }
    }
    container = container.parentElement;
    depth++;
  }
  
  // Strategy 2: Look for next sibling text
  let nextSibling = link.nextSibling;
  if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
    const text = nextSibling.textContent?.trim() || '';
    if (text.length > 10) {
      return truncate(sanitizeText(text), maxLength);
    }
  }
  
  // Strategy 3: Look for previous sibling text
  let prevSibling = link.previousSibling;
  if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
    const text = prevSibling.textContent?.trim() || '';
    if (text.length > 10) {
      return truncate(sanitizeText(text), maxLength);
    }
  }
  
  // Strategy 4: Use title attribute if available
  const title = link.getAttribute('title');
  if (title && title.length > 10) {
    return truncate(sanitizeText(title), maxLength);
  }
  
  // Strategy 5: Look for nearby paragraph or div siblings
  const parent = link.parentElement;
  if (parent) {
    let sibling: Element | null = parent.nextElementSibling;
    if (sibling && (sibling.tagName === 'P' || sibling.tagName === 'DIV')) {
      const text = sibling.textContent?.trim() || '';
      if (text.length > 10) {
        return truncate(sanitizeText(text), maxLength);
      }
    }
  }
  
  // Fallback: use domain as snippet
  try {
    const url = new URL(link.href);
    return `Content from ${url.hostname.replace(/^www\./, '')}`;
  } catch {
    return '';
  }
}


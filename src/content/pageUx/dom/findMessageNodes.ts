/**
 * V5: Resilient message node finding using role attributes and structural heuristics
 * Avoids brittle classnames
 */

import { findAssistantMessages } from '../../selectors';

/**
 * Find all assistant message containers using heuristics
 * Returns array of message elements
 */
export function findAllAssistantMessages(container: HTMLElement = document.body): HTMLElement[] {
  return findAssistantMessages(container);
}

/**
 * Find the content area of a message (where the actual text/links are)
 * This is where we'll insert our enhancements
 */
export function findMessageContentArea(messageEl: HTMLElement): HTMLElement | null {
  // Strategy 1: Look for common content containers
  const contentSelectors = [
    '[role="article"]',
    '[class*="message"]',
    '[class*="content"]',
    'div > div', // Generic nested div structure
  ];
  
  for (const selector of contentSelectors) {
    const elements = messageEl.querySelectorAll(selector);
    for (const el of elements) {
      if (el instanceof HTMLElement) {
        // Check if it contains text or links
        const hasContent = el.textContent && el.textContent.trim().length > 50;
        const hasLinks = el.querySelectorAll('a[href^="http"]').length > 0;
        
        if (hasContent || hasLinks) {
          return el;
        }
      }
    }
  }
  
  // Fallback: return the message element itself
  return messageEl;
}

/**
 * Get a stable identifier for a message element
 * Uses existing message ID generation from heuristics
 */
export function getMessageStableId(messageEl: HTMLElement, index: number): string {
  // Import the existing message ID generator
  // Note: This function should be imported at the top of files that use it
  // For now, we'll use a simple implementation here
  const id = messageEl.id;
  if (id) return `msg-${id}`;
  
  const dataId = messageEl.getAttribute('data-id') || messageEl.getAttribute('data-message-id');
  if (dataId) return `msg-${dataId}`;
  
  // Fallback: use position and a hash of first link's URL
  const firstLink = messageEl.querySelector('a[href^="http"]') as HTMLAnchorElement;
  if (firstLink) {
    const href = firstLink.href;
    const hash = href.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    return `msg-${index}-${hash}`;
  }
  
  return `msg-${index}-${Date.now()}`;
}


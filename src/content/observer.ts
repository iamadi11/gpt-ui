import { debounce } from '../shared/utils/debounce';

/**
 * Improved MutationObserver for detecting DOM changes
 * Ignores mutations from our own Shadow DOM
 */

const SHADOW_ROOT_IDS = ['graphgpt-root'];

/**
 * Check if a mutation is from our own Shadow DOM
 */
function isOurMutation(mutation: MutationRecord): boolean {
  const target = mutation.target;
  if (target instanceof Element) {
    // Check if target is inside our shadow root
    const root = target.getRootNode();
    if (root instanceof ShadowRoot && root.host) {
      const host = root.host;
      if (host.id && SHADOW_ROOT_IDS.includes(host.id)) {
        return true;
      }
    }
    
    // Check if target is our root container
    if (target.id && SHADOW_ROOT_IDS.includes(target.id)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Create an observer that watches for DOM changes and calls a callback
 * Automatically ignores mutations from our own Shadow DOM
 */
export function createObserver(
  callback: () => void,
  debounceMs: number = 300,
  rootElement: HTMLElement = document.body
): MutationObserver {
  const debouncedCallback = debounce(callback, debounceMs);
  
  const observer = new MutationObserver((mutations) => {
    // Filter out our own mutations
    const relevantMutations = mutations.filter(mutation => !isOurMutation(mutation));
    
    if (relevantMutations.length > 0) {
      debouncedCallback();
    }
  });
  
  observer.observe(rootElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: false, // Don't watch attribute changes to reduce noise
  });
  
  return observer;
}

/**
 * Find the conversation root element (for more targeted observation)
 */
export function findConversationRoot(): HTMLElement | null {
  // Try multiple strategies to find the conversation container
  const selectors = [
    'main',
    '[role="main"]',
    '[data-testid*="conversation"]',
    'div[class*="conversation"]',
    'div[class*="chat"]',
    'article',
    '[role="article"]',
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element instanceof HTMLElement) {
      return element;
    }
  }
  
  return document.body;
}


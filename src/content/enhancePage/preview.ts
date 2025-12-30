/**
 * V6: Preview management for inline result cards
 * Handles iframe lifecycle, timeout detection, and blocked preview fallbacks
 */

import type { Result } from '../../shared/types';

// In-memory cache of blocked domains/URLs (session-only, not persisted)
const blockedCache = new Map<string, boolean>(); // url or domain -> true if blocked

/**
 * Check if a URL/domain is known to be blocked
 */
export function isBlocked(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    return blockedCache.get(url) === true || blockedCache.get(domain) === true;
  } catch {
    return false;
  }
}

/**
 * Mark a URL/domain as blocked
 */
export function markBlocked(url: string): void {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    blockedCache.set(url, true);
    blockedCache.set(domain, true);
  } catch {
    // Invalid URL, ignore
  }
}

/**
 * Create preview iframe for a result
 */
export function createPreviewIframe(
  result: Result,
  onLoad: () => void,
  onTimeout: () => void,
  timeoutMs: number = 2200
): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  
  // Sandbox attributes for security
  iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin');
  iframe.setAttribute('referrerpolicy', 'no-referrer');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('scrolling', 'no');
  
  // Styling
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.display = 'block';
  iframe.style.background = 'transparent';
  
  // Set source
  iframe.src = result.url;
  
  // Timeout detection
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let loaded = false;
  
  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  // Check if iframe appears blocked after load
  const checkIfBlocked = (): boolean => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) {
        return false; // Can't check cross-origin
      }
      
      const bodyText = iframeDoc.body.innerText?.toLowerCase() || '';
      const htmlContent = iframeDoc.body.innerHTML?.toLowerCase() || '';
      
      // Check for common blocked messages
      const blockedPatterns = [
        'this content is blocked',
        'contact the site owner',
        'x-frame-options',
        'refused to connect',
        'frame-ancestors',
        'clickjacking',
        'displaying a document in a frame'
      ];
      
      const hasBlockedPattern = blockedPatterns.some(pattern => 
        bodyText.includes(pattern) || htmlContent.includes(pattern)
      );
      
      // Also check if content seems too minimal (likely blocked page)
      const isMinimalContent = bodyText.length < 100 && 
                              (bodyText.includes('blocked') || 
                               bodyText.includes('frame') ||
                               bodyText.includes('owner'));
      
      return hasBlockedPattern || isMinimalContent;
    } catch (e) {
      // Cross-origin - can't check, return false (assume it's okay)
      return false;
    }
  };
  
  iframe.addEventListener('load', () => {
    loaded = true;
    cleanup();
    
    // Check immediately if blocked
    setTimeout(() => {
      if (checkIfBlocked()) {
        markBlocked(result.url);
        onTimeout();
      } else {
        onLoad();
      }
    }, 100); // Small delay to let content render
  }, { once: true });
  
  // Also check for error event
  iframe.addEventListener('error', () => {
    loaded = true;
    cleanup();
    markBlocked(result.url);
    onTimeout();
  }, { once: true });
  
  // Start timeout
  timeoutId = setTimeout(() => {
    if (!loaded) {
      markBlocked(result.url);
      onTimeout();
    }
  }, timeoutMs);
  
  // Cleanup on iframe removal
  const observer = new MutationObserver(() => {
    if (!iframe.isConnected) {
      cleanup();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  return iframe;
}

/**
 * Create fallback preview UI (when preview is blocked/unavailable)
 */
export function createPreviewFallback(
  result: Result,
  onOpen: () => void,
  onCopy: () => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'graphgpt-preview-fallback';
  
  try {
    const urlObj = new URL(result.url);
    const domain = urlObj.hostname;
    
    // Get extension ID (works in content scripts)
    const extensionId = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id 
      ? chrome.runtime.id 
      : 'chrome-extension-id';
    
    container.innerHTML = `
      <div class="graphgpt-preview-fallback-content">
        <div class="graphgpt-preview-fallback-icon">
          <img src="chrome-extension://${extensionId}/_favicon/?pageUrl=${encodeURIComponent(result.url)}&size=32" 
               alt="" 
               onerror="this.style.display='none'">
        </div>
        <div class="graphgpt-preview-fallback-text">
          <div class="graphgpt-preview-fallback-domain">${domain}</div>
          <div class="graphgpt-preview-fallback-message">Preview blocked by site policy</div>
        </div>
        <div class="graphgpt-preview-fallback-actions">
          <button class="graphgpt-preview-action-btn" data-action="open">Open</button>
          <button class="graphgpt-preview-action-btn" data-action="copy">Copy link</button>
        </div>
      </div>
    `;
    
    // Attach event handlers
    const openBtn = container.querySelector('[data-action="open"]');
    const copyBtn = container.querySelector('[data-action="copy"]');
    
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpen();
      });
    }
    
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCopy();
      });
    }
  } catch {
    // Fallback for invalid URLs
    container.innerHTML = `
      <div class="graphgpt-preview-fallback-content">
        <div class="graphgpt-preview-fallback-message">Preview unavailable</div>
      </div>
    `;
  }
  
  return container;
}

/**
 * Clear blocked cache (useful for testing or reset)
 */
export function clearBlockedCache(): void {
  blockedCache.clear();
}


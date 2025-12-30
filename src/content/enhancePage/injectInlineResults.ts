/**
 * V4: Inject inline results cards into ChatGPT messages
 * V6: Added preview support
 */

import type { Result } from '../../shared/types';
import type { ExtensionSettings } from '../../shared/types';
import { collapseSourcesSection, findSourcesSection } from './collapseSources';
import { createPreviewIframe, createPreviewFallback, isBlocked } from './preview';

/**
 * Create and inject an inline results container into a message
 */
export function injectInlineResults(
  messageEl: HTMLElement,
  results: Result[],
  settings: ExtensionSettings
): HTMLElement | null {
  // Check if already injected
  const existing = messageEl.querySelector('[data-graphgpt-inline="1"]');
  if (existing) {
    return existing as HTMLElement;
  }
  
  // Only inject if we have at least 2 results
  if (results.length < 2) {
    return null;
  }
  
  // Find insertion point (after message content, or after sources section if found)
  const sourcesSection = findSourcesSection(messageEl);
  let insertAfter: HTMLElement | null = null;
  
  if (sourcesSection) {
    // Insert after sources section
    insertAfter = sourcesSection;
    
    // Collapse sources if enabled
    if (settings.collapseRawSources !== false) {
      collapseSourcesSection(sourcesSection);
    }
  } else {
    // Insert after the main message content
    // Try to find the message content container (not the whole message)
    const messageContent = messageEl.querySelector('[class*="message"], [class*="content"], p, div > div');
    insertAfter = (messageContent as HTMLElement) || messageEl.lastElementChild as HTMLElement || messageEl;
  }
  
  if (!insertAfter) {
    return null;
  }
  
  // Create container
  const container = document.createElement('div');
  container.setAttribute('data-graphgpt-inline', '1');
  container.setAttribute('data-density', settings.inlineLayoutDensity || 'compact');
  
  // Create header
  const header = document.createElement('div');
  header.className = 'graphgpt-inline-header';
  
  const title = document.createElement('h3');
  title.className = 'graphgpt-inline-title';
  title.textContent = 'Enhanced sources';
  
  const count = document.createElement('span');
  count.className = 'graphgpt-inline-count';
  count.textContent = `${results.length} results`;
  
  header.appendChild(title);
  header.appendChild(count);
  container.appendChild(header);
  
  // Create results grid
  const resultsGrid = document.createElement('div');
  resultsGrid.className = 'graphgpt-inline-results';
  
  // V6: Determine which results should show previews
  const previewMode = settings.inlinePreviewMode || 'top3';
  const resultsWithPreviews = previewMode === 'top3' 
    ? results.slice(0, 3) 
    : results; // For lazy mode, we'll use IntersectionObserver
  
  const resultsWithPreviewSet = new Set(resultsWithPreviews.map(r => r.url));
  
  // Create cards for each result
  results.forEach((result) => {
    const shouldShowPreview = resultsWithPreviewSet.has(result.url);
    // For lazy mode, we need to add preview container to all cards, but only load when visible
    const showPreviewContainer = previewMode === 'top3' ? shouldShowPreview : (previewMode === 'lazy');
    const card = createResultCard(result, settings, showPreviewContainer);
    resultsGrid.appendChild(card);
    
    // V6: Lazy load previews using IntersectionObserver for remaining results
    if (previewMode === 'lazy' && showPreviewContainer) {
      const previewContainer = card.querySelector('.graphgpt-preview-container') as HTMLElement;
      if (previewContainer && !isBlocked(result.url)) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              initializePreview(entry.target as HTMLElement, result);
              observer.disconnect();
            }
          });
        }, { rootMargin: '50px' });
        observer.observe(previewContainer);
      }
    }
  });
  
  container.appendChild(resultsGrid);
  
  // Insert container
  if (insertAfter.nextSibling) {
    insertAfter.parentElement?.insertBefore(container, insertAfter.nextSibling);
  } else {
    insertAfter.parentElement?.appendChild(container);
  }
  
  return container;
}

/**
 * Create a result card element
 * V6: Added preview support
 */
function createResultCard(result: Result, settings: ExtensionSettings, shouldShowPreview: boolean = false): HTMLElement {
  const card = document.createElement('div');
  card.className = 'graphgpt-inline-card';
  
  // Get extension ID for favicon
  const extensionId = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id 
    ? chrome.runtime.id 
    : 'chrome-extension-id';
  const faviconUrl = `chrome-extension://${extensionId}/_favicon/?pageUrl=${encodeURIComponent(result.url)}&size=16`;
  const aspectRatio = settings.previewAspectRatio === '4:3' ? '4:3' : '16:9';
  
  // V6: Preview container (if previews enabled)
  if (shouldShowPreview) {
    const previewContainerId = `graphgpt-preview-${Math.random().toString(36).substr(2, 9)}`;
    const previewContainer = document.createElement('div');
    previewContainer.className = 'graphgpt-preview-container';
    previewContainer.setAttribute('data-aspect-ratio', aspectRatio);
    previewContainer.setAttribute('data-preview-url', result.url);
    previewContainer.id = previewContainerId;
    
    const loading = document.createElement('div');
    loading.className = 'graphgpt-preview-loading';
    loading.textContent = 'Loading preview...';
    previewContainer.appendChild(loading);
    
    card.appendChild(previewContainer);
  }
  
  // Header with favicon and title
  const header = document.createElement('div');
  header.className = 'graphgpt-inline-card-header';
  
  // Favicon
  const favicon = document.createElement('img');
  favicon.className = 'graphgpt-inline-favicon';
  favicon.src = faviconUrl;
  favicon.alt = '';
  favicon.onerror = () => {
    // Fallback to empty favicon if loading fails
    favicon.style.display = 'none';
  };
  
  // Title link
  const titleLink = document.createElement('a');
  titleLink.className = 'graphgpt-inline-card-title';
  titleLink.href = result.url;
  titleLink.target = '_blank';
  titleLink.rel = 'noopener noreferrer';
  titleLink.textContent = result.title || result.url;
  
  header.appendChild(favicon);
  header.appendChild(titleLink);
  card.appendChild(header);
  
  // Domain
  const domain = document.createElement('div');
  domain.className = 'graphgpt-inline-card-domain';
  domain.textContent = result.domain;
  card.appendChild(domain);
  
  // Snippet
  if (result.snippet) {
    const snippet = document.createElement('div');
    snippet.className = 'graphgpt-inline-card-snippet';
    snippet.textContent = result.snippet;
    card.appendChild(snippet);
  }
  
  // Actions
  const actions = document.createElement('div');
  actions.className = 'graphgpt-inline-card-actions';
  
  // Open button
  const openBtn = document.createElement('button');
  openBtn.className = 'graphgpt-inline-action-btn';
  openBtn.textContent = 'Open';
  openBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(result.url, '_blank', 'noopener,noreferrer');
  };
  
  // Copy link button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'graphgpt-inline-action-btn';
  copyBtn.textContent = 'Copy link';
  copyBtn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(result.url);
      // Visual feedback (optional - could add toast)
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy link';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };
  
  actions.appendChild(openBtn);
  actions.appendChild(copyBtn);
  card.appendChild(actions);
  
  // V6: Initialize preview if needed (only for top3 mode, lazy mode uses IntersectionObserver)
  const currentPreviewMode = settings.inlinePreviewMode || 'top3';
  if (shouldShowPreview && currentPreviewMode === 'top3') {
    const previewContainer = card.querySelector('.graphgpt-preview-container') as HTMLElement;
    if (previewContainer && !isBlocked(result.url)) {
      initializePreview(previewContainer, result);
    } else if (previewContainer) {
      // Show fallback immediately if blocked
      const fallback = createPreviewFallback(
        result,
        () => window.open(result.url, '_blank', 'noopener,noreferrer'),
        () => navigator.clipboard.writeText(result.url).catch(() => {})
      );
      const loading = previewContainer.querySelector('.graphgpt-preview-loading');
      if (loading) loading.remove();
      previewContainer.appendChild(fallback);
    }
  }
  
  // Make entire card clickable (but not preview area)
  card.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.graphgpt-inline-action-btn') ||
        (e.target as HTMLElement).closest('.graphgpt-preview-container')) {
      return; // Don't trigger card click for buttons/preview
    }
    window.open(result.url, '_blank', 'noopener,noreferrer');
  });
  
  return card;
}

/**
 * V6: Initialize preview iframe or fallback
 */
function initializePreview(container: HTMLElement, result: Result): void {
  const loading = container.querySelector('.graphgpt-preview-loading');
  
  let iframe: HTMLIFrameElement | null = null;
  let fallback: HTMLElement | null = null;
  let checkInterval: ReturnType<typeof setInterval> | null = null;
  
  const showFallback = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    if (loading) loading.remove();
    if (iframe && iframe.parentNode) {
      iframe.remove();
    }
    if (!fallback) {
      fallback = createPreviewFallback(
        result,
        () => window.open(result.url, '_blank', 'noopener,noreferrer'),
        () => navigator.clipboard.writeText(result.url).catch(() => {})
      );
      container.appendChild(fallback);
    }
  };
  
  const onLoad = () => {
    // Preview loaded - remove loading indicator
    if (loading) loading.remove();
    
    // For cross-origin iframes, we can't check content, so we assume it loaded
    // The preview.ts module handles same-origin blocking detection
  };
  
  const onTimeout = () => {
    showFallback();
  };
  
  // Create iframe
  iframe = createPreviewIframe(result, onLoad, onTimeout);
  if (loading) loading.remove();
  container.appendChild(iframe);
}

/**
 * Remove all injected inline containers
 */
export function removeAllInlineContainers(): void {
  const containers = document.querySelectorAll('[data-graphgpt-inline="1"]');
  containers.forEach((container) => {
    container.remove();
  });
}


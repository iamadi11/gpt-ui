/**
 * V4: Inject inline results cards into ChatGPT messages
 */

import type { Result } from '../../shared/types';
import type { ExtensionSettings } from '../../shared/types';
import { collapseSourcesSection, findSourcesSection } from './collapseSources';

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
  
  // Create cards for each result
  results.forEach((result) => {
    const card = createResultCard(result);
    resultsGrid.appendChild(card);
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
 */
function createResultCard(result: Result): HTMLElement {
  const card = document.createElement('div');
  card.className = 'graphgpt-inline-card';
  
  // Header with favicon and title
  const header = document.createElement('div');
  header.className = 'graphgpt-inline-card-header';
  
  // Favicon
  const favicon = document.createElement('img');
  favicon.className = 'graphgpt-inline-favicon';
  favicon.src = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(result.url)}&size=16`;
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
  titleLink.textContent = result.title;
  
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
  
  return card;
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


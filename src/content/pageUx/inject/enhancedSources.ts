/**
 * V5: Inject enhanced sources cards grid into messages
 */

import type { Result } from '../../../shared/types';
import type { PageUxSettings } from '../types';
import { findMessageContentArea } from '../dom/findMessageNodes';

/**
 * Inject enhanced sources block into a message
 */
export function injectEnhancedSources(
  messageEl: HTMLElement,
  results: Result[],
  settings: PageUxSettings
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
  
  // Find insertion point
  const contentArea = findMessageContentArea(messageEl);
  if (!contentArea) {
    return null;
  }
  
  // Create container
  const container = document.createElement('div');
  container.setAttribute('data-graphgpt-inline', '1');
  container.setAttribute('data-density', settings.density || 'compact');
  
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
  
  // Insert container after content area
  if (contentArea.nextSibling) {
    contentArea.parentElement?.insertBefore(container, contentArea.nextSibling);
  } else {
    contentArea.parentElement?.appendChild(container);
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
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      favicon.src = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(result.url)}&size=16`;
    } else {
      favicon.style.display = 'none';
    }
  } catch (e) {
    favicon.style.display = 'none';
  }
  favicon.alt = '';
  favicon.onerror = () => {
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


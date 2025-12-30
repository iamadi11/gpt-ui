/**
 * V4: Enhance Page mode controller
 * Manages inline results injection into ChatGPT messages
 */

import type { Result } from '../../shared/types';
import type { ExtensionSettings } from '../../shared/types';
import { injectInlineResults, removeAllInlineContainers } from './injectInlineResults';
import { uncollapseAllSources } from './collapseSources';
import { findAssistantMessages } from '../selectors';
import { extractResults } from '../extractor';
import { generateMessageId } from '../extractor/heuristics';

// Track injected containers to avoid duplicates
// Use Map instead of WeakMap so we can clear it when disabling
const injectedContainers = new Map<HTMLElement, HTMLElement>();

// Track if enhance mode is enabled
let isEnhanceModeEnabled = false;

// Track if styles are injected
let stylesInjected = false;

/**
 * Load inline styles into document head
 */
function injectStyles(): void {
  if (stylesInjected) {
    return;
  }
  
  const styleId = 'graphgpt-inline-style';
  if (document.getElementById(styleId)) {
    stylesInjected = true;
    return;
  }
  
  // Import styles (they will be bundled, we need to load them)
  // For now, we'll inject the CSS as a string
  // In production, this should be loaded from the CSS file
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = getInlineStylesCSS();
  document.head.appendChild(style);
  
  // Add class to html/body for scoping
  document.documentElement.classList.add('graphgpt-enhanced');
  
  stylesInjected = true;
}

/**
 * Get inline styles CSS as string
 * This should match inlineStyles.css content
 * Note: In production, consider loading this from the CSS file or bundling it
 */
function getInlineStylesCSS(): string {
  // Import the CSS content - for now we'll use a dynamic import approach
  // In a real implementation, this could be bundled via a build step
  // For MV3, we can inject the CSS string directly
  return `
    :root {
      --graphgpt-inline-bg: rgba(255, 255, 255, 0.95);
      --graphgpt-inline-border: rgba(0, 0, 0, 0.1);
      --graphgpt-inline-text: #333;
      --graphgpt-inline-text-secondary: #666;
      --graphgpt-inline-link: #1a73e8;
      --graphgpt-inline-hover: rgba(0, 0, 0, 0.05);
      --graphgpt-inline-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --graphgpt-inline-bg: rgba(32, 33, 35, 0.95);
        --graphgpt-inline-border: rgba(255, 255, 255, 0.1);
        --graphgpt-inline-text: #ececf1;
        --graphgpt-inline-text-secondary: #c5c5d2;
        --graphgpt-inline-link: #8ab4f8;
        --graphgpt-inline-hover: rgba(255, 255, 255, 0.05);
        --graphgpt-inline-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
    }
    [data-graphgpt-inline="1"] {
      margin-top: 16px;
      margin-bottom: 16px;
      padding: 16px;
      background: var(--graphgpt-inline-bg);
      border: 1px solid var(--graphgpt-inline-border);
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--graphgpt-inline-text);
      backdrop-filter: blur(10px);
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--graphgpt-inline-border);
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--graphgpt-inline-text);
      margin: 0;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-count {
      font-size: 12px;
      color: var(--graphgpt-inline-text-secondary);
      margin-left: 8px;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-results {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    [data-graphgpt-inline="1"][data-density="comfortable"] .graphgpt-inline-results {
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    @media (max-width: 600px) {
      [data-graphgpt-inline="1"] .graphgpt-inline-results {
        grid-template-columns: 1fr;
      }
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-card {
      padding: 12px;
      background: var(--graphgpt-inline-bg);
      border: 1px solid var(--graphgpt-inline-border);
      border-radius: 6px;
      transition: box-shadow 0.2s, border-color 0.2s;
      cursor: pointer;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-card:hover {
      box-shadow: var(--graphgpt-inline-card-shadow);
      border-color: var(--graphgpt-inline-link);
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-favicon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      border-radius: 2px;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-card-title {
      font-weight: 500;
      font-size: 14px;
      color: var(--graphgpt-inline-link);
      text-decoration: none;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-card-title:hover {
      text-decoration: underline;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-card-domain {
      font-size: 12px;
      color: var(--graphgpt-inline-text-secondary);
      margin-top: 4px;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-card-snippet {
      font-size: 13px;
      color: var(--graphgpt-inline-text-secondary);
      line-height: 1.4;
      margin-top: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    [data-graphgpt-inline="1"][data-density="comfortable"] .graphgpt-inline-card-snippet {
      -webkit-line-clamp: 3;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-card-actions {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--graphgpt-inline-border);
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-action-btn {
      background: none;
      border: none;
      padding: 4px 8px;
      font-size: 12px;
      color: var(--graphgpt-inline-link);
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;
      font-family: inherit;
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-action-btn:hover {
      background: var(--graphgpt-inline-hover);
    }
    [data-graphgpt-inline="1"] .graphgpt-inline-action-btn:active {
      opacity: 0.7;
    }
    .graphgpt-sources-collapsed {
      display: none;
    }
    .graphgpt-sources-toggle {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 8px;
      font-size: 12px;
      color: var(--graphgpt-inline-link);
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: underline;
      font-family: inherit;
    }
    .graphgpt-sources-toggle:hover {
      opacity: 0.8;
    }
    .graphgpt-sources-toggle:focus {
      outline: 2px solid var(--graphgpt-inline-link);
      outline-offset: 2px;
      border-radius: 2px;
    }
  `;
}

/**
 * Remove inline styles from document
 */
function removeStyles(): void {
  const style = document.getElementById('graphgpt-inline-style');
  if (style) {
    style.remove();
  }
  
  document.documentElement.classList.remove('graphgpt-enhanced');
  stylesInjected = false;
}

/**
 * Group results by message ID
 */
function groupResultsByMessage(results: Result[]): Map<string, Result[]> {
  const grouped = new Map<string, Result[]>();
  
  results.forEach((result) => {
    const messageId = result.sourceMessageId;
    if (!grouped.has(messageId)) {
      grouped.set(messageId, []);
    }
    grouped.get(messageId)!.push(result);
  });
  
  return grouped;
}

/**
 * Find message element by message ID (heuristic)
 * We need to match messages by regenerating their IDs using the same logic as extraction
 */
function findMessageByMessageId(messageId: string): HTMLElement | null {
  const messages = findAssistantMessages();
  
  // Try to match by regenerating message IDs
  for (let index = 0; index < messages.length; index++) {
    const message = messages[index];
    const msgId = generateMessageId(message, index);
    if (msgId === messageId) {
      return message;
    }
  }
  
  return null;
}

/**
 * Apply enhancements to all messages with results
 */
export function applyEnhancementsOnce(
  results: Result[],
  settings: ExtensionSettings
): void {
  if (!isEnhanceModeEnabled) {
    return;
  }
  
  // Inject styles if not already done
  injectStyles();
  
  // Group results by message
  const grouped = groupResultsByMessage(results);
  
  // Apply to each message
  grouped.forEach((messageResults, messageId) => {
    const messageEl = findMessageByMessageId(messageId);
    if (!messageEl) {
      return;
    }
    
    // Check if already injected
    if (injectedContainers.has(messageEl)) {
      return;
    }
    
    // Inject inline results
    const container = injectInlineResults(messageEl, messageResults, settings);
    if (container) {
      injectedContainers.set(messageEl, container);
    }
  });
}

/**
 * Enable enhance mode
 */
export function enableEnhanceMode(settings: ExtensionSettings): void {
  if (isEnhanceModeEnabled) {
    return;
  }
  
  isEnhanceModeEnabled = true;
  
  // Inject styles
  injectStyles();
  
  // Add class to documentElement for scoped styling
  document.documentElement.classList.add('graphgpt-enhanced');
  
  // Apply frost overlay settings to documentElement
  const glassEnabled = settings.glassmorphismEnabled !== false;
  const frostEnabled = settings.frostedOverlaysEnabled !== false && glassEnabled;
  if (frostEnabled) {
    document.documentElement.setAttribute('data-graphgpt-frost-enabled', 'true');
    const frostStyle = settings.frostStyle || 'classic';
    document.documentElement.setAttribute('data-graphgpt-frost-style', frostStyle);
    const frostNoise = settings.frostedNoiseEnabled === true;
    document.documentElement.setAttribute('data-graphgpt-frost-noise', frostNoise ? '1' : '0');
  } else {
    document.documentElement.setAttribute('data-graphgpt-frost-enabled', 'false');
  }
  
  // Extract results and apply
  const results = extractResults(settings.snippetLength || 150);
  applyEnhancementsOnce(results, settings);
}

/**
 * Disable enhance mode and restore page
 */
export function disableEnhanceMode(): void {
  if (!isEnhanceModeEnabled) {
    return;
  }
  
  isEnhanceModeEnabled = false;
  
  // Remove all injected containers
  removeAllInlineContainers();
  
  // Clear tracking map (Map has clear method)
  injectedContainers.clear();
  
  // Un-collapse all sources
  uncollapseAllSources();
  
  // Remove styles
  removeStyles();
}

/**
 * Update frost overlay settings (called when settings change)
 */
export function updateFrostSettings(settings: ExtensionSettings): void {
  if (!isEnhanceModeEnabled) {
    return;
  }
  
  const glassEnabled = settings.glassmorphismEnabled !== false;
  const frostEnabled = settings.frostedOverlaysEnabled !== false && glassEnabled;
  if (frostEnabled) {
    document.documentElement.setAttribute('data-graphgpt-frost-enabled', 'true');
    const frostStyle = settings.frostStyle || 'classic';
    document.documentElement.setAttribute('data-graphgpt-frost-style', frostStyle);
    const frostNoise = settings.frostedNoiseEnabled === true;
    document.documentElement.setAttribute('data-graphgpt-frost-noise', frostNoise ? '1' : '0');
  } else {
    document.documentElement.setAttribute('data-graphgpt-frost-enabled', 'false');
  }
}

/**
 * Toggle enhance mode
 */
export function toggleEnhanceMode(enabled: boolean, settings: ExtensionSettings): void {
  if (enabled) {
    enableEnhanceMode(settings);
  } else {
    disableEnhanceMode();
  }
}

/**
 * Check if enhance mode is enabled
 */
export function isEnhanceModeActive(): boolean {
  return isEnhanceModeEnabled;
}

/**
 * Re-apply enhancements (useful when DOM changes)
 * This should be called debounced from MutationObserver
 */
export function reapplyEnhancements(settings: ExtensionSettings): void {
  if (!isEnhanceModeEnabled) {
    return;
  }
  
  // Clear existing injections (they may be stale)
  removeAllInlineContainers();
  injectedContainers.clear();
  
  // Re-apply
  const results = extractResults(settings.snippetLength || 150);
  applyEnhancementsOnce(results, settings);
}


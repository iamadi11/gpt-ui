import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../ui/App';
import { extractResults } from './extractor';
import { getSettings } from '../shared/storage';
import type { SearchResult, ExtensionSettings } from '../shared/types';
// Import CSS as inline string for shadow DOM injection
// @ts-ignore - Vite handles ?inline
import stylesText from './styles.css?inline';

// Global state
let rootContainer: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let reactRoot: any = null;
let isVisible = false;
let currentResults: SearchResult[] = [];
let currentSettings: ExtensionSettings = {
  enabled: true,
  panelPosition: 'right',
  showGroupedByDomain: true,
};

// Debounce helper
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize the extension
async function init() {
  console.log('[GPT-UI] Initializing extension...');
  
  // Don't reinitialize if already initialized and elements exist
  const existingRoot = document.getElementById('graphgpt-root');
  const existingButton = document.getElementById('gpt-ui-toggle-button');
  if (existingRoot && existingButton && rootContainer && shadowRoot) {
    console.log('[GPT-UI] Already initialized, skipping...');
    return;
  }
  
  // Load settings
  currentSettings = await getSettings();
  console.log('[GPT-UI] Settings loaded:', currentSettings);

  if (!currentSettings.enabled) {
    console.log('[GPT-UI] Extension is disabled');
    return;
  }

  // Create root container if it doesn't exist
  if (!existingRoot) {
    rootContainer = document.createElement('div');
    rootContainer.id = 'graphgpt-root';
    document.body.appendChild(rootContainer);
    console.log('[GPT-UI] Root container created');
  } else {
    rootContainer = existingRoot as HTMLElement;
    console.log('[GPT-UI] Using existing root container');
  }

  // Create shadow DOM if it doesn't exist
  if (!shadowRoot) {
    shadowRoot = rootContainer.attachShadow({ mode: 'open' });
    console.log('[GPT-UI] Shadow DOM created');
  } else {
    console.log('[GPT-UI] Using existing shadow DOM');
  }

  // Inject styles into shadow DOM (only if not already there)
  if (!shadowRoot.querySelector('style')) {
    const styleElement = document.createElement('style');
    styleElement.textContent = stylesText;
    shadowRoot.appendChild(styleElement);
    console.log('[GPT-UI] Styles injected');
  }

  // Create React root container if it doesn't exist
  let reactContainer = shadowRoot.querySelector('div') as HTMLElement;
  if (!reactContainer) {
    reactContainer = document.createElement('div');
    shadowRoot.appendChild(reactContainer);
    console.log('[GPT-UI] React container created');
  }

  // Mount React (recreate root if needed)
  if (!reactRoot) {
    reactRoot = createRoot(reactContainer);
    console.log('[GPT-UI] React root created');
  }
  renderPanel();

  // Create toggle button
  createToggleButton();
  console.log('[GPT-UI] Toggle button created');

  // Set up keyboard shortcut
  setupKeyboardShortcut();

  // Start observing
  startObserving();
  console.log('[GPT-UI] Extension initialized successfully');
}

// Create floating toggle button (in regular DOM, not shadow DOM, so it's always visible)
function createToggleButton() {
  if (!rootContainer) return;

  // Remove existing button if any
  const existingButton = document.getElementById('gpt-ui-toggle-button');
  if (existingButton) {
    existingButton.remove();
  }

  const button = document.createElement('button');
  button.id = 'gpt-ui-toggle-button';
  button.className = 'toggle-button';
  button.textContent = '🔍';
  button.setAttribute('aria-label', 'Toggle Enhanced Results');
  button.title = `GPT-UI: ${currentResults.length} results found (Cmd/Ctrl+Shift+E)`;
  
  // Use addEventListener instead of onclick for better reliability
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[GPT-UI] Button clicked!');
    isVisible = !isVisible;
    console.log('[GPT-UI] Setting panel visible to:', isVisible);
    renderPanel();
    console.log('[GPT-UI] Panel toggled, visible:', isVisible);
  }, true); // Use capture phase to ensure it fires
  
  // Also add mousedown as backup
  button.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[GPT-UI] Button mousedown!');
  }, true);

  // Append to body (not shadow DOM) so it's always visible
  document.body.appendChild(button);
  
  // Inject button styles directly (since it's outside shadow DOM)
  if (!document.getElementById('gpt-ui-toggle-button-styles')) {
    const style = document.createElement('style');
    style.id = 'gpt-ui-toggle-button-styles';
    style.textContent = `
      #gpt-ui-toggle-button {
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        width: 56px !important;
        height: 56px !important;
        border-radius: 50% !important;
        background: #1a73e8 !important;
        color: white !important;
        border: none !important;
        cursor: pointer !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 24px !important;
        z-index: 9999999 !important;
        pointer-events: auto !important;
        transition: background 0.2s, transform 0.2s !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        touch-action: manipulation !important;
      }
      #gpt-ui-toggle-button:hover {
        background: #1557b0 !important;
        transform: scale(1.05) !important;
      }
      #gpt-ui-toggle-button:active {
        transform: scale(0.95) !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Update button title when results change
  const updateButtonTitle = () => {
    if (button) {
      button.title = `GPT-UI: ${currentResults.length} results found (Cmd/Ctrl+Shift+E)`;
    }
  };
  
  // Store update function globally so we can call it
  (window as any).__gpt_ui_updateButton = updateButtonTitle;
  
  console.log('[GPT-UI] Toggle button created and appended to body');
}

// Setup keyboard shortcut (Cmd/Ctrl+Shift+E)
function setupKeyboardShortcut() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      isVisible = !isVisible;
      renderPanel();
    }
  });
}

// Render the panel
function renderPanel() {
  if (!reactRoot) {
    console.log('[GPT-UI] Cannot render panel: reactRoot is null');
    return;
  }

  console.log('[GPT-UI] Rendering panel, isVisible:', isVisible, 'results:', currentResults.length);

  reactRoot.render(
    React.createElement(App, {
      results: currentResults,
      settings: currentSettings,
      isVisible: isVisible,
      onClose: () => {
        console.log('[GPT-UI] Panel close button clicked');
        isVisible = false;
        renderPanel();
      },
      lastUpdated: new Date(),
    })
  );
}

// Extract and update results
const updateResults = debounce(() => {
  if (!currentSettings.enabled) return;

  console.log('[GPT-UI] Extracting results...');
  const newResults = extractResults();
  console.log('[GPT-UI] Found', newResults.length, 'results:', newResults);
  
  // Only update if results changed
  if (JSON.stringify(newResults) !== JSON.stringify(currentResults)) {
    currentResults = newResults;
    console.log('[GPT-UI] Results updated, rendering panel');
    
    // Update button title
    if ((window as any).__gpt_ui_updateButton) {
      (window as any).__gpt_ui_updateButton();
    }
    
    renderPanel();
  }
}, 500);

// Start observing DOM changes
function startObserving() {
  const observer = new MutationObserver(() => {
    // Check if our elements were removed
    const button = document.getElementById('gpt-ui-toggle-button');
    const root = document.getElementById('graphgpt-root');
    
    if (!button && rootContainer) {
      console.log('[GPT-UI] Toggle button was removed, recreating...');
      createToggleButton();
    }
    
    if (!root && rootContainer) {
      console.log('[GPT-UI] Root container was removed, recreating...');
      // Recreate the root container and reinitialize
      init();
      return;
    }
    
    updateResults();
  });

  // Observe the entire document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: false,
  });

  // Also do an initial extraction
  updateResults();

  // Re-extract periodically in case streaming updates are missed
  setInterval(() => {
    updateResults();
  }, 2000);
  
  // Check periodically if elements still exist
  setInterval(() => {
    const button = document.getElementById('gpt-ui-toggle-button');
    const root = document.getElementById('graphgpt-root');
    
    if (!button && rootContainer) {
      console.log('[GPT-UI] Toggle button missing, recreating...');
      createToggleButton();
    }
    
    if (!root && rootContainer) {
      console.log('[GPT-UI] Root container missing, reinitializing...');
      init();
    }
  }, 1000);
}

// Handle settings changes from storage
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes['gpt-ui-settings']) {
      getSettings().then((settings) => {
        currentSettings = settings;
        renderPanel();
      });
    }
  });
}

// Initialize when DOM is ready, and reinitialize after a delay to handle ChatGPT's dynamic loading
function delayedInit() {
  // Wait a bit for ChatGPT to finish loading
  setTimeout(() => {
    init();
  }, 1000);
  
  // Also try after a longer delay
  setTimeout(() => {
    const button = document.getElementById('gpt-ui-toggle-button');
    const root = document.getElementById('graphgpt-root');
    if (!button || !root) {
      console.log('[GPT-UI] Elements missing after delay, reinitializing...');
      init();
    }
  }, 3000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', delayedInit);
} else {
  delayedInit();
}

// Also listen for navigation changes (ChatGPT uses SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('[GPT-UI] URL changed, reinitializing...');
    setTimeout(() => {
      init();
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });


import { extractResults } from './extractor/index';
import { getSettings, setSettings, addSession, updatePin } from '../shared/storage';
import type { Result, ExtensionSettings } from '../shared/types';
import { mountApp } from './mount';
import { createObserver, findConversationRoot } from './observer';
import { highlightInChat, toggleHighlights } from './highlight';
import { detectTheme } from '../ui/theme';
import { hashUrl } from '../shared/utils/hash';
import { normalizeUrl } from '../shared/utils/url';
import { toggleEnhanceMode, reapplyEnhancements, isEnhanceModeActive, updateFrostSettings } from './enhancePage/enhanceController';
import type { ContentScriptMessage } from './enhancePage/types';
// Import CSS as inline string for shadow DOM injection
// @ts-ignore - Vite handles ?inline
import stylesText from './styles.css?inline';

// Global state
let rootContainer: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let reactApp: { root: any; unmount: () => void } | null = null;
let isVisible = false;
let currentResults: Result[] = [];
let currentSettings: ExtensionSettings = {
  enabled: true,
  panelPosition: 'right',
  defaultView: 'top',
  defaultTab: 'results',
  autoOpenPanel: true,
  autoOpenPreview: false,
  highlightSourcesInChat: false,
  snippetLength: 150,
  enableTopRanking: true,
  historyEnabled: true,
};
let domObserver: MutationObserver | null = null;

// Initialize the extension
async function init() {
  // Don't reinitialize if already initialized and elements exist
  const existingRoot = document.getElementById('graphgpt-root');
  const existingButton = document.getElementById('gpt-ui-toggle-button');
  if (existingRoot && existingButton && rootContainer && shadowRoot && reactApp) {
    return;
  }
  
  // Load settings
  currentSettings = await getSettings();

  if (!currentSettings.enabled) {
    return;
  }

  // Create root container if it doesn't exist
  if (!existingRoot) {
    rootContainer = document.createElement('div');
    rootContainer.id = 'graphgpt-root';
    document.body.appendChild(rootContainer);
  } else {
    rootContainer = existingRoot as HTMLElement;
  }

  // Create shadow DOM if it doesn't exist
  if (!shadowRoot) {
    shadowRoot = rootContainer.attachShadow({ mode: 'open' });
  }

  // Apply theme
  const theme = detectTheme();
  shadowRoot.adoptedStyleSheets = [];

  // Inject styles into shadow DOM (only if not already there)
  if (!shadowRoot.querySelector('style')) {
    const styleElement = document.createElement('style');
    styleElement.textContent = stylesText;
    shadowRoot.appendChild(styleElement);
  }

  // Create React root container if it doesn't exist
  let reactContainer = shadowRoot.querySelector('#react-root') as HTMLElement;
  if (!reactContainer) {
    reactContainer = document.createElement('div');
    reactContainer.id = 'react-root';
    shadowRoot.appendChild(reactContainer);
  }

  // Set theme attribute
  reactContainer.setAttribute('data-theme', theme);
  
  // Apply glassmorphism settings
  const glassEnabled = currentSettings.glassmorphismEnabled !== false; // default true
  reactContainer.setAttribute('data-glass-enabled', glassEnabled ? 'true' : 'false');
  
  const glassIntensity = currentSettings.glassIntensity || 'normal';
  reactContainer.setAttribute('data-glass-intensity', glassIntensity);
  
  // Apply frost overlay settings
  const frostEnabled = currentSettings.frostedOverlaysEnabled !== false && glassEnabled;
  reactContainer.setAttribute('data-frost-enabled', frostEnabled ? 'true' : 'false');
  
  const frostStyle = currentSettings.frostStyle || 'classic';
  reactContainer.setAttribute('data-frost-style', frostStyle);
  
  const frostNoise = currentSettings.frostedNoiseEnabled === true && frostEnabled;
  reactContainer.setAttribute('data-frost-noise', frostNoise ? '1' : '0');

  // Mount React app
  if (!reactApp) {
    reactApp = mountApp(shadowRoot, reactContainer, {
      results: currentResults,
      settings: currentSettings,
      isVisible: isVisible,
      onClose: () => {
        isVisible = false;
        renderPanel();
      },
      onSettingsChange: async (settings) => {
        await setSettings(settings);
        currentSettings = settings;
        
        // Update glassmorphism and frost attributes on container immediately
        const reactContainer = shadowRoot?.querySelector('#react-root') as HTMLElement;
        if (reactContainer) {
          const glassEnabled = settings.glassmorphismEnabled !== false;
          reactContainer.setAttribute('data-glass-enabled', glassEnabled ? 'true' : 'false');
          
          const glassIntensity = settings.glassIntensity || 'normal';
          reactContainer.setAttribute('data-glass-intensity', glassIntensity);
          
          const frostEnabled = settings.frostedOverlaysEnabled !== false && glassEnabled;
          reactContainer.setAttribute('data-frost-enabled', frostEnabled ? 'true' : 'false');
          
          const frostStyle = settings.frostStyle || 'classic';
          reactContainer.setAttribute('data-frost-style', frostStyle);
          
          const frostNoise = settings.frostedNoiseEnabled === true && frostEnabled;
          reactContainer.setAttribute('data-frost-noise', frostNoise ? '1' : '0');
        }
        
        // Update frost settings for enhance mode (page UX)
        if (isEnhanceModeActive()) {
          updateFrostSettings(settings);
        }
        
        renderPanel();
      },
      onHighlight: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => {
        highlightInChat(sourceNodeSelectorHint, url, sourceMessageId);
      },
      lastUpdated: new Date(),
      onEnhanceModeToggle: async (enabled: boolean) => {
        // Update settings
        currentSettings = { ...currentSettings, enhancePageEnabled: enabled };
        await setSettings(currentSettings);
        
        // Toggle enhance mode
        toggleEnhanceMode(enabled, currentSettings);
        
        // Re-render panel
        renderPanel();
      },
    });
  } else {
    renderPanel();
  }

  // Create toggle button
  createToggleButton();

  // Set up keyboard shortcuts
  setupKeyboardShortcut();

  // Start observing
  startObserving();
  
  // Initialize enhance mode if enabled (async, don't await)
  initEnhanceMode().catch(console.error);
}

// Create floating toggle button (in regular DOM, not shadow DOM)
function createToggleButton() {
  if (!rootContainer) return;

  // Remove existing button if any
  const existingButton = document.getElementById('gpt-ui-toggle-button');
  if (existingButton) {
    existingButton.remove();
  }

  const button = document.createElement('button');
  button.id = 'gpt-ui-toggle-button';
  button.className = 'gpt-ui-toggle-button';
  button.textContent = '🔍';
  button.setAttribute('aria-label', 'Toggle Enhanced Results');
  button.title = `GPT-UI: ${currentResults.length} results found (Cmd/Ctrl+Shift+E)`;
  button.type = 'button'; // Prevent form submission
  
  // Use both capture and bubble phases to ensure the event fires
  let isHandling = false;
  const handleClick = (e: MouseEvent | TouchEvent) => {
    if (isHandling) return; // Prevent double-firing
    isHandling = true;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    isVisible = !isVisible;
    renderPanel();
    // Reset after a short delay to allow for the next click
    setTimeout(() => {
      isHandling = false;
    }, 100);
  };
  
  // Only use capture phase to avoid double-firing
  button.addEventListener('click', handleClick as EventListener, true);
  button.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  }, true);
  button.addEventListener('touchstart', handleClick as EventListener, { passive: false, capture: true });

  // Append to body (ensure it's at the end to be on top)
  // If body exists, append; otherwise wait for it
  if (document.body) {
    document.body.appendChild(button);
  } else {
    // Fallback: wait for body to be ready
    const observer = new MutationObserver(() => {
      if (document.body) {
        document.body.appendChild(button);
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  }
  
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
        z-index: 2147483647 !important;
        pointer-events: auto !important;
        transition: background 0.2s, transform 0.2s !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        touch-action: manipulation !important;
        outline: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      #gpt-ui-toggle-button:hover {
        background: #1557b0 !important;
        transform: scale(1.05) !important;
      }
      #gpt-ui-toggle-button:active {
        transform: scale(0.95) !important;
        background: #0d47a1 !important;
      }
      #gpt-ui-toggle-button:focus {
        outline: 2px solid #1a73e8 !important;
        outline-offset: 2px !important;
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
  
  (window as any).__gpt_ui_updateButton = updateButtonTitle;
}

// Setup keyboard shortcuts
function setupKeyboardShortcut() {
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl+Shift+E: toggle panel
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      e.stopPropagation();
      isVisible = !isVisible;
      renderPanel();
    }
    
    // Cmd/Ctrl+Shift+H: toggle highlight sources
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      e.stopPropagation();
      toggleHighlights(
        currentResults.map(r => ({
          sourceNodeSelectorHint: r.sourceNodeSelectorHint,
          url: r.url,
          sourceMessageId: r.sourceMessageId,
        }))
      );
    }
  });
}

// Render the panel
function renderPanel() {
  if (!reactApp || !shadowRoot) return;

  // Re-mount with new props
  const reactContainer = shadowRoot.querySelector('#react-root') as HTMLElement;
  if (reactContainer) {
    reactApp.unmount();
    reactApp = mountApp(shadowRoot, reactContainer, {
      results: currentResults,
      settings: currentSettings,
      isVisible: isVisible,
      onClose: () => {
        isVisible = false;
        renderPanel();
      },
      onSettingsChange: async (settings) => {
        await setSettings(settings);
        currentSettings = settings;
        renderPanel();
      },
      onHighlight: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => {
        highlightInChat(sourceNodeSelectorHint, url, sourceMessageId);
      },
      lastUpdated: new Date(),
      onEnhanceModeToggle: async (enabled: boolean) => {
        // Update settings
        currentSettings = { ...currentSettings, enhancePageEnabled: enabled };
        await setSettings(currentSettings);
        
        // Toggle enhance mode
        toggleEnhanceMode(enabled, currentSettings);
        
        // Re-render panel
        renderPanel();
      },
    });
  }
}

// Get a stable hash for the current chat/conversation
function getChatIdHash(): string | undefined {
  try {
    // Try to find conversation ID from URL or DOM
    const url = window.location.href;
    const urlMatch = url.match(/\/c\/([a-f0-9-]+)/);
    if (urlMatch) {
      return hashUrl(urlMatch[1]);
    }
    
    // Try to find from DOM
    const chatIdElement = document.querySelector('[data-conversation-id], [data-chat-id], [id*="conversation"]');
    if (chatIdElement) {
      const id = chatIdElement.getAttribute('data-conversation-id') || 
                 chatIdElement.getAttribute('data-chat-id') ||
                 chatIdElement.id;
      if (id) {
        return hashUrl(id);
      }
    }
    
    // Fallback: hash the entire URL path
    return hashUrl(window.location.pathname);
  } catch {
    return undefined;
  }
}

// Extract and update results
const updateResults = (() => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      if (!currentSettings.enabled) return;

      const newResults = extractResults(currentSettings.snippetLength || 150);
      
      // Only update if results changed (compare by IDs and length)
      const resultsChanged = 
        newResults.length !== currentResults.length ||
        newResults.some((r, i) => r.id !== currentResults[i]?.id);
      
      if (resultsChanged) {
        currentResults = newResults;
        
        // Track session if history enabled
        if (currentSettings.historyEnabled && newResults.length > 0) {
          const chatIdHash = getChatIdHash();
          const topDomains = Array.from(new Set(newResults.map(r => r.domain))).slice(0, 3);
          
          try {
            await addSession({
              chatIdHash,
              resultCount: newResults.length,
              domainsTop: topDomains,
              resultIds: newResults.map(r => r.id),
            });
          } catch (error) {
            console.error('Error adding session:', error);
          }
        }
        
        // Update lastSeenAt for pinned items
        if (newResults.length > 0) {
          try {
            for (const result of newResults) {
              const normalizedUrl = normalizeUrl(result.url);
              const pinId = hashUrl(normalizedUrl);
              // Check if pinned and update lastSeenAt
              // This is best-effort, won't fail if not pinned
              await updatePin(pinId, { lastSeenAt: Date.now() }).catch(() => {
                // Ignore errors (item might not be pinned)
              });
            }
          } catch (error) {
            // Ignore errors in pin updates
            console.debug('Error updating pin timestamps:', error);
          }
        }
        
        // Auto-open panel if enabled and results detected
        if (currentSettings.autoOpenPanel && newResults.length > 0 && !isVisible) {
          isVisible = true;
        }
        
        // Update button title
        if ((window as any).__gpt_ui_updateButton) {
          (window as any).__gpt_ui_updateButton();
        }
        
        // Re-apply enhance mode if enabled
        if (currentSettings.enhancePageEnabled) {
          reapplyEnhancements(currentSettings);
        }
        
        renderPanel();
      }
    }, 300); // Debounce 300ms
  };
})();

// Start observing DOM changes
function startObserving() {
  // Clean up existing observer
  if (domObserver) {
    domObserver.disconnect();
  }

  const conversationRoot = findConversationRoot();
  const callback = () => {
    // Check if our elements were removed
    const button = document.getElementById('gpt-ui-toggle-button');
    const root = document.getElementById('graphgpt-root');
    
    if (!button && rootContainer) {
      createToggleButton();
    }
    
    if (!root && rootContainer) {
      // Recreate the root container and reinitialize
      init();
      return;
    }
    
    updateResults();
  };
  domObserver = createObserver(callback, 300, conversationRoot || document.body);

  // Initial extraction
  updateResults();
}

// Listen for runtime messages from UI to toggle enhance mode
chrome.runtime.onMessage.addListener((message: ContentScriptMessage, _sender, sendResponse) => {
  if (message.type === 'SET_ENHANCE_MODE') {
    toggleEnhanceMode(message.enabled, currentSettings);
    sendResponse({ success: true });
  } else if (message.type === 'SET_ENHANCE_SETTINGS') {
    // Update settings and reapply
    currentSettings = { ...currentSettings, ...message.settings };
    if (currentSettings.enhancePageEnabled) {
      reapplyEnhancements(currentSettings);
    } else {
      // Disable if turned off
      if (isEnhanceModeActive()) {
        toggleEnhanceMode(false, currentSettings);
      }
    }
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});

// Initialize enhance mode if enabled in settings
async function initEnhanceMode() {
  const settings = await getSettings();
  if (settings.enhancePageEnabled) {
    toggleEnhanceMode(true, settings);
  }
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

// Initialize when DOM is ready
function delayedInit() {
  setTimeout(() => {
    init();
  }, 1000);
  
  setTimeout(() => {
    const button = document.getElementById('gpt-ui-toggle-button');
    const root = document.getElementById('graphgpt-root');
    if (!button || !root) {
      init();
    }
  }, 3000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', delayedInit);
} else {
  delayedInit();
}

// Listen for navigation changes (ChatGPT uses SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      init();
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });

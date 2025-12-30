/**
 * Theme system for auto-detecting and applying ChatGPT's theme
 */

export type Theme = 'light' | 'dark';

/**
 * Detect theme from the page
 */
export function detectTheme(): Theme {
  // Strategy 1: Check prefers-color-scheme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // Strategy 2: Check computed background color of body
  try {
    const body = document.body;
    const bgColor = window.getComputedStyle(body).backgroundColor;
    
    // Parse RGB and check if it's dark
    const rgbMatch = bgColor.match(/\d+/g);
    if (rgbMatch && rgbMatch.length >= 3) {
      const r = parseInt(rgbMatch[0], 10);
      const g = parseInt(rgbMatch[1], 10);
      const b = parseInt(rgbMatch[2], 10);
      
      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      if (luminance < 0.5) {
        return 'dark';
      }
    }
  } catch (e) {
    // Fallback to light if detection fails
    console.debug('[GPT-UI] Theme detection error:', e);
  }
  
  return 'light';
}

/**
 * Apply theme to shadow root
 */
export function applyTheme(shadowRoot: ShadowRoot, theme: Theme): void {
  const rootElement = shadowRoot.querySelector(':host') || shadowRoot.firstElementChild;
  if (rootElement) {
    rootElement.setAttribute('data-theme', theme);
  }
  
  // Also set CSS custom property on the root element
  const styleElement = shadowRoot.querySelector('style[data-theme-vars]');
  if (!styleElement) {
    const style = document.createElement('style');
    style.setAttribute('data-theme-vars', '');
    shadowRoot.appendChild(style);
  }
}


import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../ui/App';
import type { Result, ExtensionSettings } from '../shared/types';
import { detectTheme } from '../ui/theme';

/**
 * Mount the React app in Shadow DOM
 */
export function mountApp(
  _shadowRoot: ShadowRoot,
  container: HTMLElement,
  props: {
    results: Result[];
    settings: ExtensionSettings;
    isVisible: boolean;
    onClose: () => void;
    onSettingsChange: (settings: ExtensionSettings) => void;
    onHighlight?: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => void;
    lastUpdated?: Date;
  }
): { root: any; unmount: () => void } {
  // Apply theme
  const theme = detectTheme();
  container.setAttribute('data-theme', theme);
  
  // Create React root and render
  const root = createRoot(container);
  root.render(React.createElement(App, props));
  
  return {
    root,
    unmount: () => {
      root.unmount();
    },
  };
}


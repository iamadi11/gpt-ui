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
    onEnhanceModeToggle?: (enabled: boolean) => void; // V4: Enhance mode toggle callback
  }
): { root: any; unmount: () => void } {
  // Apply theme
  const theme = detectTheme();
  container.setAttribute('data-theme', theme);
  
  // Apply glassmorphism settings
  const glassEnabled = props.settings.glassmorphismEnabled !== false; // default true
  container.setAttribute('data-glass-enabled', glassEnabled ? 'true' : 'false');
  
  const glassIntensity = props.settings.glassIntensity || 'normal';
  container.setAttribute('data-glass-intensity', glassIntensity);
  
  // Apply frost overlay settings
  const frostEnabled = props.settings.frostedOverlaysEnabled !== false && glassEnabled; // default true, only if glass enabled
  container.setAttribute('data-frost-enabled', frostEnabled ? 'true' : 'false');
  
  const frostStyle = props.settings.frostStyle || 'classic';
  container.setAttribute('data-frost-style', frostStyle);
  
  const frostNoise = props.settings.frostedNoiseEnabled === true && frostEnabled; // default false
  container.setAttribute('data-frost-noise', frostNoise ? '1' : '0');
  
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


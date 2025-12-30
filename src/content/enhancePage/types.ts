/**
 * Types for Enhance Page mode (inline UI injection)
 */

export interface EnhancePageSettings {
  enhancePageEnabled: boolean;
  collapseRawSources: boolean;
  inlineLayoutDensity: 'comfortable' | 'compact';
}

export interface InjectedContainer {
  messageElement: HTMLElement;
  containerElement: HTMLElement;
  results: any[]; // Result[] from shared/types
}

/**
 * Message sent from UI to content script to toggle enhance mode
 */
export interface EnhanceModeMessage {
  type: 'SET_ENHANCE_MODE';
  enabled: boolean;
}

/**
 * Message sent from UI to content script to update enhance settings
 */
export interface EnhanceSettingsMessage {
  type: 'SET_ENHANCE_SETTINGS';
  settings: Partial<EnhancePageSettings>;
}

export type ContentScriptMessage = EnhanceModeMessage | EnhanceSettingsMessage;


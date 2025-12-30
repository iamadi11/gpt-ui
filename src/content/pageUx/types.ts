/**
 * Types for Page UX Update mode (V5)
 */

export interface PageUxSettings {
  pageUxEnabled: boolean;
  collapseRawSources: boolean;
  highlightExternalLinks: boolean;
  density: 'compact' | 'comfortable';
  showKnowledgeMiniPanel: boolean;
}

/**
 * Injected parts for a message (tracked to avoid duplicates)
 */
export interface MessageInjectedParts {
  messageElement: HTMLElement;
  headerElement?: HTMLElement;
  enhancedSourcesElement?: HTMLElement;
  sourcesStripElement?: HTMLElement;
  knowledgePanelElement?: HTMLElement;
  citationEnhancements?: Set<HTMLElement>; // Enhanced link elements
  sourcesWrapper?: HTMLElement; // Wrapper around raw sources if collapsed
}

/**
 * Message sent from UI to content script to toggle page UX mode
 */
export interface PageUxModeMessage {
  type: 'SET_PAGE_UX';
  enabled: boolean;
}

/**
 * Message sent from UI to content script to update page UX settings
 */
export interface PageUxSettingsMessage {
  type: 'SET_PAGE_UX_SETTINGS';
  settings: Partial<PageUxSettings>;
}

export type PageUxContentScriptMessage = PageUxModeMessage | PageUxSettingsMessage;


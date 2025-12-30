export interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  position: number;
  element?: HTMLElement; // Reference to original DOM element for highlighting
}

export interface ExtensionSettings {
  enabled: boolean;
  panelPosition: 'right' | 'left';
  showGroupedByDomain: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  panelPosition: 'right',
  showGroupedByDomain: true,
};


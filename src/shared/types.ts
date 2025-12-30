export interface Result {
  id: string; // stable hash of normalized URL
  url: string; // original URL
  domain: string;
  title: string; // best-effort from anchor text + nearby heading
  snippet: string; // best-effort from nearby text nodes, cleaned/truncated
  sourceMessageId: string; // stable id for the assistant message container
  sourceNodeSelectorHint: string; // a safe selector hint for highlight/scroll (not brittle)
  position: number; // position in original extraction order
  tags: string[]; // derived: ["citation","sources-section","news","doc","video","forum"] via domain heuristics
  duplicateCount?: number; // number of times this URL appears (for first occurrence)
}

// Legacy alias for backward compatibility during migration
export type SearchResult = Result;

export interface ExtensionSettings {
  enabled: boolean;
  panelPosition: 'right' | 'left';
  defaultView: 'top' | 'all' | 'grouped';
  autoOpenPanel: boolean;
  highlightSourcesInChat: boolean;
  snippetLength: number; // 120-320 chars
  showGroupedByDomain?: boolean; // legacy, use defaultView instead
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  panelPosition: 'right',
  defaultView: 'top',
  autoOpenPanel: true,
  highlightSourcesInChat: false,
  snippetLength: 150,
  showGroupedByDomain: true, // legacy support
};


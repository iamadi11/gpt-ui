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
  defaultTab: 'results' | 'pins' | 'history';
  autoOpenPanel: boolean;
  autoOpenPreview: boolean; // V3: auto-open preview in split mode
  highlightSourcesInChat: boolean;
  snippetLength: number; // 120-320 chars
  enableTopRanking: boolean; // V3: enable smart ranking for top results
  historyEnabled: boolean; // V3: enable session history
  neverShowQueryContext?: boolean; // V3.1: Never show query context in Knowledge Panel
  showGroupedByDomain?: boolean; // legacy, use defaultView instead
  // V4: Enhance Page mode
  enhancePageEnabled?: boolean; // V4: Enable inline results injection
  collapseRawSources?: boolean; // V4: Collapse raw sources sections
  inlineLayoutDensity?: 'comfortable' | 'compact'; // V4: Layout density for inline results
  // V5: Page UX Update mode (separate from V4 enhance mode)
  pageUxEnabled?: boolean; // V5: Enable comprehensive page UX updates
  highlightExternalLinks?: boolean; // V5: Highlight external links in messages
  showKnowledgeMiniPanel?: boolean; // V5: Show knowledge mini-panel in messages
  // Glassmorphism theme
  glassmorphismEnabled?: boolean; // Enable glassmorphism visual style
  glassIntensity?: 'subtle' | 'normal' | 'strong'; // Glassmorphism blur intensity
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
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
  showGroupedByDomain: true, // legacy support
  // V3.1 defaults
  neverShowQueryContext: false,
  // V4: Enhance Page defaults
  enhancePageEnabled: false,
  collapseRawSources: true,
  inlineLayoutDensity: 'compact',
};

// V3: Pinboard types
export interface PinnedItem {
  id: string; // hash(normalizedUrl)
  url: string;
  title: string;
  domain: string;
  tags: string[]; // derived + user tags
  pinnedAt: number; // epoch
  lastSeenAt: number; // epoch
  sourceChatIdHash?: string; // hashed chat/conversation ID (no raw id stored)
  note?: string; // short user note (max 280 chars)
  folderId?: string; // optional collection folder ID
}

export interface Folder {
  id: string; // uuid
  name: string;
  createdAt: number;
  color?: string; // optional color for UI
}

// V3: Session history types
export interface SessionRecord {
  sessionId: string; // random uuid
  createdAt: number;
  chatIdHash?: string;
  resultCount: number;
  domainsTop: string[]; // top 3 domains
  resultIds: string[]; // hashed URL IDs (no text)
}

// V3: Storage schema version
export const STORAGE_SCHEMA_VERSION = 3;

// V3: Limits
export const MAX_PINS = 2000;
export const MAX_HISTORY_SESSIONS = 50;
export const MAX_CACHE_SIZE = 200;


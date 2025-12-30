import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Result, ExtensionSettings } from '../types';
import { Filters } from './Filters';
import { ResultCard } from './ResultCard';
import { GroupedResults } from './GroupedResults';
import { EmptyState } from './EmptyState';
import { IntentChips, filterByIntent, type IntentType } from './IntentChips';
import { KnowledgePanel } from './KnowledgePanel';
import { ResultSetSwitcher } from './ResultSetSwitcher';
import { ConfirmModal } from './ConfirmModal';
import { getRankedTopResults } from '../../content/extractor/rank';
import { extractKeywords, highlightKeywords } from '../utils/keywords';
import { exportResultsToJSON, exportResultsToMarkdown } from '../utils/export';
import { useInMemoryQueryContext } from '../hooks/useInMemoryQueryContext';
import { useActiveResultSet } from '../hooks/useActiveResultSet';

interface ResultsTabProps {
  results: Result[];
  settings: ExtensionSettings;
  currentMessageId?: string;
  onOpen: (url: string) => void;
  onCopyLink: (url: string) => void;
  onCopyCitation: (citation: string) => void;
  onHighlight: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => void;
  onPin?: (result: Result) => void;
  onPreview?: (result: Result) => void;
  isPinned?: (id: string) => boolean;
  showQueryContext?: boolean;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  results,
  settings,
  currentMessageId,
  onOpen,
  onCopyLink,
  onCopyCitation,
  onHighlight,
  onPin,
  onPreview,
  isPinned,
  showQueryContext = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<IntentType>('all');
  const [sortBy, setSortBy] = useState<'original' | 'domain' | 'title'>('original');
  const [showGrouped, setShowGrouped] = useState(() => 
    settings.defaultView === 'grouped' || settings.showGroupedByDomain === true
  );
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPinAllModal, setShowPinAllModal] = useState(false);
  const [exportIncludeSnippets, setExportIncludeSnippets] = useState(false);
  
  // Use ref for the toggle button to prevent event bubbling issues
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  
  // Add native event listener in capture phase to intercept before React
  useEffect(() => {
    const button = toggleButtonRef.current;
    if (!button) return;
    
    const handleClickCapture = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
    
    // Add capture-phase listener to intercept before any other handlers
    button.addEventListener('click', handleClickCapture, true);
    button.addEventListener('mousedown', handleClickCapture, true);
    
    return () => {
      button.removeEventListener('click', handleClickCapture, true);
      button.removeEventListener('mousedown', handleClickCapture, true);
    };
  }, []);

  // V3.1: Query context (in-memory only) - respect privacy setting
  const shouldShowQueryContext = showQueryContext && !settings.neverShowQueryContext;
  const queryContext = useInMemoryQueryContext(shouldShowQueryContext);

  // V3.1: Active result set management
  const { activeSet, allSets, switchToSet } = useActiveResultSet(
    results,
    currentMessageId
  );

  // Use active set results if available, otherwise use props results
  const displayResults = activeSet?.results || results;

  // V3.1: Extract keywords for highlighting
  const keywords = useMemo(() => {
    if (queryContext) {
      return extractKeywords(queryContext);
    }
    return [];
  }, [queryContext]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    displayResults.forEach((r) => {
      r.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [displayResults]);

  // Get pinned IDs
  const pinnedIds = useMemo(() => {
    const ids = new Set<string>();
    if (isPinned) {
      displayResults.forEach(r => {
        if (isPinned(r.id)) {
          ids.add(r.id);
        }
      });
    }
    return ids;
  }, [displayResults, isPinned]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = displayResults;

    // V3.1: Filter by intent
    filtered = filterByIntent(filtered, selectedIntent);

    // Filter by domain
    if (selectedDomain) {
      filtered = filtered.filter((r) => r.domain === selectedDomain);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.domain.toLowerCase().includes(query) ||
          r.snippet.toLowerCase().includes(query)
      );
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter((r) => r.tags?.includes(selectedTag));
    }

    // Sort
    if (sortBy === 'domain') {
      filtered = [...filtered].sort((a, b) => a.domain.localeCompare(b.domain));
    } else if (sortBy === 'title') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Original order (by position)
      filtered = [...filtered].sort((a, b) => a.position - b.position);
    }

    return filtered;
  }, [displayResults, selectedIntent, selectedDomain, searchQuery, selectedTag, sortBy]);

  // Use ranking if enabled, otherwise simple slice
  const { top, remaining } = useMemo(() => {
    if (settings.enableTopRanking && filteredResults.length > 0) {
      return getRankedTopResults(filteredResults, 6);
    }
    return {
      top: filteredResults.slice(0, 6),
      remaining: filteredResults.slice(6),
    };
  }, [filteredResults, settings.enableTopRanking]);

  // V3.1: Highlight snippets with keywords
  const getHighlightedSnippet = (snippet: string): string => {
    if (keywords.length > 0 && snippet) {
      return highlightKeywords(snippet, keywords);
    }
    return snippet;
  };

  const viewMode = settings.defaultView || 'top';
  const isMobile = window.innerWidth < 900;

  const handleExportResults = (includeSnippets: boolean) => {
    // Show modal to confirm snippet inclusion
    setExportIncludeSnippets(includeSnippets);
    setShowExportModal(true);
  };

  const handleConfirmExport = () => {
    if (exportIncludeSnippets) {
      exportResultsToMarkdown(filteredResults, true);
    } else {
      exportResultsToJSON(filteredResults, false);
    }
    setShowExportModal(false);
  };

  const handlePinAllTopResults = () => {
    setShowPinAllModal(true);
  };

  const handleConfirmPinAll = () => {
    if (onPin) {
      top.forEach(result => {
        if (!isPinned?.(result.id)) {
          onPin(result);
        }
      });
    }
    setShowPinAllModal(false);
  };

  const handleFilterByDomain = (domain: string) => {
    if (selectedDomain === domain) {
      setSelectedDomain(null);
    } else {
      setSelectedDomain(domain);
    }
  };

  return (
    <div className="results-tab">
      {/* V3.1: Result Set Switcher */}
      {allSets.length > 1 && (
        <ResultSetSwitcher
          sets={allSets}
          activeSet={activeSet}
          onSwitch={switchToSet}
        />
      )}

      {/* V3.1: Intent Chips */}
      <IntentChips
        selectedIntent={selectedIntent}
        onIntentChange={setSelectedIntent}
      />

      {displayResults.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={`results-tab-content ${isMobile ? 'mobile' : 'desktop'}`}>
          <div className="results-main">
            {/* V3.1: Clear domain filter button */}
            {selectedDomain && (
              <div className="domain-filter-active">
                <span>Filtered by: {selectedDomain}</span>
                <button
                  className="clear-filter-button"
                  onClick={() => setSelectedDomain(null)}
                  aria-label="Clear domain filter"
                >
                  ×
                </button>
              </div>
            )}

            <Filters
              results={displayResults}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              allTags={allTags}
            />

            {showGrouped ? (
              <GroupedResults
                results={filteredResults}
                onOpen={onOpen}
                onCopyLink={onCopyLink}
                onCopyCitation={onCopyCitation}
                onHighlight={onHighlight}
              />
            ) : (
              <div>
                {/* Top Results Section */}
                {viewMode === 'top' && top.length > 0 && (
                  <div className="results-section">
                    <div className="group-header">Top Results ({top.length})</div>
                    {top.map((result) => (
                      <ResultCard
                        key={result.id}
                        result={result}
                        onOpen={onOpen}
                        onCopyLink={onCopyLink}
                        onCopyCitation={onCopyCitation}
                        onHighlight={onHighlight}
                        onPin={onPin}
                        onPreview={onPreview}
                        onFilterByDomain={handleFilterByDomain}
                        isPinned={isPinned?.(result.id)}
                        highlightedSnippet={getHighlightedSnippet(result.snippet || '')}
                      />
                    ))}
                  </div>
                )}

                {/* All Results Section */}
                {(viewMode === 'all' || (viewMode === 'top' && remaining.length > 0)) && (
                  <div className="results-section">
                    <div className="group-header">
                      {viewMode === 'top'
                        ? `All Results (${filteredResults.length})`
                        : filteredResults.length === displayResults.length
                        ? `All Results (${filteredResults.length})`
                        : `Filtered Results (${filteredResults.length} of ${displayResults.length})`}
                    </div>
                    {(viewMode === 'all' ? filteredResults : remaining).map((result) => (
                      <ResultCard
                        key={result.id}
                        result={result}
                        onOpen={onOpen}
                        onCopyLink={onCopyLink}
                        onCopyCitation={onCopyCitation}
                        onHighlight={onHighlight}
                        onPin={onPin}
                        onPreview={onPreview}
                        onFilterByDomain={handleFilterByDomain}
                        isPinned={isPinned?.(result.id)}
                        highlightedSnippet={getHighlightedSnippet(result.snippet || '')}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View Toggle */}
            <div 
              style={{ marginTop: '16px', textAlign: 'center' }}
            >
              <button
                ref={toggleButtonRef}
                className="sort-button"
                onClick={(e) => {
                  // Aggressively stop all event propagation
                  e.stopPropagation();
                  e.preventDefault();
                  // Update state
                  setShowGrouped((prev) => !prev);
                }}
                onMouseDown={(e) => {
                  // Stop mousedown from bubbling
                  e.stopPropagation();
                  e.preventDefault();
                }}
                style={{ fontSize: '12px' }}
                aria-label={showGrouped ? 'Show flat list' : 'Show grouped by domain'}
                type="button"
              >
                {showGrouped ? 'Show Flat List' : 'Show Grouped by Domain'}
              </button>
            </div>
          </div>

          {/* V3.1: Knowledge Panel (desktop only) */}
          {!isMobile && (
            <div className="knowledge-panel-wrapper">
              <KnowledgePanel
                results={filteredResults}
                pinnedIds={pinnedIds}
                queryContext={queryContext}
                showQueryContext={shouldShowQueryContext}
                onFilterByDomain={handleFilterByDomain}
                onPinResult={onPin}
                onOpenResult={onOpen}
                onExportResults={handleExportResults}
                onPinAllTopResults={handlePinAllTopResults}
              />
            </div>
          )}
        </div>
      )}

      {/* V3.1: Export Confirmation Modal */}
      <ConfirmModal
        isOpen={showExportModal}
        title="Export Results"
        message={exportIncludeSnippets 
          ? "Export results as Markdown (includes snippets from ChatGPT content)?"
          : "Export results as JSON (excludes snippets by default)?"}
        confirmLabel="Export"
        cancelLabel="Cancel"
        onConfirm={handleConfirmExport}
        onCancel={() => setShowExportModal(false)}
      />

      {/* V3.1: Pin All Confirmation Modal */}
      <ConfirmModal
        isOpen={showPinAllModal}
        title="Pin All Top Results"
        message={`Pin all ${top.length} top results?`}
        confirmLabel="Pin All"
        cancelLabel="Cancel"
        onConfirm={handleConfirmPinAll}
        onCancel={() => setShowPinAllModal(false)}
      />
    </div>
  );
};

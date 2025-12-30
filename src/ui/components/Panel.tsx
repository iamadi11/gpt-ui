import React, { useState, useMemo } from 'react';
import type { Result, ExtensionSettings } from '../types';
import { Filters } from './Filters';
import { ResultCard } from './ResultCard';
import { GroupedResults } from './GroupedResults';
import { EmptyState } from './EmptyState';

interface PanelProps {
  results: Result[];
  settings: ExtensionSettings;
  onClose: () => void;
  onOpenSettings?: () => void;
  onHighlight?: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => void;
  lastUpdated?: Date;
}

export const Panel: React.FC<PanelProps> = ({
  results,
  settings,
  onClose,
  onOpenSettings,
  onHighlight,
  lastUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'original' | 'domain' | 'title'>('original');
  const [showGrouped, setShowGrouped] = useState(
    settings.defaultView === 'grouped' || settings.showGroupedByDomain === true
  );

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    results.forEach((r) => {
      r.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [results]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = results;

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
  }, [results, searchQuery, selectedTag, sortBy]);

  // Top results (first 4-6)
  const topResults = useMemo(() => {
    return filteredResults.slice(0, 6);
  }, [filteredResults]);

  // Results beyond top (for "All results" view)
  const remainingResults = useMemo(() => {
    return filteredResults.slice(6);
  }, [filteredResults]);

  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyCitation = async (citation: string) => {
    try {
      await navigator.clipboard.writeText(citation);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  const handleHighlight = (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => {
    if (onHighlight) {
      onHighlight(sourceNodeSelectorHint, url, sourceMessageId);
    }
  };

  const isMobile = window.innerWidth < 900;
  const panelClass = `panel-container ${settings.panelPosition} ${isMobile ? 'bottom-sheet' : ''}`;
  const viewMode = settings.defaultView || 'top';

  return (
    <div className={panelClass}>
      <div className="panel-header">
        <h2 className="panel-title">Enhanced Results</h2>
        <div className="panel-header-actions">
          {onOpenSettings && (
            <button
              className="settings-button-header"
              onClick={onOpenSettings}
              aria-label="Open settings"
              title="Settings"
            >
              ⚙️
            </button>
          )}
          <button className="close-button" onClick={onClose} aria-label="Close panel">
            ×
          </button>
        </div>
      </div>

      <div className="panel-content">
        {results.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Filters
              results={results}
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
                onOpen={handleOpen}
                onCopyLink={handleCopyLink}
                onCopyCitation={handleCopyCitation}
                onHighlight={handleHighlight}
              />
            ) : (
              <div>
                {/* Top Results Section */}
                {viewMode === 'top' && topResults.length > 0 && (
                  <div className="results-section">
                    <div className="group-header">Top Results ({topResults.length})</div>
                    {topResults.map((result) => (
                      <ResultCard
                        key={result.id}
                        result={result}
                        onOpen={handleOpen}
                        onCopyLink={handleCopyLink}
                        onCopyCitation={handleCopyCitation}
                        onHighlight={handleHighlight}
                      />
                    ))}
                  </div>
                )}

                {/* All Results Section */}
                {(viewMode === 'all' || (viewMode === 'top' && remainingResults.length > 0)) && (
                  <div className="results-section">
                    <div className="group-header">
                      {viewMode === 'top'
                        ? `All Results (${filteredResults.length})`
                        : filteredResults.length === results.length
                        ? `All Results (${filteredResults.length})`
                        : `Filtered Results (${filteredResults.length} of ${results.length})`}
                    </div>
                    {(viewMode === 'all' ? filteredResults : remainingResults).map((result) => (
                      <ResultCard
                        key={result.id}
                        result={result}
                        onOpen={handleOpen}
                        onCopyLink={handleCopyLink}
                        onCopyCitation={handleCopyCitation}
                        onHighlight={handleHighlight}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View Toggle */}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                className="sort-button"
                onClick={() => setShowGrouped(!showGrouped)}
                style={{ fontSize: '12px' }}
                aria-label={showGrouped ? 'Show flat list' : 'Show grouped by domain'}
              >
                {showGrouped ? 'Show Flat List' : 'Show Grouped by Domain'}
              </button>
            </div>
          </>
        )}
      </div>

      {lastUpdated && (
        <div className="panel-footer">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <span style={{ marginLeft: '12px' }}>
            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      )}
    </div>
  );
};

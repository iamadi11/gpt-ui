import React, { useState, useMemo } from 'react';
import type { Result, ExtensionSettings } from '../types';
import { Filters } from './Filters';
import { ResultCard } from './ResultCard';
import { GroupedResults } from './GroupedResults';
import { EmptyState } from './EmptyState';
import { getRankedTopResults } from '../../content/extractor/rank';

interface ResultsTabProps {
  results: Result[];
  settings: ExtensionSettings;
  onOpen: (url: string) => void;
  onCopyLink: (url: string) => void;
  onCopyCitation: (citation: string) => void;
  onHighlight: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => void;
  onPin?: (result: Result) => void;
  onPreview?: (result: Result) => void;
  isPinned?: (id: string) => boolean;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  results,
  settings,
  onOpen,
  onCopyLink,
  onCopyCitation,
  onHighlight,
  onPin,
  onPreview,
  isPinned,
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

  const viewMode = settings.defaultView || 'top';

  return (
    <div className="results-tab">
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
                      isPinned={isPinned?.(result.id)}
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
                      : filteredResults.length === results.length
                      ? `All Results (${filteredResults.length})`
                      : `Filtered Results (${filteredResults.length} of ${results.length})`}
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
                      isPinned={isPinned?.(result.id)}
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
  );
};


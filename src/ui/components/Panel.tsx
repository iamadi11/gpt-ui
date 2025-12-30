import React, { useState, useMemo } from 'react';
import type { SearchResult, ExtensionSettings } from '../types';
import { Filters } from './Filters';
import { ResultCard } from './ResultCard';
import { GroupedResults } from './GroupedResults';
import { EmptyState } from './EmptyState';

interface PanelProps {
  results: SearchResult[];
  settings: ExtensionSettings;
  onClose: () => void;
  lastUpdated?: Date;
}

export const Panel: React.FC<PanelProps> = ({
  results,
  settings,
  onClose,
  lastUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'original' | 'domain'>('original');
  const [showGrouped, setShowGrouped] = useState(settings.showGroupedByDomain);

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

    // Filter by domain
    if (selectedDomain) {
      filtered = filtered.filter((r) => r.domain === selectedDomain);
    }

    // Sort
    if (sortBy === 'domain') {
      filtered = [...filtered].sort((a, b) => a.domain.localeCompare(b.domain));
    } else {
      // Original order (by position)
      filtered = [...filtered].sort((a, b) => a.position - b.position);
    }

    return filtered;
  }, [results, searchQuery, selectedDomain, sortBy]);

  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Could show a toast here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyDomain = async (domain: string) => {
    try {
      await navigator.clipboard.writeText(domain);
    } catch (err) {
      console.error('Failed to copy domain:', err);
    }
  };

  const handleHighlight = (element?: HTMLElement) => {
    if (!element) return;

    // Scroll to element
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight temporarily
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#fff3cd';
    element.style.transition = 'background-color 0.3s';

    setTimeout(() => {
      element.style.backgroundColor = originalBg;
      setTimeout(() => {
        element.style.transition = '';
      }, 300);
    }, 2000);
  };

  const isMobile = window.innerWidth < 900;
  const panelClass = `panel-container ${settings.panelPosition} ${isMobile ? 'bottom-sheet' : ''}`;

  return (
    <div className={panelClass}>
      <div className="panel-header">
        <h2 className="panel-title">Enhanced Results</h2>
        <button className="close-button" onClick={onClose} aria-label="Close panel">
          ×
        </button>
      </div>

      <div className="panel-content">
        {results.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Filters
              results={results}
              selectedDomain={selectedDomain}
              onDomainSelect={setSelectedDomain}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {showGrouped ? (
              <GroupedResults
                results={filteredResults}
                onOpen={handleOpen}
                onCopyLink={handleCopyLink}
                onCopyDomain={handleCopyDomain}
                onHighlight={handleHighlight}
              />
            ) : (
              <div>
                <div className="group-header">
                  {filteredResults.length === results.length
                    ? `All Results (${filteredResults.length})`
                    : `Filtered Results (${filteredResults.length} of ${results.length})`}
                </div>
                {filteredResults.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    onOpen={handleOpen}
                    onCopyLink={handleCopyLink}
                    onCopyDomain={handleCopyDomain}
                    onHighlight={handleHighlight}
                  />
                ))}
              </div>
            )}

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                className="sort-button"
                onClick={() => setShowGrouped(!showGrouped)}
                style={{ fontSize: '12px' }}
              >
                {showGrouped ? 'Show Flat List' : 'Show Grouped by Domain'}
              </button>
            </div>
          </>
        )}
      </div>

      {lastUpdated && (
        <div className="panel-footer">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};


import React, { useMemo } from 'react';
import type { Result } from '../types';
import {
  calculateDiversityScore,
  getTopDomains,
  classifySourceSignals,
  extractDateHints,
  getSuggestedPins,
  getPinnedRelated,
  type SourceSignal,
} from '../utils/heuristics';

interface KnowledgePanelProps {
  results: Result[];
  pinnedIds: Set<string>;
  queryContext?: string | null;
  showQueryContext?: boolean;
  onFilterByDomain?: (domain: string) => void;
  onPinResult?: (result: Result) => void;
  onOpenResult?: (url: string) => void;
  onExportResults?: (includeSnippets: boolean) => void;
  onPinAllTopResults?: () => void;
}

export const KnowledgePanel: React.FC<KnowledgePanelProps> = ({
  results,
  pinnedIds,
  queryContext,
  showQueryContext = true,
  onFilterByDomain,
  onPinResult,
  onOpenResult,
  onExportResults,
  onPinAllTopResults,
}) => {
  const diversityScore = useMemo(() => calculateDiversityScore(results), [results]);
  const topDomains = useMemo(() => getTopDomains(results, 5), [results]);
  const sourceSignal = useMemo(() => classifySourceSignals(results), [results]);
  const dateHints = useMemo(() => extractDateHints(results), [results]);
  const suggestedPins = useMemo(() => getSuggestedPins(results, pinnedIds, 3), [results, pinnedIds]);
  const pinnedRelated = useMemo(() => getPinnedRelated(results, pinnedIds, 5), [results, pinnedIds]);

  const getSignalLabel = (signal: SourceSignal): string => {
    switch (signal) {
      case 'docs-heavy':
        return 'Docs-heavy';
      case 'news-heavy':
        return 'News-heavy';
      case 'forum-heavy':
        return 'Forum-heavy';
      case 'mixed':
        return 'Mixed sources';
    }
  };

  const getSignalIcon = (signal: SourceSignal): string => {
    switch (signal) {
      case 'docs-heavy':
        return '📚';
      case 'news-heavy':
        return '📰';
      case 'forum-heavy':
        return '💬';
      case 'mixed':
        return '🔀';
    }
  };

  return (
    <div className="knowledge-panel">
      <div className="knowledge-panel-header">
        <h3 className="knowledge-panel-title">Knowledge Panel</h3>
      </div>

      <div className="knowledge-panel-content">
        {/* Query Context */}
        {showQueryContext && queryContext && (
          <div className="knowledge-section">
            <div className="knowledge-section-label">Query context (not saved)</div>
            <div className="knowledge-section-value query-context">
              {queryContext}
            </div>
          </div>
        )}

        {/* Top Domains */}
        {topDomains.length > 0 && (
          <div className="knowledge-section">
            <div className="knowledge-section-label">
              Top domains
              <span className="knowledge-badge">Diversity: {diversityScore}%</span>
            </div>
            <div className="knowledge-section-value">
              <ul className="domain-list">
                {topDomains.map(({ domain, count }) => (
                  <li key={domain} className="domain-item">
                    <button
                      className="domain-link"
                      onClick={() => onFilterByDomain?.(domain)}
                      aria-label={`Filter by ${domain}`}
                    >
                      {domain}
                    </button>
                    <span className="domain-count">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Source Quality Signals */}
        <div className="knowledge-section">
          <div className="knowledge-section-label">Source quality signals</div>
          <div className="knowledge-section-value">
            <div className="signal-badge">
              <span className="signal-icon">{getSignalIcon(sourceSignal)}</span>
              <span>{getSignalLabel(sourceSignal)}</span>
            </div>
          </div>
        </div>

        {/* Date Hints */}
        {dateHints.hasHints && dateHints.yearRange && (
          <div className="knowledge-section">
            <div className="knowledge-section-label">Has date hints</div>
            <div className="knowledge-section-value">
              <span className="date-range">{dateHints.yearRange}</span>
            </div>
          </div>
        )}

        {/* Pinned Related */}
        {pinnedRelated.length > 0 && (
          <div className="knowledge-section">
            <div className="knowledge-section-label">Pinned related ({pinnedRelated.length})</div>
            <div className="knowledge-section-value">
              <ul className="related-list">
                {pinnedRelated.map(result => (
                  <li key={result.id} className="related-item">
                    <button
                      className="related-link"
                      onClick={() => onOpenResult?.(result.url)}
                      title={result.title}
                    >
                      {result.title}
                    </button>
                    {onPinResult && (
                      <button
                        className="related-pin-button"
                        onClick={() => onPinResult(result)}
                        aria-label="Unpin"
                        title="Unpin"
                      >
                        📌
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Suggested Pins */}
        {suggestedPins.length > 0 && (
          <div className="knowledge-section">
            <div className="knowledge-section-label">Suggested pins</div>
            <div className="knowledge-section-value">
              <ul className="related-list">
                {suggestedPins.map(result => (
                  <li key={result.id} className="related-item">
                    <button
                      className="related-link"
                      onClick={() => onOpenResult?.(result.url)}
                      title={result.title}
                    >
                      {result.title}
                    </button>
                    {onPinResult && (
                      <button
                        className="related-pin-button"
                        onClick={() => onPinResult(result)}
                        aria-label="Pin"
                        title="Pin"
                      >
                        +
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="knowledge-section knowledge-actions">
          {onExportResults && (
            <>
              <button
                className="knowledge-action-button"
                onClick={() => onExportResults(false)}
                aria-label="Export results as JSON"
              >
                Export JSON
              </button>
              <button
                className="knowledge-action-button"
                onClick={() => onExportResults(true)}
                aria-label="Export results as Markdown"
              >
                Export MD
              </button>
            </>
          )}
          {onPinAllTopResults && (
            <button
              className="knowledge-action-button"
              onClick={onPinAllTopResults}
              aria-label="Pin all top results"
            >
              Pin all Top results
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


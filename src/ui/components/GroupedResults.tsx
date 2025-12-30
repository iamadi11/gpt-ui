import React, { useState } from 'react';
import type { Result } from '../types';
import { ResultCard } from './ResultCard';

interface GroupedResultsProps {
  results: Result[];
  onOpen: (url: string) => void;
  onCopyLink: (url: string) => void;
  onCopyCitation: (citation: string) => void;
  onHighlight: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => void;
}

export const GroupedResults: React.FC<GroupedResultsProps> = ({
  results,
  onOpen,
  onCopyLink,
  onCopyCitation,
  onHighlight,
}) => {
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set());

  // Group by domain
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.domain]) {
      acc[result.domain] = [];
    }
    acc[result.domain].push(result);
    return acc;
  }, {} as Record<string, Result[]>);

  const domains = Object.keys(grouped).sort();

  const toggleDomain = (domain: string) => {
    setCollapsedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  };

  return (
    <div className="grouped-section">
      <div className="group-header">Grouped by Domain</div>
      {domains.map((domain) => {
        const isCollapsed = collapsedDomains.has(domain);
        const domainResults = grouped[domain];
        
        return (
          <div key={domain} className="domain-group">
            <button
              className="domain-group-header"
              onClick={() => toggleDomain(domain)}
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${domain}`}
            >
              <span className="domain-group-title">{domain}</span>
              <span className="domain-group-count">({domainResults.length})</span>
              <span className="domain-group-toggle">{isCollapsed ? '▼' : '▲'}</span>
            </button>
            {!isCollapsed && (
              <div className="domain-group-content">
                {domainResults.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    onOpen={onOpen}
                    onCopyLink={onCopyLink}
                    onCopyCitation={onCopyCitation}
                    onHighlight={onHighlight}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import type { SearchResult } from '../types';
import { ResultCard } from './ResultCard';

interface GroupedResultsProps {
  results: SearchResult[];
  onOpen: (url: string) => void;
  onCopyLink: (url: string) => void;
  onCopyDomain: (domain: string) => void;
  onHighlight: (element?: HTMLElement) => void;
}

export const GroupedResults: React.FC<GroupedResultsProps> = ({
  results,
  onOpen,
  onCopyLink,
  onCopyDomain,
  onHighlight,
}) => {
  // Group by domain
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.domain]) {
      acc[result.domain] = [];
    }
    acc[result.domain].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const domains = Object.keys(grouped).sort();

  return (
    <div className="grouped-section">
      <div className="group-header">Grouped by Domain</div>
      {domains.map((domain) => (
        <div key={domain} className="domain-group">
          <div className="domain-group-title">{domain}</div>
          {grouped[domain].map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              onOpen={onOpen}
              onCopyLink={onCopyLink}
              onCopyDomain={onCopyDomain}
              onHighlight={onHighlight}
            />
          ))}
        </div>
      ))}
    </div>
  );
};


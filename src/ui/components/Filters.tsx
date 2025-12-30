import React from 'react';
import type { SearchResult } from '../types';

interface FiltersProps {
  results: SearchResult[];
  selectedDomain: string | null;
  onDomainSelect: (domain: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'original' | 'domain';
  onSortChange: (sort: 'original' | 'domain') => void;
}

export const Filters: React.FC<FiltersProps> = ({
  results,
  selectedDomain,
  onDomainSelect,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  // Get unique domains
  const domains = Array.from(new Set(results.map((r) => r.domain))).sort();

  return (
    <div>
      <input
        type="text"
        className="search-input"
        placeholder="Search in results..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      
      {domains.length > 0 && (
        <div className="filters-container">
          <button
            className={`filter-chip ${selectedDomain === null ? 'active' : ''}`}
            onClick={() => onDomainSelect(null)}
          >
            All ({results.length})
          </button>
          {domains.map((domain) => {
            const count = results.filter((r) => r.domain === domain).length;
            return (
              <button
                key={domain}
                className={`filter-chip ${selectedDomain === domain ? 'active' : ''}`}
                onClick={() => onDomainSelect(domain)}
              >
                {domain} ({count})
              </button>
            );
          })}
        </div>
      )}
      
      <div className="sort-controls">
        <span style={{ fontSize: '12px', color: '#5f6368' }}>Sort:</span>
        <button
          className={`sort-button ${sortBy === 'original' ? 'active' : ''}`}
          onClick={() => onSortChange('original')}
        >
          Original
        </button>
        <button
          className={`sort-button ${sortBy === 'domain' ? 'active' : ''}`}
          onClick={() => onSortChange('domain')}
        >
          Domain
        </button>
      </div>
    </div>
  );
};


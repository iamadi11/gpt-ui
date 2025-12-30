import React from 'react';
import type { Result } from '../types';

interface FiltersProps {
  results: Result[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'original' | 'domain' | 'title';
  onSortChange: (sort: 'original' | 'domain' | 'title') => void;
  allTags: string[];
}

export const Filters: React.FC<FiltersProps> = ({
  results,
  selectedTag,
  onTagSelect,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  allTags,
}) => {
  // Get counts for each tag
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach((r) => {
      r.tags?.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [results]);

  return (
    <div>
      <input
        type="text"
        className="search-input"
        placeholder="Search in results..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search in results"
      />
      
      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="filters-container">
          <button
            className={`filter-chip ${selectedTag === null ? 'active' : ''}`}
            onClick={() => onTagSelect(null)}
            aria-label="Show all results"
          >
            All ({results.length})
          </button>
          {allTags.map((tag) => {
            const count = tagCounts[tag] || 0;
            return (
              <button
                key={tag}
                className={`filter-chip ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => onTagSelect(tag)}
                aria-label={`Filter by ${tag}`}
              >
                {tag} ({count})
              </button>
            );
          })}
        </div>
      )}
      
      {/* Sort Controls */}
      <div className="sort-controls">
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sort:</span>
        <button
          className={`sort-button ${sortBy === 'original' ? 'active' : ''}`}
          onClick={() => onSortChange('original')}
          aria-label="Sort by original order"
        >
          Original
        </button>
        <button
          className={`sort-button ${sortBy === 'domain' ? 'active' : ''}`}
          onClick={() => onSortChange('domain')}
          aria-label="Sort by domain"
        >
          Domain
        </button>
        <button
          className={`sort-button ${sortBy === 'title' ? 'active' : ''}`}
          onClick={() => onSortChange('title')}
          aria-label="Sort by title"
        >
          Title
        </button>
      </div>
    </div>
  );
};

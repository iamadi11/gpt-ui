import React from 'react';
import type { ResultSet } from '../hooks/useActiveResultSet';

interface ResultSetSwitcherProps {
  sets: ResultSet[];
  activeSet: ResultSet | null;
  onSwitch: (setId: string) => void;
}

export const ResultSetSwitcher: React.FC<ResultSetSwitcherProps> = ({
  sets,
  activeSet,
  onSwitch,
}) => {
  if (sets.length <= 1) {
    return null; // Don't show if only one set
  }

  return (
    <div className="result-set-switcher">
      <label className="result-set-label" htmlFor="result-set-select">
        Result set:
      </label>
      <select
        id="result-set-select"
        className="result-set-select"
        value={activeSet?.id || ''}
        onChange={(e) => onSwitch(e.target.value)}
        aria-label="Switch result set"
      >
        {sets.map(set => (
          <option key={set.id} value={set.id}>
            {set.label} ({set.results.length})
          </option>
        ))}
      </select>
    </div>
  );
};


import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🔍</div>
      <div className="empty-state-title">No searchable sources detected</div>
      <div className="empty-state-text">
        No searchable sources detected in the latest assistant response.
        <br />
        Try running a search prompt or open a message with sources.
      </div>
    </div>
  );
};


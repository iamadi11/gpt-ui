import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🔍</div>
      <div className="empty-state-title">No sources detected</div>
      <div className="empty-state-text">
        No sources detected in the latest assistant response.
        <br />
        <br />
        Try asking ChatGPT to search the web and provide sources.
      </div>
    </div>
  );
};


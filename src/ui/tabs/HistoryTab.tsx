import React from 'react';
import { useHistory } from '../hooks/useHistory';
import type { SessionRecord } from '../../shared/types';

interface HistoryTabProps {
  onViewDetails?: (session: SessionRecord) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  onViewDetails,
}) => {
  const { history, loading, clearAll } = useHistory();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all history? This cannot be undone.')) {
      await clearAll();
    }
  };

  if (loading) {
    return <div className="tab-loading">Loading history...</div>;
  }

  return (
    <div className="history-tab">
      <div className="history-header">
        <div className="history-count">{history.length} {history.length === 1 ? 'session' : 'sessions'}</div>
        {history.length > 0 && (
          <button
            className="action-button"
            onClick={handleClearHistory}
            aria-label="Clear history"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="history-content">
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🕒</div>
            <div className="empty-state-title">No history</div>
            <div className="empty-state-text">
              Session history will appear here as you use the extension
            </div>
          </div>
        ) : (
          <div className="history-list">
            {history.map((session) => (
              <div
                key={session.sessionId}
                className="history-item"
                onClick={() => onViewDetails?.(session)}
              >
                <div className="history-item-header">
                  <div className="history-item-time">{formatDate(session.createdAt)}</div>
                  <div className="history-item-count">
                    {session.resultCount} {session.resultCount === 1 ? 'result' : 'results'}
                  </div>
                </div>
                {session.domainsTop.length > 0 && (
                  <div className="history-item-domains">
                    {session.domainsTop.slice(0, 3).join(', ')}
                  </div>
                )}
                {session.resultIds.length > 0 && (
                  <div className="history-item-meta">
                    {session.resultIds.length} URLs tracked
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


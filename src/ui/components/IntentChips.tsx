import React from 'react';

export type IntentType = 'docs' | 'news' | 'video' | 'forums' | 'shopping' | 'research' | 'all';

interface IntentChipsProps {
  selectedIntent: IntentType;
  onIntentChange: (intent: IntentType) => void;
}

const INTENTS: Array<{ type: IntentType; label: string; icon: string }> = [
  { type: 'all', label: 'All', icon: '🔍' },
  { type: 'docs', label: 'Docs', icon: '📚' },
  { type: 'news', label: 'News', icon: '📰' },
  { type: 'video', label: 'Video', icon: '🎥' },
  { type: 'forums', label: 'Forums', icon: '💬' },
  { type: 'shopping', label: 'Shopping', icon: '🛒' },
  { type: 'research', label: 'Research', icon: '🔬' },
];

export const IntentChips: React.FC<IntentChipsProps> = ({
  selectedIntent,
  onIntentChange,
}) => {
  return (
    <div className="intent-chips" role="tablist" aria-label="Filter by intent">
      {INTENTS.map(intent => (
        <button
          key={intent.type}
          className={`intent-chip ${selectedIntent === intent.type ? 'active' : ''}`}
          onClick={() => onIntentChange(intent.type)}
          role="tab"
          aria-selected={selectedIntent === intent.type}
          aria-label={`Filter by ${intent.label}`}
        >
          <span className="intent-icon">{intent.icon}</span>
          <span className="intent-label">{intent.label}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * Filter results by intent type
 */
export function filterByIntent(results: any[], intent: IntentType): any[] {
  if (intent === 'all') {
    return results;
  }

  return results.filter(result => {
    switch (intent) {
      case 'docs':
        return result.tags?.includes('doc') || result.tags?.includes('developer');
      case 'news':
        return result.tags?.includes('news');
      case 'video':
        return result.tags?.includes('video') ||
               result.domain.includes('youtube.com') ||
               result.domain.includes('vimeo.com');
      case 'forums':
        return result.tags?.includes('forum') ||
               result.domain.includes('reddit.com') ||
               result.domain.includes('stackoverflow.com') ||
               result.domain.includes('stackexchange.com') ||
               result.domain.includes('quora.com');
      case 'shopping':
        return result.domain.includes('amazon.') ||
               result.domain.includes('flipkart.com') ||
               result.domain.includes('ebay.com');
      case 'research':
        return result.domain.includes('arxiv.org') ||
               result.domain.includes('ieee.org') ||
               result.domain.includes('acm.org') ||
               result.domain.includes('scholar.google') ||
               result.domain.includes('pubmed.ncbi');
      default:
        return true;
    }
  });
}


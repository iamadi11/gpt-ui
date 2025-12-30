import React, { useState } from 'react';
import type { Result } from '../types';

interface ResultCardProps {
  result: Result;
  onOpen: (url: string) => void;
  onCopyLink: (url: string) => void;
  onCopyCitation: (citation: string) => void;
  onHighlight: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onOpen,
  onCopyLink,
  onCopyCitation,
  onHighlight,
}) => {
  const [faviconError, setFaviconError] = useState(false);
  
  // Use Chrome's internal favicon service
  const faviconUrl = `chrome://favicon2/?size=32&scale_factor=1x&page_url=${encodeURIComponent(result.url)}`;
  const fallbackFavicon = '🌐'; // Generic globe icon as fallback

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpen(result.url);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onCopyLink(result.url);
  };

  const handleCopyCitation = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Format: [title] (domain) - url
    const citation = `[${result.title}] (${result.domain}) - ${result.url}`;
    await onCopyCitation(citation);
  };

  const handleHighlight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHighlight(result.sourceNodeSelectorHint, result.url, result.sourceMessageId);
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <div className="result-favicon-wrapper">
          {!faviconError ? (
            <img
              src={faviconUrl}
              alt=""
              className="result-favicon"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <span className="result-favicon-fallback">{fallbackFavicon}</span>
          )}
        </div>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="result-title"
          onClick={handleOpen}
        >
          {result.title}
        </a>
        {result.duplicateCount && result.duplicateCount > 1 && (
          <span className="result-duplicate-badge" title={`This URL appears ${result.duplicateCount} times`}>
            {result.duplicateCount}
          </span>
        )}
      </div>
      <div className="result-domain">{result.domain}</div>
      {result.tags && result.tags.length > 0 && (
        <div className="result-tags">
          {result.tags.map((tag) => (
            <span key={tag} className="result-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="result-snippet">{result.snippet}</div>
      <div className="result-actions">
        <button 
          className="action-button" 
          onClick={handleOpen}
          aria-label={`Open ${result.title}`}
        >
          Open
        </button>
        <button 
          className="action-button" 
          onClick={handleCopyLink}
          aria-label="Copy link"
        >
          Copy link
        </button>
        <button 
          className="action-button" 
          onClick={handleCopyCitation}
          aria-label="Copy citation"
        >
          Copy citation
        </button>
        <button 
          className="action-button" 
          onClick={handleHighlight}
          aria-label="Highlight in chat"
        >
          Highlight
        </button>
      </div>
    </div>
  );
};


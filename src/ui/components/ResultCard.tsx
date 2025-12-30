import React from 'react';
import type { SearchResult } from '../types';
import { getFaviconUrl } from '../../shared/utils/url';

interface ResultCardProps {
  result: SearchResult;
  onOpen: (url: string) => void;
  onCopyLink: (url: string) => void;
  onCopyDomain: (domain: string) => void;
  onHighlight: (element?: HTMLElement) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onOpen,
  onCopyLink,
  onCopyDomain,
  onHighlight,
}) => {
  const faviconUrl = getFaviconUrl(result.domain);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpen(result.url);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopyLink(result.url);
  };

  const handleCopyDomain = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopyDomain(result.domain);
  };

  const handleHighlight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHighlight(result.element);
  };

  return (
    <div className="result-card">
      <div className="result-header">
        {faviconUrl && (
          <img
            src={faviconUrl}
            alt=""
            className="result-favicon"
            onError={(e) => {
              // Hide favicon if it fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="result-title"
          onClick={handleOpen}
        >
          {result.title}
        </a>
      </div>
      <div className="result-domain">{result.domain}</div>
      <div className="result-snippet">{result.snippet}</div>
      <div className="result-actions">
        <button className="action-button" onClick={handleOpen}>
          Open
        </button>
        <button className="action-button" onClick={handleCopyLink}>
          Copy link
        </button>
        <button className="action-button" onClick={handleCopyDomain}>
          Copy domain
        </button>
        {result.element && (
          <button className="action-button" onClick={handleHighlight}>
            Highlight
          </button>
        )}
      </div>
    </div>
  );
};


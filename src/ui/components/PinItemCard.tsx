import React from 'react';
import type { PinnedItem } from '../../shared/types';

interface PinItemCardProps {
  pin: PinnedItem;
  onOpen: (url: string) => void;
  onCopyLink: (url: string) => void;
  onCopyCitation: (citation: string) => void;
  onEdit?: (pin: PinnedItem) => void;
  onUnpin: (pinId: string) => void;
}

export const PinItemCard: React.FC<PinItemCardProps> = ({
  pin,
  onOpen,
  onCopyLink,
  onCopyCitation,
  onEdit,
  onUnpin,
}) => {
  const faviconUrl = `chrome://favicon2/?size=32&scale_factor=1x&page_url=${encodeURIComponent(pin.url)}`;

  const handleCopyCitation = async () => {
    const citation = `[${pin.title}] (${pin.domain}) - ${pin.url}`;
    await onCopyCitation(citation);
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <div className="result-favicon-wrapper">
          <img
            src={faviconUrl}
            alt=""
            className="result-favicon"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <a
          href={pin.url}
          target="_blank"
          rel="noopener noreferrer"
          className="result-title"
          onClick={(e) => {
            e.preventDefault();
            onOpen(pin.url);
          }}
        >
          {pin.title}
        </a>
      </div>
      <div className="result-domain">{pin.domain}</div>
      {pin.tags && pin.tags.length > 0 && (
        <div className="result-tags">
          {pin.tags.map((tag) => (
            <span key={tag} className="result-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      {pin.note && (
        <div className="pin-note">
          <strong>Note:</strong> {pin.note}
        </div>
      )}
      <div className="result-meta">
        Pinned: {new Date(pin.pinnedAt).toLocaleDateString()}
        {pin.lastSeenAt !== pin.pinnedAt && (
          <> · Last seen: {new Date(pin.lastSeenAt).toLocaleDateString()}</>
        )}
      </div>
      <div className="result-actions">
        <button className="action-button" onClick={() => onOpen(pin.url)} aria-label="Open">
          Open
        </button>
        <button className="action-button" onClick={() => onCopyLink(pin.url)} aria-label="Copy link">
          Copy link
        </button>
        <button className="action-button" onClick={handleCopyCitation} aria-label="Copy citation">
          Copy citation
        </button>
        {onEdit && (
          <button className="action-button" onClick={() => onEdit(pin)} aria-label="Edit">
            Edit
          </button>
        )}
        <button className="action-button" onClick={() => onUnpin(pin.id)} aria-label="Unpin">
          Unpin
        </button>
      </div>
    </div>
  );
};


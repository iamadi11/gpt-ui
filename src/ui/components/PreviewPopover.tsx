/**
 * V6.1: Preview Popover component for drawer (Shadow DOM)
 * Shows enlarged preview on hover/focus
 */

import React, { useEffect, useRef, useState } from 'react';
import type { Result } from '../types';
import { calculatePopoverPosition, type PopoverPosition } from '../utils/position';

interface PreviewPopoverProps {
  open: boolean;
  anchorRect: DOMRect | null;
  result: Result | null;
  onClose: () => void;
  onOpen: (url: string) => void;
  onCopyLink: (url: string) => void;
  containerElement?: HTMLElement; // Shadow DOM container for positioning
}

export const PreviewPopover: React.FC<PreviewPopoverProps> = ({
  open,
  anchorRect,
  result,
  onClose,
  onOpen,
  onCopyLink,
  containerElement,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, placement: 'right' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Calculate position when open or anchor changes
  useEffect(() => {
    if (!open || !anchorRect || !popoverRef.current || !result) {
      return;
    }
    const popoverWidth = 520;
    const popoverHeight = Math.round(popoverWidth * (9 / 16)); // 16:9 aspect ratio

    const containerRect = containerElement?.getBoundingClientRect();
    const newPosition = calculatePopoverPosition({
      anchorRect,
      popoverWidth,
      popoverHeight,
      viewportPadding: 12,
      avoidComposer: false, // Drawer doesn't need to avoid composer
      preferredPlacement: 'left', // Prefer left side in drawer
      containerRect,
    });

    setPosition(newPosition);
  }, [open, anchorRect, result, containerElement]);

  // Handle iframe loading
  useEffect(() => {
    if (!open || !result || !iframeRef.current) {
      setLoading(true);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    timeoutRef.current = setTimeout(() => {
      setError(true);
      setLoading(false);
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [open, result]);

  // Handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  // Handle click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Use capture phase to catch clicks
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [open, onClose]);

  const handleIframeLoad = () => {
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleIframeError = () => {
    setError(true);
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  if (!open || !result) {
    return null;
  }

  const faviconUrl = `chrome://favicon2/?size=32&scale_factor=1x&page_url=${encodeURIComponent(result.url)}`;

  return (
    <div
      ref={popoverRef}
      className="preview-popover"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '520px',
        zIndex: 1000000,
      }}
      onMouseLeave={onClose}
      role="dialog"
      aria-label={`Preview of ${result.title}`}
    >
      <div className="preview-popover-header">
        <div className="preview-popover-header-left">
          <img
            src={faviconUrl}
            alt=""
            className="preview-popover-favicon"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="preview-popover-header-info">
            <div className="preview-popover-title">{result.title}</div>
            <div className="preview-popover-domain">{result.domain}</div>
          </div>
        </div>
        <div className="preview-popover-header-actions">
          <button
            className="preview-popover-action-btn"
            onClick={() => {
              onOpen(result.url);
              onClose();
            }}
            aria-label="Open in new tab"
          >
            Open
          </button>
          <button
            className="preview-popover-action-btn"
            onClick={() => {
              onCopyLink(result.url);
              onClose();
            }}
            aria-label="Copy link"
          >
            Copy link
          </button>
          <button
            className="preview-popover-close-btn"
            onClick={onClose}
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
      </div>

      <div className="preview-popover-content">
        {error ? (
          <div className="preview-popover-error">
            <div className="preview-popover-error-icon">🚫</div>
            <div className="preview-popover-error-message">
              Preview blocked by site policy
            </div>
            <div className="preview-popover-error-actions">
              <button
                className="preview-popover-error-btn"
                onClick={() => {
                  onOpen(result.url);
                  onClose();
                }}
              >
                Open in New Tab
              </button>
              <button
                className="preview-popover-error-btn"
                onClick={() => {
                  onCopyLink(result.url);
                  onClose();
                }}
              >
                Copy Link
              </button>
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="preview-popover-loading">
                <div className="preview-popover-loading-spinner">⏳</div>
                <div>Loading preview...</div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={result.url}
              className="preview-popover-iframe"
              sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin"
              referrerPolicy="no-referrer"
              loading="lazy"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={`Preview of ${result.title}`}
              style={{ display: loading ? 'none' : 'block' }}
            />
          </>
        )}
      </div>
    </div>
  );
};


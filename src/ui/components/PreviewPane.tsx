import React, { useState, useEffect, useRef } from 'react';
import type { Result } from '../../shared/types';

interface PreviewPaneProps {
  result: Result | null;
  onClose: () => void;
  onPin?: (result: Result) => void;
  isPinned?: boolean;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  result,
  onClose,
  onPin,
  isPinned,
}) => {
  const [previewError, setPreviewError] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!result) {
      setPreviewError(false);
      setLoading(false);
      return;
    }

    setPreviewError(false);
    setLoading(true);

    // Timeout to detect if iframe never loads (X-Frame-Options blocking)
    timeoutRef.current = setTimeout(() => {
      setPreviewError(true);
      setLoading(false);
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [result]);

  const handleIframeLoad = () => {
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Check for navigation errors (iframe may navigate to error page)
    // We can't reliably detect this cross-origin, but we can check if content is accessible
    try {
      if (iframeRef.current?.contentWindow) {
        // Cross-origin check will fail silently, which is fine
        // The timeout already handles most blocking cases
      }
    } catch (e) {
      // Cross-origin access denied - this is expected and OK
    }
  };

  const handleIframeError = () => {
    setPreviewError(true);
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  if (!result) {
    return (
      <div className="preview-pane empty">
        <div className="preview-empty-state">
          <div className="preview-empty-icon">👁️</div>
          <div className="preview-empty-text">Select a result to preview</div>
        </div>
      </div>
    );
  }

  const faviconUrl = `chrome://favicon2/?size=32&scale_factor=1x&page_url=${encodeURIComponent(result.url)}`;

  return (
    <div className="preview-pane">
      <div className="preview-header">
        <div className="preview-header-left">
          <img src={faviconUrl} alt="" className="preview-favicon" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
          <div className="preview-header-info">
            <div className="preview-title">{result.title}</div>
            <div className="preview-domain">{result.domain}</div>
          </div>
        </div>
        <div className="preview-header-actions">
          {onPin && (
            <button
              className={`preview-action-button ${isPinned ? 'pinned' : ''}`}
              onClick={() => onPin(result)}
              aria-label={isPinned ? 'Unpin' : 'Pin'}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              {isPinned ? '📌' : '📌'}
            </button>
          )}
          <button
            className="preview-action-button"
            onClick={onClose}
            aria-label="Close preview"
            title="Close preview"
          >
            ×
          </button>
        </div>
      </div>

      {previewError ? (
        <div className="preview-error">
          <div className="preview-error-icon">🚫</div>
          <div className="preview-error-title">Preview Unavailable</div>
          <div className="preview-error-text">
            This site blocks embedding (X-Frame-Options / CSP frame-ancestors).
            <br />
            Use "Open in new tab" to view the content.
          </div>
          <div className="preview-error-actions">
            <button
              className="preview-error-button"
              onClick={() => window.open(result.url, '_blank', 'noopener,noreferrer')}
            >
              Open in New Tab
            </button>
          </div>
        </div>
      ) : (
        <div className="preview-content">
          {loading && (
            <div className="preview-loading">
              <div className="preview-loading-spinner">⏳</div>
              <div>Loading preview...</div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={result.url}
            className="preview-iframe"
            sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin"
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`Preview of ${result.title}`}
            style={{ display: loading ? 'none' : 'block' }}
          />
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import type { Result, ExtensionSettings } from '../types';
import { ResultsTab } from './ResultsTab';
import { PinsTab } from '../tabs/PinsTab';
import { HistoryTab } from '../tabs/HistoryTab';
import { SplitView } from './SplitView';
import { PreviewPane } from './PreviewPane';

interface PanelProps {
  results: Result[];
  settings: ExtensionSettings;
  onClose: () => void;
  onOpenSettings?: () => void;
  onHighlight?: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => void;
  onPin?: (result: Result) => void;
  isPinned?: (id: string) => boolean;
  lastUpdated?: Date;
}

type TabType = 'results' | 'pins' | 'history';

export const Panel: React.FC<PanelProps> = ({
  results,
  settings,
  onClose,
  onOpenSettings,
  onHighlight,
  onPin,
  isPinned,
  lastUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(settings.defaultTab || 'results');
  const [previewResult, setPreviewResult] = useState<Result | null>(null);
  const [splitMode, setSplitMode] = useState(false);

  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyCitation = async (citation: string) => {
    try {
      await navigator.clipboard.writeText(citation);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  const handlePin = (result: Result) => {
    if (onPin) {
      onPin(result);
    }
  };

  const handlePreview = (result: Result) => {
    setPreviewResult(result);
    if (settings.autoOpenPreview) {
      setSplitMode(true);
    }
  };

  const handleClosePreview = () => {
    setPreviewResult(null);
    setSplitMode(false);
  };

  const isMobile = window.innerWidth < 900;
  const panelClass = `panel-container ${settings.panelPosition} ${isMobile ? 'bottom-sheet' : ''}`;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'results':
        // V3.1: Get current message ID from first result (if available)
        const currentMessageId = results.length > 0 ? results[0].sourceMessageId : undefined;
        return (
          <ResultsTab
            results={results}
            settings={settings}
            currentMessageId={currentMessageId}
            onOpen={handleOpen}
            onCopyLink={handleCopyLink}
            onCopyCitation={handleCopyCitation}
            onHighlight={onHighlight || (() => {})}
            onPin={handlePin}
            onPreview={handlePreview}
            isPinned={isPinned}
            showQueryContext={true}
          />
        );
      case 'pins':
        return (
          <PinsTab
            onOpen={handleOpen}
            onCopyLink={handleCopyLink}
            onCopyCitation={handleCopyCitation}
          />
        );
      case 'history':
        return <HistoryTab />;
      default:
        return null;
    }
  };

  const content = splitMode && previewResult && activeTab === 'results' ? (
    <SplitView
      left={renderTabContent()}
      right={
        <PreviewPane
          result={previewResult}
          onClose={handleClosePreview}
          onPin={handlePin}
          isPinned={isPinned?.(previewResult.id)}
        />
      }
      splitPosition={50}
    />
  ) : (
    renderTabContent()
  );

  return (
    <div className={panelClass}>
      <div className="panel-header">
        <h2 className="panel-title">Enhanced Results</h2>
        <div className="panel-header-actions">
          {activeTab === 'results' && previewResult && (
            <button
              className="view-toggle-button"
              onClick={() => setSplitMode(!splitMode)}
              aria-label={splitMode ? 'List view' : 'Split view'}
              title={splitMode ? 'List view' : 'Split view'}
            >
              {splitMode ? '📋 List' : '👁️ Split'}
            </button>
          )}
          {onOpenSettings && (
            <button
              className="settings-button-header"
              onClick={onOpenSettings}
              aria-label="Open settings"
              title="Settings"
            >
              ⚙️
            </button>
          )}
          <button className="close-button" onClick={onClose} aria-label="Close panel">
            ×
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('results');
            setSplitMode(false);
            setPreviewResult(null);
          }}
          aria-label="Results tab"
        >
          Results
        </button>
        <button
          className={`tab-button ${activeTab === 'pins' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('pins');
            setSplitMode(false);
            setPreviewResult(null);
          }}
          aria-label="Pins tab"
        >
          Pins
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('history');
            setSplitMode(false);
            setPreviewResult(null);
          }}
          aria-label="History tab"
        >
          History
        </button>
      </div>

      <div className="panel-content">
        {content}
      </div>

      {lastUpdated && (
        <div className="panel-footer">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          {activeTab === 'results' && (
            <span style={{ marginLeft: '12px' }}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

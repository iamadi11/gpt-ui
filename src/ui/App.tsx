import React, { useState } from 'react';
import { Panel } from './components/Panel';
import { SettingsModal } from './components/SettingsModal';
import type { Result, ExtensionSettings } from './types';

interface AppProps {
  results: Result[];
  settings: ExtensionSettings;
  isVisible: boolean;
  onClose: () => void;
  onSettingsChange: (settings: ExtensionSettings) => void;
  onHighlight?: (sourceNodeSelectorHint: string, url: string, sourceMessageId?: string) => void;
  lastUpdated?: Date;
}

export const App: React.FC<AppProps> = ({
  results,
  settings,
  isVisible,
  onClose,
  onSettingsChange,
  onHighlight,
  lastUpdated,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Panel
        results={results}
        settings={settings}
        onClose={onClose}
        onOpenSettings={() => setShowSettings(true)}
        onHighlight={onHighlight}
        lastUpdated={lastUpdated}
      />
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={onSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

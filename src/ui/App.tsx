import React from 'react';
import { Panel } from './components/Panel';
import type { SearchResult, ExtensionSettings } from './types';

interface AppProps {
  results: SearchResult[];
  settings: ExtensionSettings;
  isVisible: boolean;
  onClose: () => void;
  lastUpdated?: Date;
}

export const App: React.FC<AppProps> = ({
  results,
  settings,
  isVisible,
  onClose,
  lastUpdated,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Panel
      results={results}
      settings={settings}
      onClose={onClose}
      lastUpdated={lastUpdated}
    />
  );
};


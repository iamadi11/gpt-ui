import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from './components/Panel';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import type { Command } from './hooks/useCommandPalette';
import { usePins } from './hooks/usePins';
import type { Result, ExtensionSettings } from './types';
import { hashUrl } from '../shared/utils/hash';
import { normalizeUrl } from '../shared/utils/url';

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
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { pinItem, unpinItem, checkIsPinned } = usePins();
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Check pin status for all results
  useEffect(() => {
    if (!isVisible || results.length === 0) return;

    const checkPins = async () => {
      const newPinnedIds = new Set<string>();
      for (const result of results) {
        const isPinned = await checkIsPinned(result.id);
        if (isPinned) {
          newPinnedIds.add(result.id);
        }
      }
      setPinnedIds(newPinnedIds);
    };

    checkPins();
  }, [results, isVisible, checkIsPinned]);

  const handlePin = useCallback(async (result: Result) => {
    const normalizedUrl = normalizeUrl(result.url);
    const pinId = hashUrl(normalizedUrl);
    
    const isCurrentlyPinned = pinnedIds.has(result.id);
    
    if (isCurrentlyPinned) {
      await unpinItem(pinId);
      setPinnedIds(prev => {
        const next = new Set(prev);
        next.delete(result.id);
        return next;
      });
    } else {
      await pinItem({
        id: pinId,
        url: result.url,
        title: result.title,
        domain: result.domain,
        tags: result.tags || [],
        sourceChatIdHash: undefined, // TODO: get from context
      });
      setPinnedIds(prev => new Set(prev).add(result.id));
    }
  }, [pinItem, unpinItem, pinnedIds]);


  const isPinned = useCallback((id: string): boolean => {
    return pinnedIds.has(id);
  }, [pinnedIds]);

  // Command palette commands
  const commands: Command[] = [
    {
      id: 'toggle-panel',
      label: 'Toggle Panel',
      description: 'Show/hide the results panel',
      keywords: ['toggle', 'show', 'hide'],
      action: () => {
        onClose();
        setShowCommandPalette(false);
      },
      category: 'Navigation',
    },
    {
      id: 'toggle-highlight',
      label: 'Toggle Highlight Sources',
      description: 'Highlight all sources in chat',
      keywords: ['highlight', 'sources'],
      action: () => {
        // TODO: implement highlight toggle
        setShowCommandPalette(false);
      },
      category: 'Actions',
    },
    {
      id: 'settings',
      label: 'Open Settings',
      description: 'Open settings modal',
      keywords: ['settings', 'preferences'],
      action: () => {
        setShowSettings(true);
        setShowCommandPalette(false);
      },
      category: 'Navigation',
    },
  ];

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setShowCommandPalette(true);
      } else if (e.key === 'Escape' && showCommandPalette) {
        setShowCommandPalette(false);
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isVisible, showCommandPalette]);

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
        onPin={handlePin}
        isPinned={isPinned}
        lastUpdated={lastUpdated}
      />
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={onSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
      <CommandPalette
        isOpen={showCommandPalette}
        commands={commands}
        onClose={() => setShowCommandPalette(false)}
      />
    </>
  );
};

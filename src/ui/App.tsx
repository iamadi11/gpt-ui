import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Panel } from './components/Panel';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import { PreviewPopover } from './components/PreviewPopover';
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
  onEnhanceModeToggle?: (enabled: boolean) => void; // V4: Enhance mode toggle callback
}

export const App: React.FC<AppProps> = ({
  results,
  settings,
  isVisible,
  onClose,
  onSettingsChange,
  onHighlight,
  lastUpdated,
  onEnhanceModeToggle,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { pinItem, unpinItem, checkIsPinned } = usePins();
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  
  // V6.1: Preview popover state
  const [previewPopover, setPreviewPopover] = useState<{
    open: boolean;
    result: Result | null;
    anchorRect: DOMRect | null;
  }>({
    open: false,
    result: null,
    anchorRect: null,
  });
  const containerRef = useRef<HTMLElement | null>(null);

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

  // V6.1: Preview hover handlers
  const handlePreviewHover = useCallback((result: Result, anchorRect: DOMRect | null) => {
    setPreviewPopover({
      open: true,
      result,
      anchorRect,
    });
  }, []);

  const handlePreviewHoverEnd = useCallback(() => {
    setPreviewPopover(prev => ({ ...prev, open: false }));
  }, []);

  const handlePreviewPopoverClose = useCallback(() => {
    setPreviewPopover(prev => ({ ...prev, open: false }));
  }, []);

  const handlePreviewPopoverOpen = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handlePreviewPopoverCopyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, []);

  // Get container element (shadow root host)
  useEffect(() => {
    // Find the shadow root container
    const findContainer = () => {
      const root = document.getElementById('graphgpt-root');
      if (root) {
        containerRef.current = root;
      }
    };
    findContainer();
    // Re-check periodically in case it's not ready yet
    const interval = setInterval(findContainer, 100);
    return () => clearInterval(interval);
  }, []);

  // V4: Handle enhance mode toggle
  const handleEnhanceModeToggle = useCallback(async (enabled: boolean) => {
    // Use the callback from props if provided, otherwise update settings directly
    if (onEnhanceModeToggle) {
      await onEnhanceModeToggle(enabled);
    } else {
      // Fallback: update settings directly
      const updatedSettings = { ...settings, enhancePageEnabled: enabled };
      await onSettingsChange(updatedSettings);
    }
  }, [settings, onSettingsChange]);

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
        onEnhanceModeToggle={handleEnhanceModeToggle}
        onPreviewHover={handlePreviewHover}
        onPreviewHoverEnd={handlePreviewHoverEnd}
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
      <PreviewPopover
        open={previewPopover.open}
        anchorRect={previewPopover.anchorRect}
        result={previewPopover.result}
        onClose={handlePreviewPopoverClose}
        onOpen={handlePreviewPopoverOpen}
        onCopyLink={handlePreviewPopoverCopyLink}
        containerElement={containerRef.current || undefined}
      />
    </>
  );
};

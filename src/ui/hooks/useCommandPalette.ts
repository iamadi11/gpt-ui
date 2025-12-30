import { useState, useEffect, useCallback } from 'react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  action: () => void;
  category?: string;
}

export function useCommandPalette(commands: Command[], isOpen: boolean) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(cmd => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query) ||
      cmd.keywords?.some(kw => kw.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, isOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  const executeCommand = useCallback((index?: number) => {
    const idx = index !== undefined ? index : selectedIndex;
    if (filteredCommands[idx]) {
      filteredCommands[idx].action();
    }
  }, [filteredCommands, selectedIndex]);

  return {
    searchQuery,
    setSearchQuery,
    filteredCommands,
    selectedIndex,
    setSelectedIndex,
    executeCommand,
  };
}


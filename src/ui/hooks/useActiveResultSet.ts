/**
 * V3.1: Manage per-message result sets (session-only, in-memory)
 * This allows switching between result sets from different assistant messages
 */

import { useState, useMemo, useCallback } from 'react';
import type { Result } from '../../shared/types';

export interface ResultSet {
  id: string; // message ID or timestamp
  messageId: string;
  timestamp: number;
  results: Result[];
  label: string; // "Latest" or "Previous (n)"
}

/**
 * Hook to manage active result set and switching between sets
 */
export function useActiveResultSet(
  currentResults: Result[],
  currentMessageId?: string
): {
  activeSet: ResultSet | null;
  allSets: ResultSet[];
  switchToSet: (setId: string) => void;
  addResultSet: (results: Result[], messageId: string) => void;
} {
  const [allSets, setAllSets] = useState<ResultSet[]>([]);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);

  // When current results change, add/update a result set
  const addResultSet = useCallback((results: Result[], messageId: string) => {
    setAllSets(prev => {
      // Check if set for this message already exists
      const existingIndex = prev.findIndex(set => set.messageId === messageId);
      
      if (existingIndex >= 0) {
        // Update existing set
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          results,
          timestamp: Date.now(),
        };
        
        // Re-label sets (latest is the most recent)
        const sorted = updated.sort((a, b) => b.timestamp - a.timestamp);
        sorted.forEach((set, index) => {
          set.label = index === 0 ? 'Latest' : `Previous (${index})`;
        });
        
        return sorted;
      } else {
        // Add new set
        const newSet: ResultSet = {
          id: `${messageId}-${Date.now()}`,
          messageId,
          timestamp: Date.now(),
          results,
          label: prev.length === 0 ? 'Latest' : `Previous (${prev.length})`,
        };
        
        const updated = [...prev, newSet]
          .sort((a, b) => b.timestamp - a.timestamp);
        
        // Re-label all sets
        updated.forEach((set, index) => {
          set.label = index === 0 ? 'Latest' : `Previous (${index})`;
        });
        
        return updated;
      }
    });

    // Set as active if it's the latest
    if (!activeSetId) {
      setActiveSetId(messageId);
    }
  }, [activeSetId]);

  // Update sets when current results/message changes
  useMemo(() => {
    if (currentResults.length > 0 && currentMessageId) {
      addResultSet(currentResults, currentMessageId);
    }
  }, [currentResults, currentMessageId, addResultSet]);

  const switchToSet = useCallback((setId: string) => {
    setActiveSetId(setId);
  }, []);

  const activeSet = useMemo(() => {
    if (!activeSetId) {
      // Return latest set by default
      return allSets.length > 0 ? allSets[0] : null;
    }
    return allSets.find(set => set.id === activeSetId || set.messageId === activeSetId) || allSets[0] || null;
  }, [activeSetId, allSets]);

  return {
    activeSet,
    allSets,
    switchToSet,
    addResultSet,
  };
}


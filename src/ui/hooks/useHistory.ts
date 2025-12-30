import { useState, useEffect, useCallback } from 'react';
import type { SessionRecord } from '../../shared/types';
import { getHistory, addSession, clearHistory } from '../../shared/storage';

export function useHistory() {
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedHistory = await getHistory();
      setHistory(fetchedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const addSessionRecord = useCallback(async (session: Omit<SessionRecord, 'sessionId' | 'createdAt'>) => {
    try {
      await addSession(session);
      await refreshHistory();
      return true;
    } catch (error) {
      console.error('Error adding session:', error);
      return false;
    }
  }, [refreshHistory]);

  const clearAll = useCallback(async () => {
    try {
      await clearHistory();
      await refreshHistory();
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  }, [refreshHistory]);

  return {
    history,
    loading,
    addSessionRecord,
    clearAll,
    refreshHistory,
  };
}


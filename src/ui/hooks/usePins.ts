import { useState, useEffect, useCallback } from 'react';
import type { PinnedItem, Folder } from '../../shared/types';
import { getPins, addPin, removePin, updatePin, isPinned, getFolders, createFolder, deleteFolder } from '../../shared/storage';

export function usePins(folderId?: string) {
  const [pins, setPins] = useState<PinnedItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPins = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPins = await getPins(folderId);
      setPins(fetchedPins);
    } catch (error) {
      console.error('Error loading pins:', error);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  const refreshFolders = useCallback(async () => {
    try {
      const fetchedFolders = await getFolders();
      setFolders(fetchedFolders);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  }, []);

  useEffect(() => {
    refreshPins();
  }, [refreshPins]);

  useEffect(() => {
    refreshFolders();
  }, [refreshFolders]);

  const pinItem = useCallback(async (item: Omit<PinnedItem, 'pinnedAt' | 'lastSeenAt'>) => {
    try {
      await addPin(item);
      await refreshPins();
      return true;
    } catch (error) {
      console.error('Error pinning item:', error);
      return false;
    }
  }, [refreshPins]);

  const unpinItem = useCallback(async (pinId: string) => {
    try {
      await removePin(pinId);
      await refreshPins();
      return true;
    } catch (error) {
      console.error('Error unpinning item:', error);
      return false;
    }
  }, [refreshPins]);

  const updateItem = useCallback(async (pinId: string, updates: Partial<PinnedItem>) => {
    try {
      await updatePin(pinId, updates);
      await refreshPins();
      return true;
    } catch (error) {
      console.error('Error updating pin:', error);
      return false;
    }
  }, [refreshPins]);

  const checkIsPinned = useCallback(async (pinId: string): Promise<boolean> => {
    try {
      return await isPinned(pinId);
    } catch (error) {
      console.error('Error checking pin status:', error);
      return false;
    }
  }, []);

  const addFolder = useCallback(async (name: string) => {
    try {
      const folder = await createFolder(name);
      await refreshFolders();
      return folder;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }, [refreshFolders]);

  const removeFolder = useCallback(async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      await refreshFolders();
      await refreshPins();
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  }, [refreshFolders, refreshPins]);

  return {
    pins,
    folders,
    loading,
    pinItem,
    unpinItem,
    updateItem,
    checkIsPinned,
    addFolder,
    removeFolder,
    refreshPins,
    refreshFolders,
  };
}


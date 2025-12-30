import type { ExtensionSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

const STORAGE_KEY = 'gpt-ui-settings';
const CACHE_KEY = 'gpt-ui-cache';

// Cache for URL metadata (LRU, max 200 items)
interface CacheEntry {
  url: string;
  title: string;
  domain: string;
  timestamp: number;
}

const MAX_CACHE_SIZE = 200;

export async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        const stored = result[STORAGE_KEY];
        if (stored) {
          // Merge with defaults to handle new fields
          resolve({ ...DEFAULT_SETTINGS, ...stored });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      });
    } else {
      // Fallback for testing
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          resolve({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        } catch {
          resolve(DEFAULT_SETTINGS);
        }
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    }
  });
}

export async function setSettings(settings: Partial<ExtensionSettings>): Promise<void> {
  return new Promise((resolve) => {
    getSettings().then((current) => {
      const updated = { ...current, ...settings };
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
          resolve();
        });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        resolve();
      }
    });
  });
}

/**
 * Get cache entry for a URL
 */
export async function getCacheEntry(url: string): Promise<CacheEntry | null> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([CACHE_KEY], (result) => {
        const cacheData = result[CACHE_KEY];
        if (cacheData && cacheData[url]) {
          resolve(cacheData[url]);
        } else {
          resolve(null);
        }
      });
    } else {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        try {
          const cache = JSON.parse(stored);
          resolve(cache[url] || null);
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    }
  });
}

/**
 * Set cache entry for a URL (with LRU eviction)
 */
export async function setCacheEntry(url: string, entry: Omit<CacheEntry, 'timestamp'>): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([CACHE_KEY], (result) => {
        const cache = result[CACHE_KEY] || {};
        const entries = Object.entries(cache);
        
        // Remove old entry if exists
        delete cache[url];
        
        // Add new entry
        cache[url] = { ...entry, timestamp: Date.now() };
        
        // LRU eviction: if over limit, remove oldest entries
        if (Object.keys(cache).length > MAX_CACHE_SIZE) {
          const sorted = entries.sort((a, b) => {
            const aEntry = a[1] as CacheEntry;
            const bEntry = b[1] as CacheEntry;
            return (aEntry.timestamp || 0) - (bEntry.timestamp || 0);
          });
          const toRemove = sorted.slice(0, Object.keys(cache).length - MAX_CACHE_SIZE);
          toRemove.forEach(([key]) => delete cache[key]);
        }
        
        chrome.storage.local.set({ [CACHE_KEY]: cache }, () => {
          resolve();
        });
      });
    } else {
      const stored = localStorage.getItem(CACHE_KEY);
      const cache = stored ? JSON.parse(stored) : {};
      cache[url] = { ...entry, timestamp: Date.now() };
      
      // LRU eviction
      const entries = Object.entries(cache);
      if (entries.length > MAX_CACHE_SIZE) {
        const sorted = entries.sort((a, b) => ((a[1] as CacheEntry).timestamp || 0) - ((b[1] as CacheEntry).timestamp || 0));
        const toRemove = sorted.slice(0, entries.length - MAX_CACHE_SIZE);
        toRemove.forEach(([key]) => delete cache[key]);
      }
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      resolve();
    }
  });
}


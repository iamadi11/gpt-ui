import type { PinnedItem, Folder, SessionRecord, ExtensionSettings } from './types';
import { DEFAULT_SETTINGS, MAX_PINS, MAX_HISTORY_SESSIONS, MAX_CACHE_SIZE } from './types';
import { generateUUID } from './utils/uuid';

const STORAGE_KEY = 'gpt-ui-settings';
const CACHE_KEY = 'gpt-ui-cache';
const PINS_KEY = 'gpt-ui-pins';
const FOLDERS_KEY = 'gpt-ui-folders';
const HISTORY_KEY = 'gpt-ui-history';
const SCHEMA_VERSION_KEY = 'gpt-ui-schema-version';

// Cache for URL metadata (LRU, max 200 items)
interface CacheEntry {
  url: string;
  title: string;
  domain: string;
  timestamp: number;
}

/**
 * Migrate storage schema
 */
async function migrateStorage(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([SCHEMA_VERSION_KEY], (result) => {
        const currentVersion = result[SCHEMA_VERSION_KEY] || 1;
        
        if (currentVersion < 3) {
          // Migrate to V3: initialize new keys with defaults
          chrome.storage.local.get([PINS_KEY, FOLDERS_KEY, HISTORY_KEY], (data) => {
            const updates: Record<string, any> = {};
            
            // Initialize pins if not exists
            if (!data[PINS_KEY]) {
              updates[PINS_KEY] = {};
            }
            
            // Initialize folders with default "All Pins"
            if (!data[FOLDERS_KEY]) {
              updates[FOLDERS_KEY] = {
                'all': {
                  id: 'all',
                  name: 'All Pins',
                  createdAt: Date.now(),
                },
              };
            }
            
            // Initialize history if not exists
            if (!data[HISTORY_KEY]) {
              updates[HISTORY_KEY] = [];
            }
            
            updates[SCHEMA_VERSION_KEY] = 3;
            
            chrome.storage.local.set(updates, () => {
              resolve();
            });
          });
        } else {
          resolve();
        }
      });
    } else {
      // Fallback for testing
      const version = localStorage.getItem(SCHEMA_VERSION_KEY);
      if (!version || parseInt(version, 10) < 3) {
        if (!localStorage.getItem(PINS_KEY)) {
          localStorage.setItem(PINS_KEY, '{}');
        }
        if (!localStorage.getItem(FOLDERS_KEY)) {
          localStorage.setItem(FOLDERS_KEY, JSON.stringify({
            'all': {
              id: 'all',
              name: 'All Pins',
              createdAt: Date.now(),
            },
          }));
        }
        if (!localStorage.getItem(HISTORY_KEY)) {
          localStorage.setItem(HISTORY_KEY, '[]');
        }
        localStorage.setItem(SCHEMA_VERSION_KEY, '3');
      }
      resolve();
    }
  });
}

/**
 * Get settings (with migration)
 */
export async function getSettings(): Promise<ExtensionSettings> {
  await migrateStorage();
  
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        const stored = result[STORAGE_KEY];
        if (stored) {
          resolve({ ...DEFAULT_SETTINGS, ...stored });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      });
    } else {
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
 * Get all pinned items
 */
export async function getPins(folderId?: string): Promise<PinnedItem[]> {
  await migrateStorage();
  
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([PINS_KEY], (result) => {
        const pinsData = result[PINS_KEY] || {};
        const pins = Object.values(pinsData) as PinnedItem[];
        
        if (folderId) {
          const filtered = pins.filter(pin => pin.folderId === folderId || (folderId === 'all' && !pin.folderId));
          resolve(filtered);
        } else {
          resolve(pins);
        }
      });
    } else {
      const stored = localStorage.getItem(PINS_KEY);
      if (stored) {
        try {
          const pinsData = JSON.parse(stored);
          const pins = Object.values(pinsData) as PinnedItem[];
          resolve(folderId ? pins.filter(pin => pin.folderId === folderId || (folderId === 'all' && !pin.folderId)) : pins);
        } catch {
          resolve([]);
        }
      } else {
        resolve([]);
      }
    }
  });
}

/**
 * Add or update a pinned item
 */
export async function addPin(item: Omit<PinnedItem, 'pinnedAt' | 'lastSeenAt'>, pinnedAt?: number): Promise<void> {
  await migrateStorage();
  
  return new Promise((resolve) => {
    getPins().then((existingPins) => {
      // Check if pin already exists
      const existing = existingPins.find(p => p.id === item.id);
      
      const pin: PinnedItem = {
        ...item,
        pinnedAt: pinnedAt || existing?.pinnedAt || Date.now(),
        lastSeenAt: Date.now(),
      };
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([PINS_KEY], (result) => {
          const pinsData = result[PINS_KEY] || {};
          pinsData[pin.id] = pin;
          
          // Enforce max pins limit
          const pins = Object.values(pinsData) as PinnedItem[];
          if (pins.length > MAX_PINS) {
            // Remove oldest pins
            const sorted = pins.sort((a, b) => a.pinnedAt - b.pinnedAt);
            const toRemove = sorted.slice(0, pins.length - MAX_PINS);
            toRemove.forEach(p => delete pinsData[p.id]);
          }
          
          chrome.storage.local.set({ [PINS_KEY]: pinsData }, () => {
            resolve();
          });
        });
      } else {
        const stored = localStorage.getItem(PINS_KEY);
        const pinsData = stored ? JSON.parse(stored) : {};
        pinsData[pin.id] = pin;
        
        const pins = Object.values(pinsData) as PinnedItem[];
        if (pins.length > MAX_PINS) {
          const sorted = pins.sort((a, b) => a.pinnedAt - b.pinnedAt);
          const toRemove = sorted.slice(0, pins.length - MAX_PINS);
          toRemove.forEach(p => delete pinsData[p.id]);
        }
        
        localStorage.setItem(PINS_KEY, JSON.stringify(pinsData));
        resolve();
      }
    });
  });
}

/**
 * Remove a pinned item
 */
export async function removePin(pinId: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([PINS_KEY], (result) => {
        const pinsData = result[PINS_KEY] || {};
        delete pinsData[pinId];
        chrome.storage.local.set({ [PINS_KEY]: pinsData }, () => {
          resolve();
        });
      });
    } else {
      const stored = localStorage.getItem(PINS_KEY);
      if (stored) {
        try {
          const pinsData = JSON.parse(stored);
          delete pinsData[pinId];
          localStorage.setItem(PINS_KEY, JSON.stringify(pinsData));
        } catch {
          // Ignore
        }
      }
      resolve();
    }
  });
}

/**
 * Update pin (note, folder, tags, etc.)
 */
export async function updatePin(pinId: string, updates: Partial<PinnedItem>): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([PINS_KEY], (result) => {
        const pinsData = result[PINS_KEY] || {};
        if (pinsData[pinId]) {
          pinsData[pinId] = { ...pinsData[pinId], ...updates, lastSeenAt: Date.now() };
          chrome.storage.local.set({ [PINS_KEY]: pinsData }, () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    } else {
      const stored = localStorage.getItem(PINS_KEY);
      if (stored) {
        try {
          const pinsData = JSON.parse(stored);
          if (pinsData[pinId]) {
            pinsData[pinId] = { ...pinsData[pinId], ...updates, lastSeenAt: Date.now() };
            localStorage.setItem(PINS_KEY, JSON.stringify(pinsData));
          }
        } catch {
          // Ignore
        }
      }
      resolve();
    }
  });
}

/**
 * Check if a URL is pinned
 */
export async function isPinned(pinId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([PINS_KEY], (result) => {
        const pinsData = result[PINS_KEY] || {};
        resolve(!!pinsData[pinId]);
      });
    } else {
      const stored = localStorage.getItem(PINS_KEY);
      if (stored) {
        try {
          const pinsData = JSON.parse(stored);
          resolve(!!pinsData[pinId]);
        } catch {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    }
  });
}

/**
 * Get all folders
 */
export async function getFolders(): Promise<Folder[]> {
  await migrateStorage();
  
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([FOLDERS_KEY], (result) => {
        const foldersData = result[FOLDERS_KEY] || {};
        const folders = Object.values(foldersData) as Folder[];
        resolve(folders.sort((a, b) => a.createdAt - b.createdAt));
      });
    } else {
      const stored = localStorage.getItem(FOLDERS_KEY);
      if (stored) {
        try {
          const foldersData = JSON.parse(stored);
          const folders = Object.values(foldersData) as Folder[];
          resolve(folders.sort((a, b) => a.createdAt - b.createdAt));
        } catch {
          resolve([]);
        }
      } else {
        resolve([]);
      }
    }
  });
}

/**
 * Create a new folder
 */
export async function createFolder(name: string): Promise<Folder> {
  await migrateStorage();
  
  const folder: Folder = {
    id: generateUUID(),
    name,
    createdAt: Date.now(),
  };
  
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([FOLDERS_KEY], (result) => {
        const foldersData = result[FOLDERS_KEY] || {};
        foldersData[folder.id] = folder;
        chrome.storage.local.set({ [FOLDERS_KEY]: foldersData }, () => {
          resolve(folder);
        });
      });
    } else {
      const stored = localStorage.getItem(FOLDERS_KEY);
      const foldersData = stored ? JSON.parse(stored) : {};
      foldersData[folder.id] = folder;
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(foldersData));
      resolve(folder);
    }
  });
}

/**
 * Delete a folder (and move its pins to "All Pins")
 */
export async function deleteFolder(folderId: string): Promise<void> {
  return new Promise((resolve) => {
    getPins(folderId).then((pinsInFolder) => {
      // Move pins to "all" folder
      const updatePromises = pinsInFolder.map(pin => updatePin(pin.id, { folderId: undefined }));
      
      Promise.all(updatePromises).then(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get([FOLDERS_KEY], (result) => {
            const foldersData = result[FOLDERS_KEY] || {};
            delete foldersData[folderId];
            chrome.storage.local.set({ [FOLDERS_KEY]: foldersData }, () => {
              resolve();
            });
          });
        } else {
          const stored = localStorage.getItem(FOLDERS_KEY);
          if (stored) {
            try {
              const foldersData = JSON.parse(stored);
              delete foldersData[folderId];
              localStorage.setItem(FOLDERS_KEY, JSON.stringify(foldersData));
            } catch {
              // Ignore
            }
          }
          resolve();
        }
      });
    });
  });
}

/**
 * Get session history
 */
export async function getHistory(): Promise<SessionRecord[]> {
  await migrateStorage();
  
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([HISTORY_KEY], (result) => {
        const history = (result[HISTORY_KEY] || []) as SessionRecord[];
        resolve(history.sort((a, b) => b.createdAt - a.createdAt));
      });
    } else {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        try {
          const history = JSON.parse(stored) as SessionRecord[];
          resolve(history.sort((a, b) => b.createdAt - a.createdAt));
        } catch {
          resolve([]);
        }
      } else {
        resolve([]);
      }
    }
  });
}

/**
 * Add a session record
 */
export async function addSession(session: Omit<SessionRecord, 'sessionId' | 'createdAt'>): Promise<void> {
  await migrateStorage();
  
  const sessionRecord: SessionRecord = {
    ...session,
    sessionId: generateUUID(),
    createdAt: Date.now(),
  };
  
  return new Promise((resolve) => {
    getHistory().then((existingHistory) => {
      const updated = [sessionRecord, ...existingHistory].slice(0, MAX_HISTORY_SESSIONS);
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [HISTORY_KEY]: updated }, () => {
          resolve();
        });
      } else {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        resolve();
      }
    });
  });
}

/**
 * Clear all history
 */
export async function clearHistory(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [HISTORY_KEY]: [] }, () => {
        resolve();
      });
    } else {
      localStorage.setItem(HISTORY_KEY, '[]');
      resolve();
    }
  });
}

/**
 * Clear all data (except settings)
 */
export async function clearAllData(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove([PINS_KEY, FOLDERS_KEY, HISTORY_KEY, CACHE_KEY], () => {
        // Re-initialize folders with default
        chrome.storage.local.set({
          [FOLDERS_KEY]: {
            'all': {
              id: 'all',
              name: 'All Pins',
              createdAt: Date.now(),
            },
          },
        }, () => {
          resolve();
        });
      });
    } else {
      localStorage.removeItem(PINS_KEY);
      localStorage.removeItem(FOLDERS_KEY);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(FOLDERS_KEY, JSON.stringify({
        'all': {
          id: 'all',
          name: 'All Pins',
          createdAt: Date.now(),
        },
      }));
      resolve();
    }
  });
}

// Re-export cache functions from original storage
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

export async function setCacheEntry(url: string, entry: Omit<CacheEntry, 'timestamp'>): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([CACHE_KEY], (result) => {
        const cache = result[CACHE_KEY] || {};
        const entries = Object.entries(cache);
        
        delete cache[url];
        cache[url] = { ...entry, timestamp: Date.now() };
        
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


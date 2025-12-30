import type { ExtensionSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

const STORAGE_KEY = 'gpt-ui-settings';

export async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] || DEFAULT_SETTINGS);
      });
    } else {
      // Fallback for testing
      const stored = localStorage.getItem(STORAGE_KEY);
      resolve(stored ? JSON.parse(stored) : DEFAULT_SETTINGS);
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


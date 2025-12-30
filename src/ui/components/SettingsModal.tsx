import React, { useState, useEffect } from 'react';
import type { ExtensionSettings } from '../types';
import { clearAllData, clearHistory, removePin, getPins } from '../../shared/storage';

interface SettingsModalProps {
  settings: ExtensionSettings;
  onSave: (settings: ExtensionSettings) => void;
  onClose: () => void;
}

// Get extension version from manifest
const getExtensionVersion = (): string => {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
      return chrome.runtime.getManifest().version || '3.1.0';
    }
  } catch {
    // Fallback if chrome.runtime is not available
  }
  return '3.1.0';
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<ExtensionSettings>(settings);

  const handleClearPins = async () => {
    if (window.confirm('Clear all pins? This cannot be undone.')) {
      try {
        const pins = await getPins();
        for (const pin of pins) {
          await removePin(pin.id);
        }
        window.location.reload();
      } catch (error) {
        console.error('Error clearing pins:', error);
        alert('Error clearing pins. Please try again.');
      }
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('Clear derived caches? This will remove cached URL metadata.')) {
      // Clear cache by removing cache entries (LRU will handle this naturally)
      // For now, just clear the storage key
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove(['urlCache'], () => {
          window.location.reload();
        });
      } else {
        localStorage.removeItem('urlCache');
        window.location.reload();
      }
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('Clear all data (pins, history, cache)? This cannot be undone.')) {
      await clearAllData();
      window.location.reload();
    }
  };

  const handleResetEverything = async () => {
    if (window.confirm('Reset everything including settings? This cannot be undone.')) {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.clear(() => {
          window.location.reload();
        });
      } else {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleChange = <K extends keyof ExtensionSettings>(
    key: K,
    value: ExtensionSettings[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2 className="settings-modal-title">Settings</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="settings-modal-content">
          {/* Enabled Toggle */}
          <div className="settings-item">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={localSettings.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
              />
              <span>Enabled</span>
            </label>
          </div>

          {/* Panel Position */}
          <div className="settings-item">
            <label className="settings-label">Panel Position</label>
            <div className="settings-radio-group">
              <label>
                <input
                  type="radio"
                  name="panelPosition"
                  value="right"
                  checked={localSettings.panelPosition === 'right'}
                  onChange={(e) => handleChange('panelPosition', e.target.value as 'right' | 'left')}
                />
                Right
              </label>
              <label>
                <input
                  type="radio"
                  name="panelPosition"
                  value="left"
                  checked={localSettings.panelPosition === 'left'}
                  onChange={(e) => handleChange('panelPosition', e.target.value as 'right' | 'left')}
                />
                Left
              </label>
            </div>
          </div>

          {/* Default Tab */}
          <div className="settings-item">
            <label className="settings-label">Default Tab</label>
            <select
              value={localSettings.defaultTab || 'results'}
              onChange={(e) => handleChange('defaultTab', e.target.value as 'results' | 'pins' | 'history')}
              className="settings-select"
            >
              <option value="results">Results</option>
              <option value="pins">Pins</option>
              <option value="history">History</option>
            </select>
          </div>

          {/* Default View */}
          <div className="settings-item">
            <label className="settings-label">Default View</label>
            <select
              value={localSettings.defaultView || 'top'}
              onChange={(e) => handleChange('defaultView', e.target.value as 'top' | 'all' | 'grouped')}
              className="settings-select"
            >
              <option value="top">Top Results</option>
              <option value="all">All Results</option>
              <option value="grouped">Grouped by Domain</option>
            </select>
          </div>

          {/* Auto-open Panel */}
          <div className="settings-item">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={localSettings.autoOpenPanel}
                onChange={(e) => handleChange('autoOpenPanel', e.target.checked)}
              />
              <span>Auto-open panel when sources detected</span>
            </label>
          </div>

          {/* Auto-open Preview */}
          <div className="settings-item">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={localSettings.autoOpenPreview || false}
                onChange={(e) => handleChange('autoOpenPreview', e.target.checked)}
              />
              <span>Auto-open preview in split mode when clicking a result</span>
            </label>
          </div>

          {/* Highlight Sources */}
          <div className="settings-item">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={localSettings.highlightSourcesInChat}
                onChange={(e) => handleChange('highlightSourcesInChat', e.target.checked)}
              />
              <span>Highlight sources in chat</span>
            </label>
          </div>

          {/* Enable Top Ranking */}
          <div className="settings-item">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={localSettings.enableTopRanking !== false}
                onChange={(e) => handleChange('enableTopRanking', e.target.checked)}
              />
              <span>Enable smart ranking for top results</span>
            </label>
          </div>

          {/* History Enabled */}
          <div className="settings-item">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={localSettings.historyEnabled !== false}
                onChange={(e) => handleChange('historyEnabled', e.target.checked)}
              />
              <span>Enable session history</span>
            </label>
          </div>

          {/* Snippet Length */}
          <div className="settings-item">
            <label className="settings-label">
              Snippet Length: {localSettings.snippetLength} characters
            </label>
            <input
              type="range"
              min="120"
              max="320"
              step="10"
              value={localSettings.snippetLength}
              onChange={(e) => handleChange('snippetLength', parseInt(e.target.value, 10))}
              className="settings-slider"
            />
            <div className="settings-slider-labels">
              <span>120</span>
              <span>320</span>
            </div>
          </div>

          {/* Glassmorphism Theme Settings */}
          <h3 className="settings-section-title" style={{ marginTop: '32px', marginBottom: '16px' }}>
            Glass Theme
          </h3>

          <div className="settings-item">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={localSettings.glassmorphismEnabled !== false}
                onChange={(e) => handleChange('glassmorphismEnabled' as any, e.target.checked)}
              />
              Enable glassmorphism visual style
            </label>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
              Modern translucent glass effect with backdrop blur
            </p>
          </div>

          {localSettings.glassmorphismEnabled !== false && (
            <div className="settings-item">
              <label className="settings-label">Glass intensity</label>
              <div className="settings-radio-group">
                <label>
                  <input
                    type="radio"
                    name="glassIntensity"
                    value="subtle"
                    checked={localSettings.glassIntensity === 'subtle'}
                    onChange={(e) => handleChange('glassIntensity' as any, e.target.value as 'subtle' | 'normal' | 'strong')}
                  />
                  Subtle
                </label>
                <label>
                  <input
                    type="radio"
                    name="glassIntensity"
                    value="normal"
                    checked={localSettings.glassIntensity === 'normal' || !localSettings.glassIntensity}
                    onChange={(e) => handleChange('glassIntensity' as any, e.target.value as 'subtle' | 'normal' | 'strong')}
                  />
                  Normal
                </label>
                <label>
                  <input
                    type="radio"
                    name="glassIntensity"
                    value="strong"
                    checked={localSettings.glassIntensity === 'strong'}
                    onChange={(e) => handleChange('glassIntensity' as any, e.target.value as 'subtle' | 'normal' | 'strong')}
                  />
                  Strong
                </label>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Adjusts blur amount and background opacity
              </p>
            </div>
          )}

          {/* Frosted Overlays Settings */}
          {localSettings.glassmorphismEnabled !== false && (
            <>
              <div className="settings-item" style={{ marginTop: '24px' }}>
                <label className="settings-label">
                  <input
                    type="checkbox"
                    checked={localSettings.frostedOverlaysEnabled !== false}
                    onChange={(e) => handleChange('frostedOverlaysEnabled' as any, e.target.checked)}
                  />
                  Enable frosted gradient overlays
                </label>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                  Subtle gradient overlays that enhance depth
                </p>
              </div>

              {localSettings.frostedOverlaysEnabled !== false && (
                <>
                  <div className="settings-item">
                    <label className="settings-label">Frost style</label>
                    <div className="settings-radio-group">
                      <label>
                        <input
                          type="radio"
                          name="frostStyle"
                          value="classic"
                          checked={localSettings.frostStyle === 'classic' || !localSettings.frostStyle}
                          onChange={(e) => handleChange('frostStyle' as any, e.target.value as 'classic' | 'minimal')}
                        />
                        Classic
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="frostStyle"
                          value="minimal"
                          checked={localSettings.frostStyle === 'minimal'}
                          onChange={(e) => handleChange('frostStyle' as any, e.target.value as 'classic' | 'minimal')}
                        />
                        Minimal
                      </label>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Classic: two gradient layers + highlight. Minimal: single gradient + highlight.
                    </p>
                  </div>

                  <div className="settings-item">
                    <label className="settings-label">
                      <input
                        type="checkbox"
                        checked={localSettings.frostedNoiseEnabled === true}
                        onChange={(e) => handleChange('frostedNoiseEnabled' as any, e.target.checked)}
                      />
                      Enable subtle noise texture
                    </label>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                      Very subtle texture to reduce gradient banding (optional)
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* V3.1: Privacy Controls */}
          <div className="settings-item">
            <div className="settings-label" style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>
              Privacy Controls
            </div>
            
            {/* Never show query context */}
            <div className="settings-item" style={{ marginBottom: '16px' }}>
              <label className="settings-label">
                <input
                  type="checkbox"
                  checked={localSettings.neverShowQueryContext || false}
                  onChange={(e) => handleChange('neverShowQueryContext' as any, e.target.checked)}
                />
                <span>Never show query context</span>
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                Query context is never saved, only shown in-memory
              </div>
            </div>
          </div>

          {/* V3.1: Data Management */}
          <div className="settings-item">
            <div className="settings-label" style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>
              Data Management
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="settings-button"
                onClick={handleClearPins}
                style={{ fontSize: '13px' }}
              >
                Clear Pins
              </button>
              <button
                className="settings-button"
                onClick={() => handleClearCache()}
                style={{ fontSize: '13px' }}
              >
                Clear Derived Caches
              </button>
              <button
                className="settings-button"
                onClick={() => {
                  if (window.confirm('Clear session history?')) {
                    clearHistory();
                    window.location.reload();
                  }
                }}
                style={{ fontSize: '13px' }}
              >
                Clear History
              </button>
              <button
                className="settings-button danger"
                onClick={handleClearAllData}
                style={{ fontSize: '13px', marginTop: '8px' }}
              >
                Clear All Data
              </button>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                This will delete all pins, history, and cached data. Settings will be preserved.
              </div>
              <button
                className="settings-button danger"
                onClick={handleResetEverything}
                style={{ fontSize: '13px', marginTop: '8px' }}
              >
                Reset Everything
              </button>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                This will delete all data including settings. Complete reset.
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="settings-item" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <div className="settings-label" style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>
              About
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              <strong>SourceLens</strong> v{getExtensionVersion()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
              Enhanced search results panel for AI chat interfaces.
              <br />
              Privacy-first, local-only processing.
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="https://github.com/your-username/sourcelens"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '12px' }}
              >
                GitHub
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Open privacy policy (could be a markdown file or web page)
                  window.open('https://github.com/your-username/sourcelens/blob/main/PRIVACY_POLICY.md', '_blank');
                }}
                style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '12px' }}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://github.com/your-username/sourcelens/blob/main/README.md', '_blank');
                }}
                style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '12px' }}
              >
                Documentation
              </a>
            </div>
          </div>
        </div>

        <div className="settings-modal-footer">
          <button className="settings-button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="settings-button primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


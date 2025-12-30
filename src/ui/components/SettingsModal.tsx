import React, { useState, useEffect } from 'react';
import type { ExtensionSettings } from '../types';
import { clearAllData } from '../../shared/storage';

interface SettingsModalProps {
  settings: ExtensionSettings;
  onSave: (settings: ExtensionSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<ExtensionSettings>(settings);

  const handleClearAllData = async () => {
    if (window.confirm('Clear all data (pins, history, cache)? This cannot be undone.')) {
      await clearAllData();
      // Reload page to reflect changes
      window.location.reload();
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

          {/* Clear All Data */}
          <div className="settings-item">
            <div className="settings-label">Data Management</div>
            <button
              className="settings-button danger"
              onClick={handleClearAllData}
              style={{ marginTop: '8px' }}
            >
              Clear All Data
            </button>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              This will delete all pins, history, and cached data. Settings will be preserved.
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


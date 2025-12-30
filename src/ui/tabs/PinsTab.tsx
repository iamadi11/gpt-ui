import React, { useState, useMemo } from 'react';
import { usePins } from '../hooks/usePins';
import { PinItemCard } from '../components/PinItemCard';
import { exportPinsToJSON, exportPinsToMarkdown } from '../../shared/utils/download';

interface PinsTabProps {
  onOpen: (url: string) => void;
  onCopyLink: (url: string) => void;
  onCopyCitation: (citation: string) => void;
}

export const PinsTab: React.FC<PinsTabProps> = ({
  onOpen,
  onCopyLink,
  onCopyCitation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'pinnedAt' | 'lastSeenAt' | 'domain' | 'title'>('pinnedAt');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedPins, setSelectedPins] = useState<Set<string>>(new Set());

  const { pins, folders, loading, unpinItem, updateItem, addFolder } = usePins(
    selectedFolderId === 'all' ? undefined : selectedFolderId
  );

  // Filter and sort pins
  const filteredPins = useMemo(() => {
    let filtered = pins;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.domain.toLowerCase().includes(query) ||
          p.note?.toLowerCase().includes(query) ||
          p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'pinnedAt') {
        return b.pinnedAt - a.pinnedAt;
      } else if (sortBy === 'lastSeenAt') {
        return b.lastSeenAt - a.lastSeenAt;
      } else if (sortBy === 'domain') {
        return a.domain.localeCompare(b.domain);
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return sorted;
  }, [pins, searchQuery, sortBy]);

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await addFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };

  const handleExportJSON = () => {
    exportPinsToJSON(filteredPins);
  };

  const handleExportMarkdown = () => {
    exportPinsToMarkdown(filteredPins);
  };

  const handleBulkUnpin = async () => {
    for (const pinId of selectedPins) {
      await unpinItem(pinId);
    }
    setSelectedPins(new Set());
  };

  const handleBulkMove = async (folderId: string) => {
    for (const pinId of selectedPins) {
      await updateItem(pinId, { folderId: folderId === 'all' ? undefined : folderId });
    }
    setSelectedPins(new Set());
  };

  const togglePinSelection = (pinId: string) => {
    const newSelected = new Set(selectedPins);
    if (newSelected.has(pinId)) {
      newSelected.delete(pinId);
    } else {
      newSelected.add(pinId);
    }
    setSelectedPins(newSelected);
  };

  if (loading) {
    return <div className="tab-loading">Loading pins...</div>;
  }

  return (
    <div className="pins-tab">
      <div className="pins-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search pins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search pins"
        />
        
        <div className="pins-controls">
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="folder-select"
          >
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          
          <button
            className="action-button"
            onClick={() => setShowCreateFolder(!showCreateFolder)}
            aria-label="Create folder"
          >
            + Folder
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="pinnedAt">Sort by Pinned Date</option>
            <option value="lastSeenAt">Sort by Last Seen</option>
            <option value="domain">Sort by Domain</option>
            <option value="title">Sort by Title</option>
          </select>
          
          <button
            className="action-button"
            onClick={handleExportJSON}
            aria-label="Export as JSON"
          >
            Export JSON
          </button>
          
          <button
            className="action-button"
            onClick={handleExportMarkdown}
            aria-label="Export as Markdown"
          >
            Export MD
          </button>
        </div>

        {showCreateFolder && (
          <div className="create-folder-form">
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                } else if (e.key === 'Escape') {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }
              }}
              autoFocus
            />
            <button onClick={handleCreateFolder}>Create</button>
            <button onClick={() => {
              setShowCreateFolder(false);
              setNewFolderName('');
            }}>Cancel</button>
          </div>
        )}

        {selectedPins.size > 0 && (
          <div className="bulk-actions">
            <span>{selectedPins.size} selected</span>
            <button onClick={handleBulkUnpin}>Unpin Selected</button>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkMove(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="">Move to...</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="pins-content">
        {filteredPins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📌</div>
            <div className="empty-state-title">No pins found</div>
            <div className="empty-state-text">
              {searchQuery ? 'Try a different search query' : 'Pin results to save them for later'}
            </div>
          </div>
        ) : (
          <>
            <div className="pins-count">{filteredPins.length} {filteredPins.length === 1 ? 'pin' : 'pins'}</div>
            {filteredPins.map((pin) => (
              <div key={pin.id} className="pin-item-wrapper">
                <input
                  type="checkbox"
                  checked={selectedPins.has(pin.id)}
                  onChange={() => togglePinSelection(pin.id)}
                  className="pin-checkbox"
                  aria-label="Select pin"
                />
                <PinItemCard
                  pin={pin}
                  onOpen={onOpen}
                  onCopyLink={onCopyLink}
                  onCopyCitation={onCopyCitation}
                  onEdit={() => {
                    // TODO: Open edit dialog
                  }}
                  onUnpin={unpinItem}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};


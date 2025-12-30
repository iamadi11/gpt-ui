import React, { useEffect } from 'react';
import { useCommandPalette, type Command } from '../hooks/useCommandPalette';

interface CommandPaletteProps {
  isOpen: boolean;
  commands: Command[];
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  commands,
  onClose,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    filteredCommands,
    selectedIndex,
    executeCommand,
  } = useCommandPalette(commands, isOpen);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleCommandClick = (index: number) => {
    executeCommand(index);
    onClose();
  };

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-header">
          <input
            type="text"
            className="command-palette-input"
            placeholder="Type to search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            aria-label="Command search"
          />
        </div>
        <div className="command-palette-list">
          {filteredCommands.length === 0 ? (
            <div className="command-palette-empty">No commands found</div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleCommandClick(index)}
                onMouseEnter={() => {
                  // Update selected index on hover for better UX
                }}
              >
                <div className="command-palette-item-label">{command.label}</div>
                {command.description && (
                  <div className="command-palette-item-description">{command.description}</div>
                )}
                {command.category && (
                  <div className="command-palette-item-category">{command.category}</div>
                )}
              </div>
            ))
          )}
        </div>
        {filteredCommands.length > 0 && (
          <div className="command-palette-footer">
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
            <span>Esc Close</span>
          </div>
        )}
      </div>
    </div>
  );
};


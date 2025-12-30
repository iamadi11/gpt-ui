import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <div
      className="confirm-modal-overlay"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-modal-title" className="confirm-modal-title">{title}</h3>
        <p id="confirm-modal-message" className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button
            className={`confirm-modal-button ${danger ? 'danger' : ''}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
          <button
            className="confirm-modal-button secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};


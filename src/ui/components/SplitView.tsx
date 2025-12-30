import React from 'react';

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  splitPosition?: number; // percentage (0-100)
}

export const SplitView: React.FC<SplitViewProps> = ({
  left,
  right,
  splitPosition = 50,
}) => {
  return (
    <div className="split-view">
      <div className="split-view-left" style={{ width: `${splitPosition}%` }}>
        {left}
      </div>
      <div className="split-view-divider" />
      <div className="split-view-right" style={{ width: `${100 - splitPosition}%` }}>
        {right}
      </div>
    </div>
  );
};


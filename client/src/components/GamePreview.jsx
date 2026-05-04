import React from 'react';

function GamePreview({ colors }) {
  return (
    <div
      className="theme-preview"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
      }}
    />
  );
}

export default GamePreview;

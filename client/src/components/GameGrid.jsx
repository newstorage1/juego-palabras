import React from 'react';

function GameGrid({ children, columns = 3, gap = '1rem' }) {
  return (
    <div 
      className="themes-grid"
      style={{ 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap
      }}
    >
      {children}
    </div>
  );
}

export default GameGrid;

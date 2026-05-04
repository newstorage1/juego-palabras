import React from 'react';

function GameCard({ children, selected = false, onClick }) {
  return (
    <div
      className={`theme-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default GameCard;

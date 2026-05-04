import React from 'react';

function GameScore({ player, isActive }) {
  return (
    <div className={`player-score ${isActive ? 'active' : ''}`}>
      <span>{player.nickname} {isActive && '👤'}</span>
      <span>{player.score} pts</span>
    </div>
  );
}

export default GameScore;

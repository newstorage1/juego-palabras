import React from 'react';

function Scoreboard({ players, currentPlayerIndex }) {
  return (
    <div className="scoreboard">
      <h3>🏆 Marcador</h3>
      {players.map((player, idx) => (
        <div
          key={idx}
          className={`player-score ${idx === currentPlayerIndex ? 'active' : ''}`}
        >
          <span>{player.nickname} {idx === currentPlayerIndex && '👤'}</span>
          <span>{player.score} pts</span>
        </div>
      ))}
    </div>
  );
}

export default Scoreboard;

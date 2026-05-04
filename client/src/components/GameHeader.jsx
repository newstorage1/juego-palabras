import React from 'react';

function GameHeader({ screen, userSettings, onUpdateSettings }) {
  return (
    <header className="header">
      <h1>🎮 Sopa Pro Multiplayer</h1>
      {screen === 'game' && (
        <div className="user-info">
          <div className="avatar">{userSettings.avatar}</div>
          <span>{userSettings.nickname}</span>
        </div>
      )}
    </header>
  );
}

export default GameHeader;

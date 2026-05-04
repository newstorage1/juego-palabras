import React from 'react';

function GameModeSelector({ currentMode, onSelectMode }) {
  return (
    <div className="form-group">
      <label>Modo de juego</label>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          className={`btn ${currentMode === 'create' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onSelectMode('create')}
        >
          🎮 Crear Partida
        </button>
        <button
          className={`btn ${currentMode === 'join' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onSelectMode('join')}
        >
          🎮 Unirse
        </button>
      </div>
    </div>
  );
}

export default GameModeSelector;

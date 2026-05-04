import React from 'react';

function GameCodeInput({ value, onChange, onJoin }) {
  return (
    <div className="form-group">
      <label>Código de la partida</label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Ej: SOPA-X92"
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={onJoin}>
          🎮 Unirse
        </button>
      </div>
    </div>
  );
}

export default GameCodeInput;

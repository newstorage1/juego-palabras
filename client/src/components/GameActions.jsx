import React from 'react';

function GameActions({ onConfirm, onCancel, selectedCount, frozen }) {
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          className="btn btn-primary"
          onClick={onConfirm}
          disabled={selectedCount === 0 || frozen}
          style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
        >
          ✅ Confirmar
        </button>
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={selectedCount === 0}
          style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}

export default GameActions;

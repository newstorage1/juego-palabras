import React from 'react';

function CongestionOverlay({ frozen, frozenTime }) {
  if (!frozen) return null;

  return (
    <div className="frozen-overlay">
      <div className="frozen-message">
        <h2>❌ Congelado</h2>
        <p>Espera {frozenTime} segundos...</p>
      </div>
    </div>
  );
}

export default CongestionOverlay;

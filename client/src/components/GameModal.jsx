import React from 'react';

function GameModal({ title, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        {children}
        <button className="btn btn-primary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default GameModal;

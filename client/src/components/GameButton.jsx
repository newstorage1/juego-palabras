import React from 'react';

function GameButton({ children, variant = 'primary', onClick, disabled = false, style = {} }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline'
  };

  return (
    <button
      className={`btn ${variants[variant]}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

export default GameButton;

import React from 'react';

function GameAvatar({ avatar, size = 40 }) {
  return (
    <div 
      className="avatar"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        fontSize: `${size / 2}px`
      }}
    >
      {avatar}
    </div>
  );
}

export default GameAvatar;

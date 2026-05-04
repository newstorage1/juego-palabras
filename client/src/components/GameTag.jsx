import React from 'react';

function GameTag({ word, found = false }) {
  return (
    <span className={`word-tag ${found ? 'found' : ''}`}>
      {word}
    </span>
  );
}

export default GameTag;

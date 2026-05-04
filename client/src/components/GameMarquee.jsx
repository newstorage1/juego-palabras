import React from 'react';

function GameMarquee({ words }) {
  return (
    <div className="word-marquee">
      <h3>📝 Palabras restantes</h3>
      <div className="marquee-content">
        {words.map((word, idx) => (
          <span key={idx} className="word-tag">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

export default GameMarquee;

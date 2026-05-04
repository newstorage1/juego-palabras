import React from 'react';

function Marquee({ words, foundWords }) {
  return (
    <div className="word-marquee">
      <h3>📝 Palabras restantes</h3>
      <div className="marquee-content">
        {words.map((word, idx) => {
          const isFound = foundWords.includes(word);
          return (
            <span
              key={idx}
              className={`word-tag ${isFound ? 'found' : ''}`}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default Marquee;

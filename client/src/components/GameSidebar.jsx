import React from 'react';

function GameSidebar({ players, timer, remainingWords, chatMessages, onSendMessage, chatInput, setChatInput }) {
  return (
    <div className="game-sidebar">
      <div className="scoreboard">
        <h3>🏆 Marcador</h3>
        {players.map((player, idx) => (
          <div
            key={idx}
            className={`player-score ${idx === 0 ? 'active' : ''}`}
          >
            <span>{player.nickname}</span>
            <span>{player.score} pts</span>
          </div>
        ))}
      </div>

      <div className="timer-display">
        ⏱️ {formatTime(timer)}
      </div>

      <div className="word-marquee">
        <h3>📝 Palabras restantes</h3>
        <div className="marquee-content">
          {remainingWords.map((word, idx) => (
            <span key={idx} className="word-tag">
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.type}`}
            >
              {msg.nickname && <strong>{msg.nickname}: </strong>}
              {msg.message}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Escribe un mensaje..."
          />
          <button onClick={onSendMessage}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default GameSidebar;

import React from 'react';

function GameTimer({ timeLeft }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-display">
      ⏱️ {formatTime(timeLeft)}
    </div>
  );
}

export default GameTimer;

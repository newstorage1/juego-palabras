import React from 'react';

function GameStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="modal">
      <h2>🏆 Estadísticas del Juego</h2>
      
      <div className="modal-stats">
        <div className="stat-item">
          <div className="stat-value">{stats.winner || 'Nadie'}</div>
          <div className="stat-label">Ganador</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.winnerScore || 0}</div>
          <div className="stat-label">Puntaje Ganador</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.longestWord || '-'}</div>
          <div className="stat-label">Palabra Más Larga</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.totalFound} / {stats.totalWords}</div>
          <div className="stat-label">Palabras Encontradas</div>
        </div>
      </div>

      <div className="modal-stats">
        <div className="stat-item">
          <div className="stat-value">{stats.averageReactionTime || 0}s</div>
          <div className="stat-label">Tiempo Promedio</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.accuracy || 0}%</div>
          <div className="stat-label">Precisión</div>
        </div>
      </div>

      <h3>🏆 Marcador Final</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {stats.players?.map((player, idx) => (
          <div key={idx} className="player-score">
            <span>{player.nickname}</span>
            <span>{player.score} pts ({player.foundWords} palabras)</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        🎮 Volver al Menú
      </button>
    </div>
  );
}

export default GameStats;

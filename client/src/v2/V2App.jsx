import React, { useState, useEffect } from 'react';
import PreLobby from './PreLobby';
import LobbyIndividual from './LobbyIndividual';
import LobbyMultijugador from './LobbyMultijugador';
import './V2.css';

export default function V2App() {
  const [userData, setUserData] = useState(null);
  const [screen, setScreen] = useState('prelobby');
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('v2_userData');
    if (saved) {
      setUserData(JSON.parse(saved));
      setScreen('lobby');
    }
  }, []);

  const handleEnter = (data) => {
    setUserData(data);
    localStorage.setItem('v2_userData', JSON.stringify(data));
    setScreen('lobby');
  };

  const handleLogout = () => {
    setUserData(null);
    setScreen('prelobby');
    localStorage.removeItem('v2_userData');
  };

  const handleStartGame = (gameId, data, playerIndex) => {
    setGameData(data);
    setScreen('game');
  };

  const handleBackToLobby = () => {
    setGameData(null);
    setScreen('lobby');
  };

  if (screen === 'prelobby' || !userData) {
    return <PreLobby onEnter={handleEnter} />;
  }

  if (screen === 'game' && gameData) {
    return (
      <div className="v2-game">
        <div className="v2-game-header">
          <h1>🎮 Sopa de Letras - Versión 2</h1>
          <button className="v2-logout" onClick={handleBackToLobby}>Volver al Lobby</button>
        </div>
        <div className="v2-game-content">
          <h2>🏆 ¡Bienvenidos Jugadores!</h2>
          <div className="players-list">
            {gameData.players.map((player, idx) => (
              <div key={idx} className="player-item">
                <span className="player-avatar">{player.avatar}</span>
                <span className="player-name">{player.nickname}</span>
                {idx === 0 && <span className="player-badge">Creador</span>}
              </div>
            ))}
          </div>
          <p className="game-info-text">El juego está comenzando...</p>
        </div>
      </div>
    );
  }

  const renderLobby = () => {
    if (userData.gameMode === 'multijugador') {
      return (
        <LobbyMultijugador 
          userData={userData} 
          onLogout={handleLogout}
          onStartGame={handleStartGame}
        />
      );
    }
    return (
      <LobbyIndividual 
        userData={userData} 
        onLogout={handleLogout}
        onStartGame={handleStartGame}
      />
    );
  };

  return (
    <div className="v2-lobby">
      <div className="v2-header">
        <h1>🎮 Sopa de Letras - Versión 2</h1>
        <div className="v2-user-info">
          <span className="v2-avatar">{userData.avatar}</span>
          <span className="v2-nickname">{userData.nickname}</span>
          <span className="v2-mode">
            {userData.gameMode === 'individual' ? '🔵 Individual' : '🟢 Multijugador'}
          </span>
          <span className="v2-stats" title="Partidas ganadas">
            🏆 {userData.partidasGanadas || 0}
          </span>
          <span className="v2-stats" title="Mejor puntaje">
            ⭐ {userData.mejorPuntaje || 0}
          </span>
          <button className="v2-logout" onClick={handleLogout}>Salir</button>
        </div>
      </div>
      {renderLobby()}
    </div>
  );
}
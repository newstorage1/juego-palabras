import React, { useState, useEffect } from 'react';
import PreLobby from './PreLobby';
import LobbyIndividual from './LobbyIndividual';
import LobbyMultijugador from './LobbyMultijugador';
import GameScreen from './GameScreen';
import { useSounds } from '../hooks/useSounds';
import './V2.css';

export default function V2App() {
  const [userData, setUserData] = useState(null);
  const [screen, setScreen] = useState('prelobby');
  const [gameData, setGameData] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const sounds = useSounds(userData?.soundEnabled !== false);

  useEffect(() => {
    const saved = localStorage.getItem('v2_userData');
    if (saved) {
      setUserData(JSON.parse(saved));
    }
    
    const savedGame = localStorage.getItem('v2_currentGame');
    if (savedGame) {
      const gameInfo = JSON.parse(savedGame);
      setCurrentGameId(gameInfo.gameId);
      setGameData(gameInfo.gameData);
      setPlayerIndex(gameInfo.playerIndex || 0);
      setScreen('game');
    } else {
      setScreen('lobby');
    }
  }, []);

  useEffect(() => {
    if (userData?.theme) {
      document.documentElement.setAttribute('data-theme', userData.theme);
    }
  }, [userData?.theme]);

  const handleEnter = (data) => {
    setUserData(data);
    localStorage.setItem('v2_userData', JSON.stringify(data));
    setScreen('lobby');
  };

  const handleLogout = () => {
    setUserData(null);
    setGameData(null);
    setCurrentGameId(null);
    setScreen('prelobby');
    localStorage.removeItem('v2_userData');
    localStorage.removeItem('v2_currentGame');
    document.documentElement.setAttribute('data-theme', 'default');
  };

  const handleUpdateTheme = (theme) => {
    const updated = { ...userData, theme };
    setUserData(updated);
    localStorage.setItem('v2_userData', JSON.stringify(updated));
    document.documentElement.setAttribute('data-theme', theme);
  };

  const handleToggleSound = () => {
    const newSoundEnabled = !userData.soundEnabled;
    const updated = { ...userData, soundEnabled: newSoundEnabled };
    setUserData(updated);
    localStorage.setItem('v2_userData', JSON.stringify(updated));
  };

  const handleStartGame = (gameId, data, pIndex) => {
    console.log('handleStartGame - gameId:', gameId, 'data:', data, 'playerIndex:', pIndex);
    setCurrentGameId(gameId);
    setGameData(data);
    setPlayerIndex(pIndex || 0);
    setScreen('game');
    
    localStorage.setItem('v2_currentGame', JSON.stringify({
      gameId,
      gameData: data,
      playerIndex: pIndex || 0
    }));
  };

  const handleBackToLobby = () => {
    setGameData(null);
    setCurrentGameId(null);
    setScreen('lobby');
    localStorage.removeItem('v2_currentGame');
  };

  if (screen === 'prelobby' || !userData) {
    return <PreLobby onEnter={handleEnter} />;
  }

  if (screen === 'game' && gameData) {
    return (
      <GameScreen 
        gameId={currentGameId}
        gameData={gameData}
        playerIndex={playerIndex}
        userData={userData}
        onBack={handleBackToLobby}
        sounds={sounds}
      />
    );
  }

  const renderLobby = () => {
    if (userData.gameMode === 'multijugador') {
      return (
        <LobbyMultijugador 
          userData={userData} 
          onLogout={handleLogout}
          onStartGame={handleStartGame}
          onUpdateTheme={handleUpdateTheme}
          onToggleSound={handleToggleSound}
          soundEnabled={userData.soundEnabled}
        />
      );
    }
    return (
      <LobbyIndividual 
        userData={userData} 
        onLogout={handleLogout}
        onStartGame={handleStartGame}
        onUpdateTheme={handleUpdateTheme}
        onToggleSound={handleToggleSound}
        soundEnabled={userData.soundEnabled}
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
          <button 
            className="v2-sound-toggle" 
            onClick={handleToggleSound}
            title={userData.soundEnabled !== false ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {userData.soundEnabled !== false ? '🔊' : '🔇'}
          </button>
          <button className="v2-logout" onClick={handleLogout}>Salir</button>
        </div>
      </div>
      {renderLobby()}
    </div>
  );
}
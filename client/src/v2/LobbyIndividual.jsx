import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './V2.css';

const AVAILABLE_THEMES = [
  { name: 'default', label: 'Clásico', colors: ['#667eea', '#764ba2'] },
  { name: 'dark', label: 'Oscuro', colors: ['#4a5568', '#2d3748'] },
  { name: 'neon', label: 'Neón', colors: ['#ff00ff', '#00ffff'] },
  { name: 'nature', label: 'Naturaleza', colors: ['#228b22', '#32cd32'] },
  { name: 'ocean', label: 'Océano', colors: ['#006994', '#00bfff'] }
];

export default function LobbyIndividual({ userData, onLogout, onStartGame, onUpdateTheme }) {
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [mode, setMode] = useState('create');
  const [joinCode, setJoinCode] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
  const [settings, setSettings] = useState({
    gridSize: 15,
    language: 'es',
    theme: 'default'
  });
  const [gameEndedData, setGameEndedData] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      setSocketId(newSocket.id);
    });

    newSocket.on('gameEnded', (data) => {
      setGameEndedData(data);
      
      // Actualizar estadísticas
      const user = JSON.parse(localStorage.getItem('v2_userData') || '{}');
      const currentSocketId = newSocket.id;
      
      // Verificar si el usuario ganó
      if (data.winner && data.winner.id === currentSocketId) {
        user.partidasGanadas = (user.partidasGanadas || 0) + 1;
      }
      
      // Verificar mejor puntaje
      const myScore = data.finalScores?.find(p => p.id === currentSocketId);
      if (myScore && myScore.score > (user.mejorPuntaje || 0)) {
        user.mejorPuntaje = myScore.score;
      }
      
      localStorage.setItem('v2_userData', JSON.stringify(user));
      
      // Después de 5 segundos volver al lobby
      setTimeout(() => {
        setCurrentGame(null);
        setGameEndedData(null);
      }, 5000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCreateGame = () => {
    if (!socket) return;
    
    socket.emit('createGame', {
      nickname: userData.nickname,
      age: userData.age,
      avatar: userData.avatar,
      settings: { gridSize: settings.gridSize, language: settings.language, theme: settings.theme }
    }, (response) => {
      if (response.success) {
        setCurrentGame({
          gameId: response.gameId,
          players: response.gameData.players,
          isCreator: true
        });
        if (onStartGame) {
          onStartGame(response.gameId, response.gameData, 0);
        }
      }
    });
  };

  const handleJoinGame = () => {
    if (!joinCode.trim() || !socket) return;
    
    socket.emit('joinGame', {
      gameId: joinCode.trim().toUpperCase(),
      userData: {
        nickname: userData.nickname,
        age: userData.age,
        avatar: userData.avatar
      }
    }, (response) => {
      if (response.success) {
        setCurrentGame({
          gameId: joinCode.trim().toUpperCase(),
          players: response.gameData.players,
          isCreator: false
        });
        if (onStartGame) {
          onStartGame(response.gameId, response.gameData, response.gameData.players.length - 1);
        }
      } else {
        alert(response.error || 'Error al unirse');
      }
    });
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h2>🎮 Modo Individual</h2>
        
        <div className="form-group">
          <label>Idioma</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="form-group">
          <label>Dificultad</label>
          <select
            value={settings.gridSize}
            onChange={(e) => setSettings({ ...settings, gridSize: parseInt(e.target.value) })}
          >
            <option value={10}>Fácil (10x10)</option>
            <option value={15}>Medio (15x15)</option>
            <option value={20}>Difícil (20x20)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Selecciona tu tema</label>
          <div className="themes-grid">
            {AVAILABLE_THEMES.map((theme) => (
              <button
                key={theme.name}
                className={`theme-option ${settings.theme === theme.name ? 'selected' : ''}`}
                onClick={() => {
                  setSettings({ ...settings, theme: theme.name });
                  if (onUpdateTheme) onUpdateTheme(theme.name);
                }}
              >
                <div
                  className="theme-preview"
                  style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})` }}
                />
                <span>{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Opción</label>
          <div className="btn-group">
            <button
              className={`btn ${mode === 'create' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMode('create')}
            >
              Crear Partida
            </button>
            <button
              className={`btn ${mode === 'join' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMode('join')}
            >
              Unirse a Partida
            </button>
          </div>
        </div>

        {mode === 'create' ? (
          <button className="btn btn-primary" onClick={handleCreateGame}>
            🎮 Crear Partida
          </button>
        ) : (
          <>
            <div className="form-group">
              <label>Código de la partida</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="SOPA-XXX"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <button className="btn btn-primary" onClick={handleJoinGame}>
              Unirse a Partida
            </button>
          </>
        )}

        {currentGame && (
          <div className="game-info">
            <p>Partida: <strong>{currentGame.gameId}</strong></p>
            <p>Jugadores: {currentGame.players.length}</p>
          </div>
        )}
      </div>

      {gameEndedData && (
        <div className="game-ended-overlay">
          <div className="game-ended-modal">
            <h2>🏆 Fin del Juego</h2>
            <p className="winner">
              Tu puntuación: <strong>{gameEndedData.finalScores?.[0]?.score || 0} pts</strong>
            </p>
            <p className="redirect-msg">Volviendo al lobby en 5 segundos...</p>
          </div>
        </div>
      )}
    </div>
  );
}
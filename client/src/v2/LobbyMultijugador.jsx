import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './V2.css';

const AVAILABLE_THEMES = [
  { name: 'default', label: 'Clásico', colors: ['#667eea', '#764ba2'] },
  { name: 'dark', label: 'Oscuro', colors: ['#4a5568', '#2d3748'] },
  { name: 'neon', label: 'Neón', colors: ['#ff00ff', '#00ffff'] },
  { name: 'nature', label: 'Naturaleza', colors: ['#228b22', '#32cd32'] },
  { name: 'ocean', label: 'Océano', colors: ['#006994', '#00bfff'] }
];

export default function LobbyMultijugador({ userData, onLogout, onStartGame }) {
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [settings, setSettings] = useState({
    gridSize: 15,
    language: 'es',
    theme: 'default'
  });
  const [joinCode, setJoinCode] = useState('');
  const [gameEndedData, setGameEndedData] = useState(null);
  const [gameState, setGameState] = useState('waiting');
  const chatRef = useRef(null);
  const currentGameRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Conectado al socket');
      setSocketId(newSocket.id);
      newSocket.emit('joinLobby');
    });

    newSocket.on('lobbyChatMessage', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    newSocket.on('lobbyChatHistory', (messages) => {
      setChatMessages(messages);
    });

    newSocket.on('playerJoined', (data) => {
      setPlayers(data.players);
    });

    let gameStartedHandled = false;
    
    newSocket.on('gameStarted', (data) => {
      console.log('🎮 gameStarted recibido:', data);
      
      if (data.gameState) {
        setGameState(data.gameState);
      }
      
      if (gameStartedHandled) {
        console.log('⚠️ gameStarted ya procesado, ignorando');
        return;
      }
      gameStartedHandled = true;
      
      const gameInfo = currentGameRef.current || currentGame;
      
      // Calcular el índice del jugador actual
      const playerIdx = data.players?.findIndex(p => p.id === newSocket.id) || 0;
      
      if (onStartGame && gameInfo && gameInfo.gameId) {
        console.log('➡️ Llamando onStartGame con gameId:', gameInfo.gameId, 'playerIndex:', playerIdx);
        onStartGame(gameInfo.gameId, data, playerIdx);
      } else {
        console.log('⚠️ No se puede iniciar - gameInfo:', gameInfo);
        gameStartedHandled = false;
      }
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
        setPlayers([]);
        setGameEndedData(null);
        newSocket.emit('joinLobby');
      }, 5000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendChatMessage = () => {
    if (!chatInput.trim() || !socket) return;
    
    socket.emit('lobbyChatMessage', {
      nickname: userData.nickname,
      avatar: userData.avatar,
      message: chatInput
    });
    setChatInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendChatMessage();
  };

  const handleCreateGame = () => {
    if (!socket) return;

    socket.emit('createGame', {
      nickname: userData.nickname,
      age: userData.age,
      avatar: userData.avatar,
      settings: { gridSize: settings.gridSize, language: settings.language, theme: settings.theme }
    }, (response) => {
      if (response.success) {
        setCurrentGame({ gameId: response.gameId, isCreator: true });
        currentGameRef.current = { gameId: response.gameId, isCreator: true };
        setPlayers(response.gameData.players);
        
        socket.emit('lobbyChatMessage', {
          nickname: 'Sistema',
          avatar: '🤖',
          message: `El jugador ${userData.nickname} ha creado la sala ${response.gameId}`
        });
      }
    });
  };

  const handleJoinGame = () => {
    if (!socket || !joinCode.trim()) return;

    socket.emit('joinGame', {
      gameId: joinCode.trim().toUpperCase(),
      userData: {
        nickname: userData.nickname,
        age: userData.age,
        avatar: userData.avatar
      }
    }, (response) => {
      if (response.success) {
        setCurrentGame({ gameId: joinCode.trim().toUpperCase(), isCreator: false });
        currentGameRef.current = { gameId: joinCode.trim().toUpperCase(), isCreator: false };
        setPlayers(response.gameData.players);

        socket.emit('lobbyChatMessage', {
          nickname: 'Sistema',
          avatar: '🤖',
          message: `El jugador ${userData.nickname} se ha unido a la sala ${joinCode.trim().toUpperCase()}`
        });
      } else {
        alert(response.error || 'Error al unirse');
      }
    });
  };

  const handleStartGame = () => {
    if (!socket || !currentGame) {
      console.log('No se puede iniciar: socket=', !!socket, 'currentGame=', !!currentGame);
      return;
    }
    console.log('Iniciando juego:', currentGame.gameId, 'socket.id=', socket.id);
    socket.emit('startGame', currentGame.gameId);
  };

  return (
    <div className="lobby-multijugador">
      <div className="lobby-main">
        <div className="game-section">
          {!currentGame ? (
            <>
              <div className="tab-buttons">
                <button
                  className={`tab ${activeTab === 'create' ? 'active' : ''}`}
                  onClick={() => setActiveTab('create')}
                >
                  Crear Partida
                </button>
                <button
                  className={`tab ${activeTab === 'join' ? 'active' : ''}`}
                  onClick={() => setActiveTab('join')}
                >
                  Unirse a Partida
                </button>
              </div>

              {activeTab === 'create' && (
                <div className="create-form">
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
                          onClick={() => setSettings({ ...settings, theme: theme.name })}
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

                  <button className="btn btn-primary" onClick={handleCreateGame}>
                    Crear Partida
                  </button>
                </div>
              )}

              {activeTab === 'join' && (
                <div className="join-form">
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
                </div>
              )}
            </>
          ) : (
            <div className="game-waiting">
              <h3>📋 Partida</h3>
              <p>Código: <strong>{currentGame.gameId}</strong></p>
              <p>Estado: <strong>{gameState === 'playing' ? '🟢 En juego' : '⏳ Esperando'}</strong></p>
              <p>Jugadores: {players.length}/4</p>
              
              <div className="players-list">
                {players.map((player, idx) => (
                  <div key={idx} className="player-item">
                    <span className="player-avatar">{player.avatar}</span>
                    <span className="player-name">{player.nickname}</span>
                    {idx === 0 && <span className="player-badge">Creador</span>}
                  </div>
                ))}
              </div>

              {currentGame.isCreator && players.length >= 1 ? (
                <button className="btn btn-start" onClick={handleStartGame}>
                  ▶ Iniciar Juego
                </button>
              ) : !currentGame.isCreator ? (
                <p className="waiting-message">⏳ Esperando que el creador inicie el juego...</p>
              ) : players.length < 1 ? (
                <p className="waiting-message">⏳ Esperando jugadores...</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="chat-section">
          <h3>💬 Chat Global</h3>
          <div className="chat-messages" ref={chatRef}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.nickname === 'Sistema' ? 'system' : 'user'}`}>
                <span className="msg-time">{msg.time}</span>
                {msg.nickname !== 'Sistema' && <span className="msg-nickname">{msg.avatar} {msg.nickname}: </span>}
                {msg.nickname === 'Sistema' ? <span className="msg-text">{msg.message}</span> : <span className="msg-text">{msg.message}</span>}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
            />
            <button onClick={sendChatMessage}>Enviar</button>
          </div>
        </div>
      </div>

      {gameEndedData && (
        <div className="game-ended-overlay">
          <div className="game-ended-modal">
            <h2>🏆 Fin del Juego</h2>
            <p className="winner">
              Ganador: <strong>{gameEndedData.winner?.nickname || 'Empate'}</strong>
            </p>
            <div className="final-scores">
              <h3>Puntuaciones Finales:</h3>
              {gameEndedData.finalScores?.map((score, idx) => (
                <div key={idx} className="score-item">
                  <span>{score.nickname}: {score.score} pts</span>
                </div>
              ))}
            </div>
            <p className="redirect-msg">Volviendo al lobby en 5 segundos...</p>
          </div>
        </div>
      )}
    </div>
  );
}
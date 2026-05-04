import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { SOCKET_URL } from './config/config';
import io from 'socket.io-client';

const socket = io(SOCKET_URL);

function App() {
  const [screen, setScreen] = useState('lobby');
  const [gameId, setGameId] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(null);
  const [userSettings, setUserSettings] = useState({
    nickname: '',
    avatar: 'default',
    theme: 'default',
    backgroundImage: null,
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb'
    }
  });

  // Aplicar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', userSettings.theme);
  }, [userSettings.theme]);

  // Configuración del juego
  const handleCreateGame = useCallback((userData) => {
    socket.emit('createGame', {
      ...userData,
      settings: userSettings
    }, (response) => {
      if (response.success) {
        setGameId(response.gameId);
        setGameData(response.gameData);
        setPlayerIndex(0);
        setScreen('game');
      }
    });
  }, [userSettings]);

  const handleJoinGame = useCallback((gameId, userData) => {
    socket.emit('joinGame', {
      gameId,
      userData: { ...userData, settings: userSettings }
    }, (response) => {
      if (response.success) {
        setGameId(gameId);
        setGameData(response.gameData);
        setPlayerIndex(response.gameData.players.length - 1);
        setScreen('game');
      }
    });
  }, [userSettings]);

  // Actualizar configuración del usuario
  const updateUserSettings = useCallback((settings) => {
    setUserSettings(prev => ({ ...prev, ...settings }));
    if (gameId && playerIndex !== null) {
      socket.emit('updateUserSettings', {
        gameId,
        playerIndex,
        settings
      });
    }
  }, [gameId, playerIndex]);

  return (
    <div className="app">
      <Header 
        screen={screen} 
        userSettings={userSettings} 
        onUpdateSettings={updateUserSettings}
      />
      
      <div className="content">
        {screen === 'lobby' && (
          <Lobby 
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
            userSettings={userSettings}
            onUpdateSettings={updateUserSettings}
          />
        )}
        
        {screen === 'game' && gameData && (
          <Game 
            gameData={gameData}
            playerIndex={playerIndex}
            userSettings={userSettings}
            onUpdateSettings={updateUserSettings}
            gameId={gameId}
          />
        )}
      </div>
    </div>
  );
}

// Header Component
function Header({ screen, userSettings, onUpdateSettings }) {
  return (
    <header className="header">
      <h1>🎮 Sopa Pro Multiplayer</h1>
      {screen === 'game' && (
        <div className="user-info">
          <div className="avatar">{userSettings.avatar}</div>
          <span>{userSettings.nickname}</span>
        </div>
      )}
    </header>
  );
}

// Lobby Component
function Lobby({ onCreateGame, onJoinGame, userSettings, onUpdateSettings }) {
  const [mode, setMode] = useState('create');
  const [formData, setFormData] = useState({
    nickname: '',
    avatar: 'default',
    gridSize: 15,
    theme: 'default',
    language: 'es'
  });
  const [joinCode, setJoinCode] = useState('');
  const [availableThemes, setAvailableThemes] = useState([
    { name: 'default', label: 'Clásico', colors: ['#667eea', '#764ba2', '#f093fb'] },
    { name: 'dark', label: 'Oscuro', colors: ['#4a5568', '#2d3748', '#4fd1c5'] },
    { name: 'neon', label: 'Neón', colors: ['#ff00ff', '#00ffff', '#ffff00'] },
    { name: 'nature', label: 'Naturaleza', colors: ['#228b22', '#32cd32', '#90ee90'] },
    { name: 'ocean', label: 'Océano', colors: ['#006994', '#00bfff', '#87cefa'] }
  ]);

  const handleCreate = () => {
    onCreateGame(formData);
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      onJoinGame(joinCode.toUpperCase(), formData);
    }
  };

  const handleThemeSelect = (theme) => {
    onUpdateSettings({
      theme: theme.name,
      colors: {
        primary: theme.colors[0],
        secondary: theme.colors[1],
        accent: theme.colors[2]
      }
    });
  };

  return (
    <div className="lobby">
      <div className="lobby-card">
        <h2>🎮 Sopa de Letras</h2>
        
        <div className="form-group">
          <label>Nickname</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            placeholder="Tu nombre"
          />
        </div>

        <div className="form-group">
          <label>Avatar</label>
          <select
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          >
            <option value="default">👤</option>
            <option value="🦁">🦁</option>
            <option value="🐯">🐯</option>
            <option value="🐼">🐼</option>
            <option value="🐨">🐨</option>
            <option value="🦊">🦊</option>
            <option value="🐶">🐶</option>
            <option value="🐱">🐱</option>
          </select>
        </div>

        <div className="form-group">
          <label>Idioma</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="form-group">
          <label>Dificultad (Tamaño)</label>
          <select
            value={formData.gridSize}
            onChange={(e) => setFormData({ ...formData, gridSize: parseInt(e.target.value) })}
          >
            <option value={10}>Fácil (10x10)</option>
            <option value={15}>Medio (15x15)</option>
            <option value={20}>Difícil (20x20)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Selecciona tu tema</label>
          <div className="themes-grid">
            {availableThemes.map((theme) => (
              <div
                key={theme.name}
                className={`theme-card ${userSettings.theme === theme.name ? 'selected' : ''}`}
                onClick={() => handleThemeSelect(theme)}
              >
                <div
                  className="theme-preview"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`
                  }}
                />
                <span>{theme.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Modo de juego</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
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
              Unirse
            </button>
          </div>
        </div>

        {mode === 'create' ? (
          <button className="btn btn-primary" onClick={handleCreate}>
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
                placeholder="Ej: SOPA-X92"
              />
            </div>
            <button className="btn btn-primary" onClick={handleJoin}>
              🎮 Unirse a Partida
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Game Component
function Game({ gameData, playerIndex, userSettings, onUpdateSettings, gameId }) {
  const [grid, setGrid] = useState(gameData.grid);
  const [words, setWords] = useState(gameData.words);
  const [players, setPlayers] = useState(gameData.players);
  const [selectedCells, setSelectedCells] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [timer, setTimer] = useState(gameData.settings.timeLimitMinutes * 60);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [frozen, setFrozen] = useState(false);
  const [frozenTime, setFrozenTime] = useState(0);

  // Actualizar estado cuando cambia gameData
  useEffect(() => {
    setGrid(gameData.grid);
    setWords(gameData.words);
    setPlayers(gameData.players);
  }, [gameData]);

  // Temporizador
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Congelamiento
  useEffect(() => {
    if (frozen) {
      const interval = setInterval(() => {
        setFrozenTime(prev => {
          if (prev <= 1) {
            setFrozen(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [frozen]);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Manejar selección de celda
  const handleCellClick = (row, col) => {
    if (frozen) return;

    const cell = { row, col, letter: grid[row][col] };
    
    if (selectedCells.length === 0) {
      setSelectedCells([cell]);
      setCurrentWord(cell.letter);
    } else {
      const lastCell = selectedCells[selectedCells.length - 1];
      const rowDiff = row - lastCell.row;
      const colDiff = col - lastCell.col;
      
      // Verificar si es una dirección válida
      const validDirections = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ];
      
      if (validDirections.some(([dr, dc]) => dr === rowDiff && dc === colDiff)) {
        setSelectedCells([...selectedCells, cell]);
        setCurrentWord(currentWord + cell.letter);
      }
    }
  };

  // Confirmar selección
  const confirmSelection = () => {
    if (currentWord.length < 2) {
      setSelectedCells([]);
      setCurrentWord('');
      return;
    }

    socket.emit('selectWord', {
      gameId,
      playerIndex,
      coordinates: selectedCells.map(c => [c.row, c.col]),
      word: currentWord
    });

    setSelectedCells([]);
    setCurrentWord('');
  };

  // Enviar mensaje de chat
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      socket.emit('chatMessage', {
        gameId,
        message: chatInput,
        playerId: players[playerIndex]?.id,
        nickname: players[playerIndex]?.nickname
      });
      setChatInput('');
    }
  };

  // Escuchar eventos del servidor
  useEffect(() => {
    socket.on('wordFound', (data) => {
      setWords(prev => prev.map(w => 
        w.word === data.word ? { ...w, foundBy: data.playerId } : w
      ));
      setPlayers(prev => prev.map(p => 
        p.id === data.playerId 
          ? { ...p, score: p.score + data.points, foundWords: [...p.foundWords, data.word] }
          : p
      ));
    });

    socket.on('playerFrozen', (data) => {
      if (data.playerId === players[playerIndex]?.id) {
        setFrozen(true);
        setFrozenTime(data.duration);
      }
    });

    socket.on('timerUpdate', (data) => {
      setTimer(data.timeLeft);
    });

    socket.on('gameEnded', (data) => {
      alert(`¡Juego terminado! Ganador: ${data.winner?.nickname || 'Nadie'} con ${data.winner?.score || 0} puntos`);
      setScreen('lobby');
    });

    socket.on('chatMessage', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off('wordFound');
      socket.off('playerFrozen');
      socket.off('timerUpdate');
      socket.off('gameEnded');
      socket.off('chatMessage');
    };
  }, [players, playerIndex, gameId]);

  // Calcular palabras encontradas por el jugador actual
  const myFoundWords = players[playerIndex]?.foundWords || [];
  const remainingWords = words.filter(w => !w.foundBy).map(w => w.word);

  return (
    <div className="game-container">
      {/* Sidebar */}
      <div className="game-sidebar">
        <div className="scoreboard">
          <h3>🏆 Marcador</h3>
          {players.map((player, idx) => (
            <div
              key={idx}
              className={`player-score ${idx === playerIndex ? 'active' : ''}`}
            >
              <span>{player.nickname} {idx === playerIndex && '👤'}</span>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe un mensaje..."
            />
            <button onClick={handleSendMessage}>Enviar</button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="board-container">
        <div
          className="board"
          style={{
            gridTemplateColumns: `repeat(${gameData.settings.gridSize}, 1fr)`
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected = selectedCells.some(
                c => c.row === rowIndex && c.col === colIndex
              );
              const isFound = words.some(
                w => w.foundBy && w.coordinates.some(
                  coord => coord[0] === rowIndex && coord[1] === colIndex
                )
              );

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`cell ${isSelected ? 'selected' : ''} ${isFound ? 'found' : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Botón confirmar */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}>
        <button
          className="btn btn-primary"
          onClick={confirmSelection}
          disabled={selectedCells.length === 0 || frozen}
          style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}
        >
          ✅ Confirmar
        </button>
      </div>

      {/* Overlay de congelamiento */}
      {frozen && (
        <div className="frozen-overlay">
          <div className="frozen-message">
            <h2>❌ Congelado</h2>
            <p>Espera {frozenTime} segundos...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

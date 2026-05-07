import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './V2.css';

export default function GameScreen({ gameId, gameData, playerIndex, userData, onBack }) {
  const [grid, setGrid] = useState(gameData?.grid || []);
  const [words, setWords] = useState(gameData?.words || []);
  const [players, setPlayers] = useState(gameData?.players || []);
  const [selectedCells, setSelectedCells] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [timer, setTimer] = useState((gameData?.settings?.timeLimitMinutes || 15) * 60);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [frozen, setFrozen] = useState(false);
  const [frozenTime, setFrozenTime] = useState(0);
  const [localGameEndedData, setLocalGameEndedData] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    if (gameData) {
      setGrid(gameData.grid || []);
      setWords(gameData.words || []);
      setPlayers(gameData.players || []);
    }
  }, [gameData]);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Conectado al juego, uniéndose a sala:', gameId);
      newSocket.emit('joinGame', { gameId, userData: { nickname: userData.nickname } }, () => {});
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

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

  // Polling HTTP para recibir mensajes y resultados de palabras (como V1)
  useEffect(() => {
    if (!gameId) return;
    
    const interval = setInterval(async () => {
      try {
        // Obtener mensajes
        const msgRes = await fetch(`http://localhost:3001/api/chat/${gameId}`);
        const msgData = await msgRes.json();
        if (msgData.messages) setChatMessages(msgData.messages);
        
        // Obtener resultado de palabra (del servidor o de otros jugadores)
        const wordRes = await fetch(`http://localhost:3001/api/selectWord/${gameId}`);
        const wordData = await wordRes.json();
        
        if (wordData && wordData.result && wordData.result.found) {
          console.log('📬 Resultado palabra:', wordData.result);
          
          // Actualizar palabras encontradas
          setWords(prev => prev.map(w => 
            w.word === wordData.result.word ? { ...w, foundBy: wordData.result.playerId } : w
          ));
          // Actualizar puntuación
          setPlayers(prev => prev.map(p => 
            p.id === wordData.result.playerId 
              ? { ...p, score: p.score + wordData.result.points, foundWords: [...p.foundWords, wordData.result.word] }
              : p
          ));
        }
      } catch (e) {
        // Silencioso
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameId]);

  // Escuchar eventos del servidor (como V1)
  useEffect(() => {
    socketRef.current?.on('wordFound', (data) => {
      console.log('📬 wordFound socket:', data);
      setWords(prev => prev.map(w => 
        w.word === data.word ? { ...w, foundBy: data.playerId } : w
      ));
      setPlayers(prev => prev.map(p => 
        p.id === data.playerId 
          ? { ...p, score: p.score + data.points, foundWords: [...p.foundWords, data.word] }
          : p
      ));
    });

    socketRef.current?.on('playerFrozen', (data) => {
      const currentPlayerId = players[playerIndex]?.id;
      if (data.playerId === currentPlayerId) {
        setFrozen(true);
        setFrozenTime(data.duration);
      }
    });

    socketRef.current?.on('timerUpdate', (data) => {
      setTimer(data.timeLeft);
    });

    socketRef.current?.on('gameEnded', (data) => {
      console.log('🎉 Juego terminado:', data);
      setLocalGameEndedData(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('wordFound');
        socketRef.current.off('playerFrozen');
        socketRef.current.off('timerUpdate');
        socketRef.current.off('gameEnded');
      }
    };
  }, [players, playerIndex, gameId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Confirmar selección usando Socket (como V1)
  const confirmSelection = async () => {
    if (currentWord.length < 2) {
      setSelectedCells([]);
      setCurrentWord('');
      return;
    }

    const wordFound = words.find(w => w.word === currentWord && !w.foundBy);

    if (socketRef.current) {
      socketRef.current.emit('selectWord', {
        gameId,
        playerIndex,
        coordinates: selectedCells.map(c => [c.row, c.col]),
        word: currentWord
      });

      if (wordFound) {
        const currentPlayer = players[playerIndex];
        const points = currentWord.length >= 8 ? 3 : currentWord.length >= 5 ? 2 : 1;
        console.log('✅ Palabra encontrada:', currentWord, points, 'pts');
        setWords(prev => prev.map(w => 
          w.word === currentWord ? { ...w, foundBy: currentPlayer?.id } : w
        ));
        setPlayers(prev => prev.map(p => 
          p.id === currentPlayer?.id 
            ? { ...p, score: p.score + points, foundWords: [...p.foundWords, currentWord] }
            : p
        ));
      }
      
      setSelectedCells([]);
      setCurrentWord('');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          message: chatInput,
          playerId: players[playerIndex]?.id,
          nickname: players[playerIndex]?.nickname
        })
      });
      setChatInput('');
    } catch (e) {
      console.error('Error chat:', e);
    }
  };

  // Calcular palabras restantes (como V1)
  const remainingWords = words.filter(w => !w.foundBy).map(w => w.word);
  const foundByMeWords = words.filter(w => w.foundBy === players[playerIndex]?.id).map(w => w.word);

  // Función para determinar clase de palabra
  const getWordClass = (word) => {
    const wordObj = words.find(w => w.word === word);
    if (!wordObj?.foundBy) return ''; // No encontrada
    if (wordObj.foundBy === players[playerIndex]?.id) return 'found-by-me'; // Encontrada por mí
    return 'found-by-other'; // Encontrada por otro
  };

  if (localGameEndedData) {
    return (
      <div className="game-ended-overlay-v2">
        <div className="game-ended-modal">
          <h1>🎉 ¡Juego Terminado!</h1>
          <div className="winner-section">
            <h2>Ganador: {localGameEndedData.winner?.nickname || 'Nadie'}</h2>
            <p className="winner-score">Puntos: {localGameEndedData.winner?.score || 0}</p>
          </div>
          <div className="final-scores">
            <h3>Puntuación Final:</h3>
            {localGameEndedData.finalScores?.map((p, idx) => (
              <div key={idx} className="final-score-row">
                <span>{p.nickname}</span>
                <span>{p.score} pts</span>
              </div>
            ))}
          </div>
          {localGameEndedData.stats && (
            <div className="game-stats">
              <p>Palabras encontradas: {localGameEndedData.stats.wordsFound} / {localGameEndedData.stats.totalWords}</p>
              {localGameEndedData.stats.longestWord && (
                <p>Palabra más larga: {localGameEndedData.stats.longestWord}</p>
              )}
            </div>
          )}
          <button className="abandonar-btn" onClick={onBack}>
            Regresar al Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container-v2">
      {/* Header con botón de regresar */}
      <div className="game-header-v2">
        <span className="game-code-header">🎮 Código: {gameId}</span>
        <button className="abandonar-btn" onClick={onBack}>
          ← Regresar al Lobby
        </button>
      </div>
      
      <div className="game-layout-v2">
        {/* Sidebar */}
        <div className="game-sidebar-v2">
          <div className="scoreboard-v2">
            <h3>🏆 Marcador</h3>
            {players.map((player, idx) => (
              <div key={idx} className={`player-score-v2 ${idx === playerIndex ? 'active' : ''}`}>
                <span>{player.nickname} {idx === playerIndex && '👤'}</span>
                <span>{player.score} pts</span>
              </div>
            ))}
          </div>

          <div className="timer-display-v2">
            ⏱️ {formatTime(timer)}
          </div>

        <div className="word-marquee-v2">
          <h3>📝 Palabras ({words.filter(w => w.foundBy).length}/{words.length})</h3>
          <div className="marquee-content-v2">
            {words.map((word, idx) => {
              const wordClass = getWordClass(word.word);
              return (
                <span key={idx} className={`word-tag-v2 ${wordClass}`}>
                  {word.word}
                </span>
              );
            })}
          </div>
        </div>

        <div className="chat-container-v2">
          <div className="chat-messages-v2">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message-v2 ${msg.type}`}>
                {msg.nickname && <strong>{msg.nickname}: </strong>}
                {msg.message}
              </div>
            ))}
          </div>
          <div className="chat-input-v2">
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
      <div className="board-container-v2">
        <div
          className="board-v2"
          style={{
            gridTemplateColumns: `repeat(${gameData?.settings?.gridSize || 15}, 1fr)`
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected = selectedCells.some(
                c => c.row === rowIndex && c.col === colIndex
              );
              const isFound = words.some(
                w => w.foundBy && w.coordinates?.some(
                  coord => coord[0] === rowIndex && coord[1] === colIndex
                )
              );

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`cell-v2 ${isSelected ? 'selected' : ''} ${isFound ? 'found' : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell}
                </div>
              );
            })
          )}
        </div>
      </div>

      </div>

      {/* Botón confirmar */}
      <div className="confirm-button-v2">
        <button
          className="btn btn-primary"
          onClick={confirmSelection}
          disabled={currentWord.length < 2 || frozen}
        >
          ✅ Confirmar
        </button>
      </div>

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
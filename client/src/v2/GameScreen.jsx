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
  const [gameReady, setGameReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGameReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const socketRef = useRef(null);
  const currentPlayerIdRef = useRef(null);
  const marqueeRef = useRef(null);

  useEffect(() => {
    if (userData?.theme) {
      document.documentElement.setAttribute('data-theme', userData.theme);
    } else {
      document.documentElement.setAttribute('data-theme', 'default');
    }
    return () => {
      document.documentElement.setAttribute('data-theme', 'default');
    };
  }, [userData?.theme]);

  useEffect(() => {
    const playerIdFromGameData = gameData?.players?.[playerIndex]?.id;
    if (playerIdFromGameData) {
      currentPlayerIdRef.current = playerIdFromGameData;
    }
  }, [gameData, playerIndex]);

  useEffect(() => {
    if (players[playerIndex]) {
      currentPlayerIdRef.current = players[playerIndex].id;
    }
  }, [players, playerIndex]);

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
      newSocket.emit('joinGame', { gameId, userData: { nickname: userData.nickname } }, () => {});
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
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

  useEffect(() => {
    if (!gameId) return;

    const interval = setInterval(async () => {
      try {
        const msgRes = await fetch(`http://localhost:3001/api/chat/${gameId}`);
        const msgData = await msgRes.json();
        if (msgData.messages) setChatMessages(msgData.messages);

        const wordRes = await fetch(`http://localhost:3001/api/selectWord/${gameId}`);
        const wordData = await wordRes.json();

        if (wordData && wordData.result && wordData.result.found) {
          setWords(prev => prev.map(w =>
            w.word === wordData.result.word ? { ...w, foundBy: wordData.result.playerId } : w
          ));
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

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

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
      if (data.playerId === currentPlayerIdRef.current) {
        setFrozen(true);
        setFrozenTime(data.duration);
      }
    });

    socket.on('gameEnded', (data) => {
      setLocalGameEndedData(data);
    });

    return () => {
      socket.off('wordFound');
      socket.off('playerFrozen');
      socket.off('gameEnded');
    };
  }, [gameId]);

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
      const validDirections = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      if (validDirections.some(([dr, dc]) => dr === rowDiff && dc === colDiff)) {
        setSelectedCells([...selectedCells, cell]);
        setCurrentWord(currentWord + cell.letter);
      }
    }
  };

  const confirmSelection = async () => {
    if (currentWord.length < 2) {
      setSelectedCells([]);
      setCurrentWord('');
      return;
    }

    const wordFound = words.find(w => w.word === currentWord && !w.foundBy);

    if (socketRef.current) {
      const playerId = gameData?.players?.[playerIndex]?.id;
      if (!playerId) return;

      socketRef.current.emit('selectWord', {
        gameId,
        playerId,
        coordinates: selectedCells.map(c => [c.row, c.col]),
        word: currentWord
      });

      if (wordFound) {
        const currentPlayerId = currentPlayerIdRef.current;
        const points = currentWord.length >= 8 ? 3 : currentWord.length >= 5 ? 2 : 1;
        setWords(prev => prev.map(w => w.word === currentWord ? { ...w, foundBy: currentPlayerId } : w));
        setPlayers(prev => prev.map(p => p.id === currentPlayerId ? { ...p, score: p.score + points, foundWords: [...p.foundWords, currentWord] } : p));
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

  const getWordClass = (word) => {
    const wordObj = words.find(w => w.word === word);
    if (!wordObj?.foundBy) return '';
    if (wordObj.foundBy === currentPlayerIdRef.current) return 'found-by-me';
    return 'found-by-other';
  };

  const handleScrollMarquee = (e) => {
    if (marqueeRef.current) {
      marqueeRef.current.scrollLeft += e.deltaY;
      e.preventDefault();
    }
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
              {localGameEndedData.stats.longestWord && <p>Palabra más larga: {localGameEndedData.stats.longestWord}</p>}
            </div>
          )}
          <button className="abandonar-btn" onClick={onBack}>Regresar al Lobby</button>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-game-screen">
      <div className="game-header-v2">
        <h1>🎮 Sopa de Letras</h1>
        <div className="game-header-right">
          <span className="game-code-header">Código: {gameId}</span>
          <div className="game-user-info">
            <span className="game-avatar">{userData.avatar}</span>
            <span className="game-nickname">{userData.nickname}</span>
          </div>
          <button className="game-btn-back" onClick={onBack}>← Regresar al Lobby</button>
        </div>
      </div>

      <div className="game-screen-content">
        <div className="game-container-v2">
          <div className="game-layout-v2">
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

              <div className="timer-display-v2">⏱️ {formatTime(timer)}</div>

              <div className="word-marquee-v2">
                <h3>📝 Palabras ({words.filter(w => w.foundBy).length}/{words.length})</h3>
                <div className="marquee-content-v2" ref={marqueeRef} onWheel={handleScrollMarquee}>
                  {words.map((word, idx) => (
                    <span key={idx} className={`word-tag-v2 ${getWordClass(word.word)}`}>{word.word}</span>
                  ))}
                </div>
              </div>

              <div className="chat-container-v2">
                <h3>💬 Chat del Juego</h3>
                <div className="chat-messages-v2">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`chat-message-v2 ${msg.nickname === 'Sistema' ? 'system' : 'user'}`}>
                      <span className="msg-time">{msg.time}</span>
                      {msg.nickname !== 'Sistema' && <span className="msg-nickname">{msg.nickname}: </span>}
                      <span className="msg-text">{msg.message}</span>
                    </div>
                  ))}
                </div>
                <div className="chat-input-v2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Escribe un mensaje..." />
                  <button onClick={handleSendMessage}>Enviar</button>
                </div>
              </div>
            </div>

            <div className="board-container-v2">
              <div className={`board-v2 ${gameReady ? 'ready' : ''}`} style={{ gridTemplateColumns: `repeat(${gameData?.settings?.gridSize || 15}, 1fr)` }}>
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSelected = selectedCells.some(c => c.row === rowIndex && c.col === colIndex);
                    const isFound = words.some(w => w.foundBy && w.coordinates?.some(coord => coord[0] === rowIndex && coord[1] === colIndex));
                    const foundByMe = words.some(w => w.foundBy === currentPlayerIdRef.current && w.coordinates?.some(coord => coord[0] === rowIndex && coord[1] === colIndex));
                    let cellClass = 'cell-v2';
                    if (isSelected) cellClass += ' selected';
                    else if (foundByMe) cellClass += ' found-by-me';
                    else if (isFound) cellClass += ' found-by-other';
                    return <div key={`${rowIndex}-${colIndex}`} className={cellClass} onClick={() => handleCellClick(rowIndex, colIndex)}>{cell}</div>;
                  })
                )}
              </div>
            </div>
          </div>

          <div className="confirm-button-v2">
            <button className="btn btn-primary" onClick={confirmSelection} disabled={currentWord.length < 2 || frozen}>✅ Confirmar</button>
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
      </div>
    </div>
  );
}
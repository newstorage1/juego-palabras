import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

export function useSocket(gameId) {
  const [players, setPlayers] = useState([]);
  const [words, setWords] = useState([]);
  const [timer, setTimer] = useState(0);
  const [gameState, setGameState] = useState('waiting');
  const [chatMessages, setChatMessages] = useState([]);
  const [frozenPlayers, setFrozenPlayers] = useState({});

  // Escuchar eventos del servidor
  useEffect(() => {
    if (!gameId) return;

    const handlePlayerJoined = (data) => {
      setPlayers(data.players);
    };

    const handleGameStarted = (data) => {
      setGameState('playing');
      setPlayers(data.players);
    };

    const handleWordFound = (data) => {
      setWords(prev => prev.map(w => 
        w.word === data.word ? { ...w, foundBy: data.playerId } : w
      ));
      setPlayers(prev => prev.map(p => 
        p.id === data.playerId 
          ? { ...p, score: p.score + data.points, foundWords: [...p.foundWords, data.word] }
          : p
      ));
    };

    const handlePlayerFrozen = (data) => {
      setFrozenPlayers(prev => ({
        ...prev,
        [data.playerId]: {
          frozen: true,
          duration: data.duration,
          until: Date.now() + data.duration * 1000
        }
      }));
    };

    const handleTimerUpdate = (data) => {
      setTimer(data.timeLeft);
    };

    const handleGameEnded = (data) => {
      setGameState('finished');
    };

    const handleChatMessage = (data) => {
      setChatMessages(prev => [...prev, data]);
    };

    socket.on('playerJoined', handlePlayerJoined);
    socket.on('gameStarted', handleGameStarted);
    socket.on('wordFound', handleWordFound);
    socket.on('playerFrozen', handlePlayerFrozen);
    socket.on('timerUpdate', handleTimerUpdate);
    socket.on('gameEnded', handleGameEnded);
    socket.on('chatMessage', handleChatMessage);

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('gameStarted', handleGameStarted);
      socket.off('wordFound', handleWordFound);
      socket.off('playerFrozen', handlePlayerFrozen);
      socket.off('timerUpdate', handleTimerUpdate);
      socket.off('gameEnded', handleGameEnded);
      socket.off('chatMessage', handleChatMessage);
    };
  }, [gameId]);

  // Actualizar estado de congelamiento
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFrozenPlayers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].until && now >= updated[key].until) {
            delete updated[key];
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Unirse a partida
  const joinGame = useCallback((gameId, userData) => {
    socket.emit('joinGame', { gameId, userData });
  }, []);

  // Iniciar partida
  const startGame = useCallback((gameId) => {
    socket.emit('startGame', gameId);
  }, []);

  // Seleccionar palabra
  const selectWord = useCallback((gameId, playerIndex, coordinates, word) => {
    socket.emit('selectWord', { gameId, playerIndex, coordinates, word });
  }, []);

  // Generar palabras con IA
  const generateWordsWithAI = useCallback((topic, language, count, callback) => {
    socket.emit('generateWordsWithAI', { topic, language, count }, callback);
  }, []);

  // Enviar mensaje de chat
  const sendMessage = useCallback((gameId, message, playerId, nickname) => {
    socket.emit('chatMessage', { gameId, message, playerId, nickname });
  }, []);

  // Actualizar configuración del usuario
  const updateUserSettings = useCallback((gameId, playerIndex, settings) => {
    socket.emit('updateUserSettings', { gameId, playerIndex, settings });
  }, []);

  return {
    players,
    words,
    timer,
    gameState,
    chatMessages,
    frozenPlayers,
    joinGame,
    startGame,
    selectWord,
    generateWordsWithAI,
    sendMessage,
    updateUserSettings
  };
}

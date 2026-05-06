const { saveGame, loadGame, deleteGame } = require('./persistence');
const { generateWordSearch } = require('./gameLogic');
const { validateContent, validateGameCode } = require('./validation');

// Generar código único
function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = 'SOPA-' + Array.from({ length: 3 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  } while (games[code]);
  return code;
}

// Almacenamiento en memoria
let games = {};
let users = {};

// Inicializar desde archivos guardados
function initializeFromSavedGames() {
  const fs = require('fs');
  const path = require('path');
  const GAMES_DIR = path.join(__dirname, '../saves');
  
  if (!fs.existsSync(GAMES_DIR)) {
    return;
  }
  
  const files = fs.readdirSync(GAMES_DIR);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const gameId = file.replace('.json', '');
      const gameData = loadGame(gameId);
      if (gameData) {
        games[gameId] = gameData;
        console.log(`Partida ${gameId} cargada desde archivo`);
      }
    }
  }
}

// Eventos de Socket.io
function handleSocketEvents(io) {
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    
    // Crear partida
    socket.on('createGame', (userData, callback) => {
      const gameId = generateGameCode();
      const { gridSize = 15, theme = 'default', language = 'es' } = userData;
      
      // Generar palabras por defecto
      const defaultWords = language === 'es' 
        ? ['NODEJS', 'REACT', 'EXPRESS', 'SOCKET', 'CODIGO', 'JUEGO', 'RED', 'SERVIDOR', 'FRONTEND', 'BACKEND']
        : ['NODEJS', 'REACT', 'EXPRESS', 'SOCKET', 'CODE', 'GAME', 'NETWORK', 'SERVER', 'FRONTEND', 'BACKEND'];
      
      const { grid, placedWords } = generateWordSearch(defaultWords, gridSize);
      
      const gameData = {
        gameId,
        players: [{
          id: socket.id,
          nickname: userData.nickname || 'Jugador 1',
          avatar: userData.avatar || 'default',
          score: 0,
          consecutiveFailures: 0,
          frozenUntil: null,
          foundWords: [],
          settings: userData.settings || {}
        }],
        grid,
        words: placedWords.map(w => ({ ...w, foundBy: null })),
        settings: {
          gridSize,
          theme,
          language,
          timeLimitMinutes: 15,
          mode: 'solo'
        },
        timestamp: new Date().toISOString(),
        gameState: 'waiting',
        startTime: null,
        timer: null
      };
      
      games[gameId] = gameData;
      users[socket.id] = { gameId, playerIndex: 0 };
      
      // Guardar partida
      saveGame(gameId, gameData);
      
      socket.join(gameId);
      
      callback({ success: true, gameId, gameData });
    });
    
    // Unirse a partida
    socket.on('joinGame', (data, callback) => {
      const { gameId, userData } = data;
      
      if (!games[gameId]) {
        // Intentar cargar partida guardada
        const savedGame = loadGame(gameId);
        if (savedGame) {
          games[gameId] = savedGame;
          console.log(`Partida ${gameId} recuperada`);
        } else {
          return callback({ success: false, error: 'Partida no encontrada' });
        }
      }
      
      const game = games[gameId];
      
      if (game.players.length >= 2) {
        return callback({ success: false, error: 'Partida llena' });
      }
      
      if (game.gameState === 'playing') {
        return callback({ success: false, error: 'Partida ya iniciada' });
      }
      
      const playerIndex = game.players.length;
      game.players.push({
        id: socket.id,
        nickname: userData.nickname || 'Jugador 2',
        avatar: userData.avatar || 'default',
        score: 0,
        consecutiveFailures: 0,
        frozenUntil: null,
        foundWords: [],
        settings: userData.settings || {}
      });
      
      users[socket.id] = { gameId, playerIndex };
      
      socket.join(gameId);
      
      // Notificar a todos los jugadores
      io.to(gameId).emit('playerJoined', {
        player: game.players[playerIndex],
        players: game.players
      });
      
      // Guardar partida
      saveGame(gameId, game);
      
      callback({ success: true, gameData: game });
    });
    
    // Iniciar partida
    socket.on('startGame', (gameId) => {
      if (!games[gameId]) return;
      
      const game = games[gameId];
      game.gameState = 'playing';
      game.startTime = Date.now();
      
      // Iniciar temporizador
      startTimer(gameId);
      
      io.to(gameId).emit('gameStarted', {
        players: game.players,
        settings: game.settings
      });
      
      saveGame(gameId, game);
    });
    
    // Seleccionar palabra
    socket.on('selectWord', (data) => {
      const { gameId, playerIndex, coordinates, word } = data;
      const game = games[gameId];
      
      if (!game || game.gameState !== 'playing') return;
      
      const player = game.players[playerIndex];
      
      // Verificar si está congelado
      if (player.frozenUntil && Date.now() < player.frozenUntil) {
        return;
      }
      
      // Buscar la palabra en la lista
      const wordIndex = game.words.findIndex(w => w.word === word && !w.foundBy);
      
      if (wordIndex === -1) {
        // Palabra no encontrada o ya fue encontrada
        player.consecutiveFailures++;
        
        if (player.consecutiveFailures >= 3) {
          player.frozenUntil = Date.now() + 5000; // 5 segundos
          player.consecutiveFailures = 0;
          
          io.to(gameId).emit('playerFrozen', {
            playerId: player.id,
            nickname: player.nickname,
            duration: 5
          });
        }
        
        io.to(gameId).emit('selectionInvalid', { word, playerId: player.id });
        saveGame(gameId, game);
        return;
      }
      
      // Palabra válida
      game.words[wordIndex].foundBy = player.id;
      player.foundWords.push(word);
      
      // Calcular puntos
      let points = 1;
      if (word.length >= 5 && word.length <= 7) points = 2;
      if (word.length >= 8) points = 3;
      
      player.score += points;
      player.consecutiveFailures = 0;
      
      io.to(gameId).emit('wordFound', {
        word,
        playerId: player.id,
        nickname: player.nickname,
        points,
        coordinates: game.words[wordIndex].coordinates,
        players: game.players,
        wordsLeft: game.words.filter(w => !w.foundBy)
      });
      
      // Verificar condición de victoria
      const totalWords = game.words.length;
      const foundWords = game.words.filter(w => w.foundBy).length;
      
      if (foundWords >= Math.ceil(totalWords * 0.51)) {
        endGame(gameId, io);
      }
      
      saveGame(gameId, game);
    });
    
    // Generar palabras con IA
    socket.on('generateWordsWithAI', (data, callback) => {
      const { topic, language, count = 20 } = data;
      
      // Simulación de generación con IA
      // En producción, esto haría una llamada a una API de IA
      
      const wordLists = {
        es: {
          animales: ['LEOPARDO', 'JIRAFA', 'HIPOPÓTAMO', 'COCODRILO', 'PINGÜINO', 'CAMELLO', 'GUEPARDO', 'ORNITORRINCO', 'BALLENA', 'TIBURÓN', 'ÁGUILA', 'SERPIENTE', 'TORTUGA', 'RINOCERONTE', 'HIPOPÓTAMO', 'CANGURO', 'KOALA', 'PANDA', 'ZORRO', 'LOBO'],
          tecnologia: ['INTELIGENCIA', 'ALGORITMO', 'PROGRAMACIÓN', 'DATOS', 'CIBERSEGURIDAD', 'NUVEM', 'BLOCKCHAIN', 'ROBÓTICA', 'VIRTUAL', 'REALIDAD', 'AUTOMATIZACIÓN', 'SISTEMA', 'RED', 'SERVIDOR', 'BASE', 'DATOS', 'INTERNET', 'WIFI', 'CÓDIGO', 'PROGRAMA'],
          deportes: ['FÚTBOL', 'BÁSQUETBOL', 'TENIS', 'NATACIÓN', 'ATLETISMO', 'GIMNASIA', 'BOXEO', 'JUDO', 'TAEKWONDO', 'CICLISMO', 'SURF', 'ESQUÍ', 'HOCKEY', 'BÉISBOL', 'RUGBY']
        },
        en: {
          animals: ['LEOPARD', 'GIRAFFE', 'HIPPOPOTAMUS', 'CROCODILE', 'PENGUIN', 'CAMEL', 'CHEETAH', 'PLATYPUS', 'WHALE', 'SHARK', 'EAGLE', 'SNAKE', 'TURTLE', 'RHINOCEROS', 'KANGAROO', 'KOALA', 'PANDA', 'FOX', 'WOLF', 'BEAR'],
          technology: ['INTELLIGENCE', 'ALGORITHM', 'PROGRAMMING', 'DATA', 'CYBERSECURITY', 'CLOUD', 'BLOCKCHAIN', 'ROBOTICS', 'VIRTUAL', 'REALITY', 'AUTOMATION', 'SYSTEM', 'NETWORK', 'SERVER', 'DATABASE', 'INTERNET', 'WIFI', 'CODE', 'PROGRAM', 'SOFTWARE'],
          sports: ['SOCCER', 'BASKETBALL', 'TENNIS', 'SWIMMING', 'ATHLETICS', 'GYMNASTICS', 'BOXING', 'JUDO', 'TAEKWONDO', 'CYCLING', 'SURF', 'SKI', 'HOCKEY', 'BASEBALL', 'RUGBY']
        }
      };
      
      const words = wordLists[language]?.[topic] || wordLists[language]?.tecnologia || wordLists.en.technology;
      const selectedWords = words.sort(() => 0.5 - Math.random()).slice(0, count);
      
      callback({ success: true, words: selectedWords });
    });
    
    // Actualizar configuración del usuario
    socket.on('updateUserSettings', (data) => {
      const { gameId, playerIndex, settings } = data;
      if (games[gameId] && games[gameId].players[playerIndex]) {
        games[gameId].players[playerIndex].settings = { 
          ...games[gameId].players[playerIndex].settings,
          ...settings
        };
        saveGame(gameId, games[gameId]);
      }
    });
    
    // Chat
    socket.on('chatMessage', (data, callback) => {
      const { gameId, message, playerId, nickname } = data;
      console.log("📩 chatMessage recibido:", data);
      
      if (!gameId || !message) {
        console.error("❌ Datos incompletos");
        if (callback) callback({ error: 'Datos incompletos' });
        return;
      }
      
      if (!games[gameId]) {
        console.error("❌ Partida no encontrada:", gameId);
        if (callback) callback({ error: 'Partida no encontrada' });
        return;
      }
      
      const msg = {
        type: playerId === games[gameId].players[0]?.id ? 'me' : 'other',
        message,
        playerId,
        nickname,
        timestamp: new Date().toISOString()
      };
      
      io.to(gameId).emit('chatMessage', msg);
      console.log("📤 Emitido a sala:", gameId);
      
      if (callback) callback({ success: true });
    });
    
    // Desconexión
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
      
      const userInfo = users[socket.id];
      if (userInfo) {
        const { gameId, playerIndex } = userInfo;
        
        if (games[gameId]) {
          games[gameId].players = games[gameId].players.filter((_, i) => i !== playerIndex);
          
          if (games[gameId].players.length === 0) {
            delete games[gameId];
            deleteGame(gameId);
          } else {
            saveGame(gameId, games[gameId]);
          }
        }
        
        delete users[socket.id];
      }
    });
  });
}

// Temporizador
function startTimer(gameId) {
  const game = games[gameId];
  if (!game) return;
  
  let timeLeft = game.settings.timeLimitMinutes * 60;
  
  game.timer = setInterval(() => {
    timeLeft--;
    
    io.to(gameId).emit('timerUpdate', { timeLeft });
    
    if (timeLeft <= 0) {
      clearInterval(game.timer);
      endGame(gameId, io);
    }
  }, 1000);
}

function endGame(gameId, io) {
  const game = games[gameId];
  if (!game) return;
  
  clearInterval(game.timer);
  game.gameState = 'finished';
  
  // Determinar ganador
  let winner = null;
  if (game.players.length === 1) {
    winner = game.players[0];
  } else {
    winner = game.players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );
  }
  
  // Calcular estadísticas
  const stats = {
    winner: winner ? winner.nickname : null,
    winnerScore: winner ? winner.score : 0,
    longestWord: game.words.reduce((longest, word) => {
      if (word.foundBy && word.word.length > (longest?.length || 0)) {
        return word.word;
      }
      return longest;
    }, null),
    averageReactionTime: 0,
    totalWords: game.words.length,
    wordsFound: game.words.filter(w => w.foundBy).length
  };
  
  io.to(gameId).emit('gameEnded', {
    winner,
    stats,
    finalScores: game.players.map(p => ({ nickname: p.nickname, score: p.score }))
  });
  
  saveGame(gameId, game);
}

module.exports = {
  handleSocketEvents,
  initializeFromSavedGames,
  games,
  users,
  endGame
};

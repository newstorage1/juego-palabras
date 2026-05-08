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

// Chat del Lobby Multijugador (sala de espera global)
let lobbyChatMessages = []; // Mensajes persistentes del lobby

// Eventos de Socket.io
function handleSocketEvents(io) {
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    
    // Unirse al room del lobby multiplayer
    socket.on('joinLobby', () => {
      socket.join('lobby');
      // Enviar mensajes anteriores del lobby
      socket.emit('lobbyChatHistory', lobbyChatMessages);
      console.log('Usuario joined to lobby');
    });
    
    // Enviar mensaje al chat del lobby
    socket.on('lobbyChatMessage', (data) => {
      const message = {
        nickname: data.nickname,
        avatar: data.avatar,
        message: data.message,
        time: new Date().toLocaleTimeString()
      };
      lobbyChatMessages.push(message);
      // Limitar a últimos 50 mensajes
      if (lobbyChatMessages.length > 50) {
        lobbyChatMessages = lobbyChatMessages.slice(-50);
      }
      //广播 a todos en el lobby
      io.to('lobby').emit('lobbyChatMessage', message);
    });
    
    // Unirse a sala como creador (para api REST)
    socket.on('joinGameRoom', (data) => {
      const { gameId, nickname } = data;
      socket.join(gameId);
      // Notificar al otro jugador
      socket.to(gameId).emit('playerJoinedGame', {
        nickname,
        playerCount: 2
      });
    });
    
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
      
      const playersData = gameData.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        foundWords: p.foundWords || []
      }));
      
      const wordsData = gameData.words.map(w => ({
        word: w.word,
        coordinates: w.coordinates,
        foundBy: w.foundBy
      }));
      
      const gameDataClean = {
        gameId: gameData.gameId,
        players: playersData,
        words: wordsData,
        settings: gameData.settings,
        grid: gameData.grid,
        gameState: gameData.gameState,
        startTime: gameData.startTime
      };
      
      callback({ success: true, gameId, gameData: gameDataClean });
    });
    
    // Unirse a partida
    socket.on('joinGame', (data, callback) => {
      const { gameId, userData } = data;
      
      console.log(`📥 joinGame - gameId: ${gameId}, socket.id: ${socket.id}, nickname: ${userData?.nickname}`);
      
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
      
      console.log(`   Estado juego: ${game.gameState}, Jugadores actuales: ${game.players.length}`);
      
      if (game.players.length >= 4) {
        return callback({ success: false, error: 'Partida llena' });
      }
      
      if (game.gameState === 'playing') {
        const existingPlayer = game.players.find(p => p.nickname === userData?.nickname);
        console.log(`   Buscando por nickname: ${userData?.nickname}, encontrado:`, existingPlayer);
        if (existingPlayer) {
          users[socket.id] = { gameId, playerIndex: game.players.indexOf(existingPlayer) };
          socket.join(gameId);
          console.log(`   ✅ Reconectado - playerIndex: ${game.players.indexOf(existingPlayer)}`);
          
          const playersData = game.players.map(p => ({
            id: p.id,
            nickname: p.nickname,
            avatar: p.avatar,
            score: p.score,
            foundWords: p.foundWords || []
          }));
          
          const wordsData = game.words.map(w => ({
            word: w.word,
            coordinates: w.coordinates,
            foundBy: w.foundBy
          }));
          
          const gameDataClean = {
            gameId: game.gameId,
            players: playersData,
            words: wordsData,
            settings: game.settings,
            grid: game.grid,
            gameState: game.gameState,
            startTime: game.startTime
          };
          
          return callback({ success: true, gameId, gameData: gameDataClean, reconnect: true });
        }
        return callback({ success: false, error: 'Partida ya iniciada' });
      }
      
      // Verificar si el nickname ya existe (reconectar aunque el juego no haya started)
      const existingPlayer = game.players.find(p => p.nickname === userData?.nickname);
      if (existingPlayer) {
        console.log(`   🔄 Reconectando jugador existente: ${userData.nickname}, id: ${existingPlayer.id}`);
        users[socket.id] = { gameId, playerIndex: game.players.indexOf(existingPlayer) };
        socket.join(gameId);
        
        const playersData = game.players.map(p => ({
          id: p.id,
          nickname: p.nickname,
          avatar: p.avatar,
          score: p.score,
          foundWords: p.foundWords || []
        }));
        
        const wordsData = game.words.map(w => ({
          word: w.word,
          coordinates: w.coordinates,
          foundBy: w.foundBy
        }));
        
        const gameDataClean = {
          gameId: game.gameId,
          players: playersData,
          words: wordsData,
          settings: game.settings,
          grid: game.grid,
          gameState: game.gameState,
          startTime: game.startTime
        };
        
        return callback({ success: true, gameId, gameData: gameDataClean, reconnect: true });
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
      
      const playersData = game.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        foundWords: p.foundWords || []
      }));
      
      io.to(gameId).emit('playerJoined', {
        player: playersData[playerIndex],
        players: playersData
      });
      
      // Guardar partida
      saveGame(gameId, game);
      
      const wordsData = game.words.map(w => ({
        word: w.word,
        coordinates: w.coordinates,
        foundBy: w.foundBy
      }));
      
      const gameDataClean = {
        gameId: game.gameId,
        players: playersData,
        words: wordsData,
        settings: game.settings,
        grid: game.grid,
        gameState: game.gameState,
        startTime: game.startTime
      };
      
      callback({ success: true, gameData: gameDataClean });
    });
    
// Iniciar partida
    socket.on('startGame', (gameId) => {
      console.log('📩 startGame recibido:', gameId, 'por socket:', socket.id);
      if (!games[gameId]) {
        console.log('❌ Partida no encontrada:', gameId);
        console.log('Partidas existentes:', Object.keys(games));
        return;
      }
      
      const game = games[gameId];
      console.log('📋 Estado actual:', game.gameState, 'Jugadores:', game.players.length);
      console.log('📋 Jugadores en la partida:');
      game.players.forEach((p, i) => {
        console.log(`   [${i}] id: ${p.id}, nickname: ${p.nickname}`);
      });
      
      game.gameState = 'playing';
      game.startTime = Date.now();
      
      // Iniciar temporizador
      startTimer(gameId, io);
      
      const playersData = game.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        foundWords: p.foundWords || []
      }));
      
      const wordsData = game.words.map(w => ({
        word: w.word,
        coordinates: w.coordinates,
        foundBy: w.foundBy
      }));
      
      io.to(gameId).emit('gameStarted', {
        players: playersData,
        settings: game.settings,
        grid: game.grid,
        words: wordsData,
        gameState: game.gameState
      });
      
      saveGame(gameId, game);
    });
    
    // Seleccionar palabra
    socket.on('selectWord', (data) => {
      const { gameId, playerId, coordinates, word } = data;
      const game = games[gameId];
      
      console.log('📥 selectWord recibido - playerId:', playerId, 'word:', word);
      
      if (!game || game.gameState !== 'playing') return;
      
      const player = game.players.find(p => p.id === playerId);
      
      if (!player) {
        console.log('❌ Jugador no encontrado con playerId:', playerId);
        console.log('📋 Jugadores disponibles:', game.players.map(p => ({ id: p.id, nickname: p.nickname })));
        return;
      }
      
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
      
      const playersData = game.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        foundWords: p.foundWords || [],
        frozenUntil: p.frozenUntil
      }));
      
      const wordsLeftData = game.words.filter(w => !w.foundBy).map(w => ({
        word: w.word,
        coordinates: w.coordinates
      }));
      
      io.to(gameId).emit('wordFound', {
        word,
        playerId: player.id,
        nickname: player.nickname,
        points,
        coordinates: game.words[wordIndex].coordinates,
        players: playersData,
        wordsLeft: wordsLeftData
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
    
    // Desconexión - NO eliminar jugador para permitir reconexión
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
      
      // No eliminamos al jugador para permitir reconexión
      // El jugador puede reconectarse usando su nickname
      delete users[socket.id];
    });
  });
}

// Temporizador
function startTimer(gameId, io) {
  const game = games[gameId];
  if (!game) return;
  
  let timeLeft = game.settings.timeLimitMinutes * 60;
  
  game.timer = setInterval(() => {
    timeLeft--;
    
    if (io) {
      io.to(gameId).emit('timerUpdate', { timeLeft });
    }
    
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

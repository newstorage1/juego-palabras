const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { handleSocketEvents, initializeFromSavedGames, games } = require('./socketHandlers');
const { endGame } = require('./socketHandlers');
const { saveGame } = require('./persistence');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del cliente (modo desarrollo)
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.static(path.join(__dirname, '../client/src')));
app.use(express.static(path.join(__dirname, '../public')));

// Archivos estáticos para versión 2 (sirve los .jsx y .css directamente)
app.use('/v2', express.static(path.join(__dirname, '../client/src/v2')));
app.use('/v2', express.static(path.join(__dirname, '../client/public')));

// Rutas estáticas para el cliente
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// Ruta versión 2 (redirige al cliente React)
app.get('/version2', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.get('/v2', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.get('/v2/prelobby', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/prelobby.html'));
});

app.get('/v2/lobby', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/lobby.html'));
});

app.get('/v2/status', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/v2-status.html'));
});

// Configuración
const PORT = process.env.PORT || 3001;

// Almacenamiento de mensajes en memoria
const chatMessagesStore = {};

// Rutas HTTP para chat (polling)
app.post('/api/chat', (req, res) => {
  const { gameId, message, playerId, nickname } = req.body;
  console.log("📥 HTTP POST chat:", req.body);
  
  if (!gameId || !message) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  
  const msg = { message, playerId, nickname, timestamp: new Date().toISOString() };
  
  if (!chatMessagesStore[gameId]) chatMessagesStore[gameId] = [];
  chatMessagesStore[gameId].push(msg);
  
  // Emitir via socket también
  io.to(gameId).emit('chatMessage', msg);
  
  res.json({ success: true });
});

app.get('/api/chat/:gameId', (req, res) => {
  const { gameId } = req.params;
  res.json({ messages: chatMessagesStore[gameId] || [] });
});

// Rutas HTTP para verificar nicknames disponibles
const { getUsedNicknames, generateNicknameSuggestion } = require('./socketHandlers');

app.get('/api/checkNickname/:nickname', (req, res) => {
  const { nickname } = req.params;
  console.log(`\n🔍 PETICIÓN: Verificar disponibilidad de "${nickname}"`);
  
  const usedNicknames = getUsedNicknames();
  const isAvailable = !usedNicknames.includes(nickname.toLowerCase());
  
  if (isAvailable) {
    console.log(`✅ "${nickname}" DISPONIBLE\n`);
    res.json({ available: true });
  } else {
    const suggestion = generateNicknameSuggestion(nickname);
    console.log(`❌ "${nickname}" EN USO - Sugerencia: "${suggestion}"\n`);
    res.json({ available: false, suggestion });
  }
});

// Rutas HTTP para seleccionar palabra
const wordSelectResults = {};

app.post('/api/selectWord', (req, res) => {
  try {
    const { gameId, playerIndex, coordinates, word } = req.body;
    console.log("📥 selectWord RECIBIDO:", req.body);
    console.log("📥 URL llamada:", req.originalUrl);
    
    if (!gameId || !word) {
      console.log("❌ Datos incompletos - gameId:", gameId, "word:", word);
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    
    // Importar validación desde gameLogic
    const { validateSelection, calculatePoints } = require('./gameLogic');
    
    if (!games[gameId]) {
      console.log("❌ Partida no encontrada:", gameId);
      console.log("📋 Partidas existentes:", Object.keys(games));
      return res.status(404).json({ error: 'Partida no encontrada' });
    }
    
    const game = games[gameId];
    
    // Verificar si el juego ya terminó
    if (game.gameState === 'finished') {
      return res.status(400).json({ error: 'El juego ya terminó' });
    }
    
    const validation = validateSelection(game.grid, coordinates, game.words);
  
  console.log("🔍 Validation:", { 
    wordSent: word, 
    wordFromGrid: coordinates.map(([row, col]) => game.grid[row][col]).join(''),
    valid: validation.valid, 
    foundWord: validation.word 
  });
  console.log("📋 Game words:", game.words.map(w => w.word));
  
  if (validation.valid) {
    // Marcar palabra como encontrada
    const wordIndex = game.words.findIndex(w => w.word === word);
    if (wordIndex >= 0) {
      game.words[wordIndex].foundBy = game.players[playerIndex]?.id;
    }
    
    const points = calculatePoints(word);
    game.players[playerIndex].score += points;
    game.players[playerIndex].foundWords.push(word);
    
    // Guardar
    saveGame(gameId, game);
    
    // Verificar condición de victoria
    const totalWords = game.words.length;
    const foundWords = game.words.filter(w => w.foundBy).length;
    const mode = game.settings?.mode || 'solo';
    const winThreshold = mode === 'solo' ? 1.0 : 0.51;
    
    if (foundWords >= Math.ceil(totalWords * winThreshold)) {
      console.log('🎉 Condición de victoria alcanzada:', foundWords, '/', totalWords, '(', Math.ceil(totalWords * winThreshold), ')');
      endGame(gameId, io);
    }
    
    // Guardar resultado en el juego (persistente)
    game.lastWordResult = {
      word,
      playerId: game.players[playerIndex]?.id,
      points,
      coordinates,
      found: true
    };
    wordSelectResults[gameId] = game.lastWordResult;
    
    // Notificar via socket también
    io.to(gameId).emit('wordFound', {
      word,
      playerId: game.players[playerIndex]?.id,
      points,
      coordinates
    });
    
    console.log("✅ Respuesta enviada:", { success: true, points, word });
    res.json({ 
      success: true, 
      points,
      word,
      playerId: game.players[playerIndex]?.id,
      coordinates
    });
  } else {
    // Guardar resultado en el juego (persistente)
    game.lastWordResult = {
      word,
      found: false,
      error: validation.message
    };
    wordSelectResults[gameId] = game.lastWordResult;
    
    res.json({ success: false, error: validation.message });
  }
  } catch (error) {
    console.error('❌ Error en selectWord:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/selectWord/:gameId', (req, res) => {
  const { gameId } = req.params;
  const result = wordSelectResults[gameId];
  // Limpiar después de enviar
  delete wordSelectResults[gameId];
  res.json({ result: result || null });
});

// Endpoint para obtener temas disponibles
app.get('/api/themes', (req, res) => {
  const { language = 'es' } = req.query;
  
  // Usar las funciones de socketHandlers para obtener los temas
  const { getAvailableThemes } = require('./socketHandlers');
  const themes = getAvailableThemes(language);
  
  res.json({ themes, language });
});

// Inicializar partidas guardadas
initializeFromSavedGames();

// Manejar eventos de Socket.io
handleSocketEvents(io);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
  console.log(`Accede a http://localhost:${PORT}`);
});

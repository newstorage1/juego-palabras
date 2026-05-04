const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { handleSocketEvents, initializeFromSavedGames } = require('./socketHandlers');

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
app.use(express.static('client/build'));

// Rutas estáticas para el cliente
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Configuración
const PORT = process.env.PORT || 3001;

// Inicializar partidas guardadas
initializeFromSavedGames();

// Manejar eventos de Socket.io
handleSocketEvents(io);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
  console.log(`Accede a http://localhost:${PORT}`);
});

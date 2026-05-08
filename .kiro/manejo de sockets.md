# Manejo de Sockets y Sesiones

## Visión General

El sistema de sockets gestiona las conexiones en tiempo real entre clientes y servidor, permitiendo:
- Creación de partidas multijugador
- Comunicación en tiempo real (chat, eventos de juego)
- Reconexión de jugadores que pierden conexión

---

## Arquitectura de Conexiones

### Flujo de Vida de una Sesión

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LIFECYCLE DE UNA PARTIDA                      │
└─────────────────────────────────────────────────────────────────────┘

1. LOBBY (Pre-game)
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │ Jugador 1   │     │  Servidor   │     │ Jugador 2  │
   │ (Socket A)  │────►│             │◄────│ (Socket B)  │
   └─────────────┘     └─────────────┘     └─────────────┘
         │                   │                    │
         │  createGame       │                    │
         │──────────────────►│                    │
         │◄──────────────────│                    │
         │                   │    joinGame        │
         │                   │◄───────────────────│
         │◄──────────────────│                    │
         │                   │                    │
         ▼                   ▼                    ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  game.players = [                                         │
   │    { id: 'socket_A', nickname: 'Jug1', ... },             │
   │    { id: 'socket_B', nickname: 'Jug2', ... }              │
   │  ]                                                         │
   │  gameState = 'waiting'                                     │
   └─────────────────────────────────────────────────────────────┘

2. INICIO DE PARTIDA
   ┌─────────────┐     ┌─────────────┐
   │ Jugador 1   │────►│  Servidor   │
   │ (Socket A)  │     │             │
   └─────────────┘     └─────────────┘
         │              startGame
         │──────────────────►
         │              gameState = 'playing'
         │              io.to(gameId).emit('gameStarted')
         │◄──────────────────
         ▼

3. GAME SCREEN (Nueva conexión)
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │ Jugador 1   │     │  Servidor   │     │ Jugador 2  │
   │ (Socket C)  │────►│             │◄────│ (Socket B) │
   └─────────────┘     └─────────────┘     └─────────────┘
         │                   │                    │
         │  joinGame          │                    │
         │  {gameId,          │                    │
         │   nickname:        │  Busca por         │
         │   'Jug1'}          │  nickname          │
         │──────────────────►│──► encuentra       │
         │                   │  player.id original│
         │◄──────────────────│  (socket_A)        │
         │                   ▼                    ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  users['socket_C'] = { gameId, playerIndex: 0 }             │
   │  socket.join(gameId)  // Nuevo socket se une a la sala     │
   └─────────────────────────────────────────────────────────────┘

4. DURANTE EL JUEGO
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │ Jugador 1   │     │  Servidor   │     │ Jugador 2  │
   │ (Socket C)  │────►│             │◄────│ (Socket B) │
   └─────────────┘     └─────────────┘     └─────────────┘
         │                   │                    │
         │  selectWord       │                    │
         │  {playerId:       │                    │
         │   'socket_A'}     │                    │
         │──────────────────►│                    │
         │                   │  io.to(gameId)     │
         │                   │  .emit('wordFound')│
         │◄──────────────────├───────────────────►
         │                   ▼                    ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  Ambos jugadores actualizan:                               │
   │  - word.foundBy = 'socket_A'                               │
   │  - players[id=socket_A].score += points                    │
   └─────────────────────────────────────────────────────────────┘
```

---

## Sistema de Identificación

### Dos Tipos de ID

| Tipo | Origen | Uso |
|------|--------|-----|
| `socket.id` | Asignado por Socket.io al conectar | Identifica la conexión actual |
| `player.id` | Asignado al crear/unirse a partida | Identifica al jugador en el juego |

### El Problema del Cambio de Socket

**Escenario problemático:**
1. Jugador entra al Lobby → nuevo socket con ID `ABC123`
2. Se une a partida → `player.id = 'ABC123'`
3. Navega a GameScreen → nuevo socket con ID `XYZ789`
4. Intenta unirse → servidor busca `XYZ789` → NO lo encuentra

**Solución implementada:**
- Buscar por `nickname` en lugar de confiar en el socket ID
- Mantener el `player.id` original aunque el socket cambie

---

## Reconexión por Nickname

### Algoritmo de JoinGame

```
joinGame(gameId, userData):
    
    // 1. Cargar partida si no está en memoria
    if not games[gameId]:
        loadGame(gameId)  // Desde archivo
        if not found: return error
    
    game = games[gameId]
    
    // 2. Verificar límite de jugadores
    if game.players.length >= 4:
        return error "Partida llena"
    
    // 3. Buscar jugador existente por nickname
    existingPlayer = game.players.find(p => p.nickname == userData.nickname)
    
    if existingPlayer:
        // RECONEXIÓN: Usar datos existentes
        users[socket.id] = { gameId, playerIndex: game.players.indexOf(existingPlayer) }
        socket.join(gameId)
        
        return callback({
            success: true,
            gameId,
            gameData: cleanGameData(game),
            reconnect: true
        })
    
    // 4. Si no existe, crear nuevo jugador
    if game.gameState == 'playing':
        return error "Partida ya iniciada"
    
    // CREAR NUEVO JUGADOR
    playerIndex = game.players.length
    newPlayer = {
        id: socket.id,
        nickname: userData.nickname,
        avatar: userData.avatar,
        score: 0,
        foundWords: [],
        ...
    }
    game.players.push(newPlayer)
    
    users[socket.id] = { gameId, playerIndex }
    socket.join(gameId)
    
    // Notificar a todos
    io.to(gameId).emit('playerJoined', { ... })
    
    return callback({ success: true, gameData: cleanGameData(game) })
```

### Clave del Sistema de Reconexión

1. **El nickname es la clave de identidad**
   - No importa qué socket tenga el cliente
   - Mientras use el mismo nickname, el servidor lo reconoce

2. **El player.id original se preserva**
   - Al encontrar por nickname, se usa el ID que se creó originalmente
   - Este ID se usa en todos los eventos: `wordFound`, `playerFrozen`, etc.

3. **No se elimina al jugador al desconectar**
   - `socket.on('disconnect')` ya NO elimina el jugador del array
   - Permite que se pueda reconectar después

---

## Gestión de Rooms (Salas)

### Estructura de Rooms

```
Internet
   │
   ├─► Socket.io Server
   │       │
   │       ├─► Room: "lobby" (chat global)
   │       │
   │       ├─► Room: "SOPA-ABC" (partida 1)
   │       │       ├─ Socket Jugador 1
   │       │       └─ Socket Jugador 2
   │       │
   │       └─► Room: "SOPA-DEF" (partida 2)
   │               ├─ Socket Jugador 3
   │               ├─ Socket Jugador 4
   │               └─ Socket Jugador 5
```

### Operaciones

| Operación | Código |
|-----------|--------|
| Unir a sala | `socket.join(gameId)` |
| Salir de sala | `socket.leave(gameId)` |
| Emitir a sala | `io.to(gameId).emit('event', data)` |
| Emitir a todos | `io.emit('event', data)` |

---

## Datos Enviados (Payloads Limpiados)

Para evitar referencias circulares, todos los datos enviados son objetos planos:

### gameData (enviado en joinGame, gameStarted)

```javascript
{
    gameId: "SOPA-ABC",
    players: [
        {
            id: "socket_id_original",
            nickname: "Jugador1",
            avatar: "👤",
            score: 10,
            foundWords: ["REACT", "NODE"]
        }
    ],
    words: [
        { word: "REACT", coordinates: [...], foundBy: "socket_id" },
        { word: "NODE", coordinates: [...], foundBy: null }
    ],
    settings: { gridSize: 15, language: "es" },
    grid: [["R","E","A","C","T"], ...],
    gameState: "playing",
    startTime: 1715623400000
}
```

### wordFound (broadcast a todos)

```javascript
{
    word: "REACT",
    playerId: "socket_id_original",
    nickname: "Jugador1",
    points: 2,
    coordinates: [[0,0],[0,1],[0,2],[0,3],[0,4]],
    players: [ /* array limpio de players */ ],
    wordsLeft: [ /* palabras sin encontrar */ ]
}
```

---

## Eventos del Servidor

| Evento | Direction | Payload | Descripción |
|--------|-----------|---------|-------------|
| `connect` | Server→Client | `{ socketId }` | Conexión establecida |
| `playerJoined` | Server→Client | `{ player, players }` | Nuevo jugador entra |
| `gameStarted` | Server→Client | `{ players, grid, words, settings, gameState }` | Partida iniciada |
| `wordFound` | Server→Client | `{ word, playerId, nickname, points, ... }` | Palabra encontrada |
| `playerFrozen` | Server→Client | `{ playerId, nickname, duration }` | Jugador congelado |
| `timerUpdate` | Server→Client | `{ timeLeft }` | Actualización de tiempo |
| `gameEnded` | Server→Client | `{ winner, stats, finalScores }` | Partida terminada |
| `chatMessage` | Server→Client | `{ message, playerId, nickname, timestamp }` | Mensaje de chat |

---

## Consideraciones para Escalabilidad

### Actualmente (Single Server)
- `games` y `users` son objetos en memoria
- `socket.join(gameId)` funciona porque todos los sockets están en el mismo servidor

### Para Escalamiento (Multiple Servers)

Para escalar a múltiples servidores, se necesitaría:

1. **Redis Adapter** para Socket.io
   - Permite que múltiples servidores compartan rooms
   - Los eventos se distribuyen entre servidores

2. **Redis o Base de Datos** para estado
   - Actualmente `games` está en memoria (se pierde al reiniciar)
   - Persistir en BD para consistencia entre servidores

3. **Cambios en reconexión**
   - El sistema actual funciona porque todo está en memoria
   - Con múltiples servidores, necesitaría buscar en Redis/BD

### Código Actual (en memoria)

```javascript
// Almacenamiento actual - en memoria del proceso
let games = {};      // { gameId: gameData }
let users = {};      // { socketId: { gameId, playerIndex } }

// Persistencia a archivo (solo al iniciar/terminar)
function saveGame(gameId, gameData) { ... }
function loadGame(gameId) { ... }
```

---

## Seguridad y Validaciones

### Validaciones Implementadas

1. **Límite de jugadores**: Máximo 4 por partida
2. **Estado del juego**: No permite unirse si ya está en 'playing' (excepto reconexión)
3. **playerId válido**: Verifica que el jugador existe antes de procesar
4. **Datos limpios**: Evita referencias circulares

### Validaciones Recomendadas para Producción

1. **Timeouts**: Reconectar automáticamente si no hay respuesta
2. **Auth**: Validar que el usuario es quien dice ser (token)
3. **Rate limiting**: Evitar spam de eventos
4. **Heartbeat**: Detectar conexiones muertas
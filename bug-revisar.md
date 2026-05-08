# Análisis Comparativo: Selección de Palabras V1 vs V2

## Diferencias entre V1 y V2

### Cliente V1 (App.js)

- **Envío:** HTTP POST a `/api/selectWord`
- **Procesamiento:** Respuesta INMEDIATA del servidor (líneas 408-420)
  - Actualiza palabras encontradas (foundBy)
  - Actualiza puntuación del jugador
- **Polling:** Cada 1seg a `/api/selectWord/{gameId}` para recibir resultados de otros jugadores

### Cliente V2 (GameScreen.jsx)

- **Envío:** Socket `socket.emit('selectWord')`
- **Procesamiento:** Escucha evento `socket.on('wordFound')` para actualizar UI
- **También tiene:** Polling HTTP a `/api/selectWord/{gameId}` (líneas 70-105)

### Servidor

- **HTTP `/api/selectWord`:** Procesa y guarda resultado en variable para polling
- **Socket `socket.on('selectWord'`:** Procesa y emite `wordFound` a la sala (NO guarda para polling)

---

## Problema Identificado (bug-revisar)

El polling HTTP en V2 **no funciona** porque:
1. El servidor guarda el resultado solo para el endpoint HTTP
2. V2 envía por Socket, que tiene su propio flujo (emite `wordFound`)
3. El cliente depende del evento socket, pero el evento podría no estar chegando correctamente

## Solución Implementada

Hacer que V2 procese la respuesta INMEDIATAMENTE después de enviar por Socket (como V1), además de escuchar el evento `wordFound` para actualizaciones de otros jugadores.

---

## Seguimiento (07/05/2026)

### Problema adicional detectado:
- GameScreen crea un nuevo socket al iniciar y hace `joinGame`
- El servidor rechazaba la conexión porque el juego ya estaba en estado 'playing' (línea 160)
- El socket no se unía a la sala y no recibía eventos de otros jugadores

### Solución aplicada:
- Modificar `socketHandlers.js` línea ~159 para permitir reconexión por nickname
- Si el juego ya está 'playing', busca al jugador por nickname y lo une a la sala
- El socket ahora debería recibir `wordFound` de otros jugadores

### Estado actual:
- La palabra se marca en verde y da puntos al jugador actual (funciona)
- NO llega a los demás jugadores (sigue sin funcionar)

### Siguiente paso:
- Revisar por qué el socket no está recibiendo los eventos de la sala

---

## Cambios Realizados (08/05/2026)

### 1. Límite de Jugadores
- **Archivo:** `server/socketHandlers.js`
- **Cambio:** Línea 155, cambiar `game.players.length >= 2` por `>= 4`
- **Motivo:** Permitir hasta 4 jugadores por sesión

### 2. Estado del Juego en Lobby V2
- **Archivo:** `server/socketHandlers.js`
- **Cambio:** Evento `gameStarted` ahora incluye `gameState` en el payload

- **Archivo:** `client/src/v2/LobbyMultijugador.jsx`
- **Cambios:**
  - Agregado estado `gameState` para mostrar estado real
  - Listener de `gameStarted` actualiza el estado
  - Lobby muestra "En juego" / "Esperando" según corresponda
  - Display de jugadores ahora muestra "X/4"

---

## Flujo de Interacción V2

### 1. Unirse a la Partida
- Cliente envía: `socket.emit('joinGame', {gameId, userData})`
- Servidor: `socket.join(gameId)` + emite `playerJoined` a todos

### 2. Iniciar Partida
- Creador envía: `socket.emit('startGame', gameId)`
- Servidor: `gameState = 'playing'` + emite `gameStarted` a todos

### 3. Encontrar una Palabra
- Jugador envía: `socket.emit('selectWord', {gameId, playerIndex, coordinates, word})`
- Servidor: valida, actualiza puntuación, guarda
- Emite a TODOS: `io.to(gameId).emit('wordFound', {...})`

### 4. Chat (durante juego)
- Cliente: HTTP POST a `/api/chat`
- Servidor: guarda + emite `socket.emit('chatMessage')` a la sala

### Eventos del Servidor (broadcast a sala)
| Evento | Datos | Cuándo |
|--------|-------|--------|
| `playerJoined` | {player, players} | Nuevo jugador entra |
| `gameStarted` | {players, settings, grid, words, gameState} | Creador inicia |
| `wordFound` | {word, playerId, nickname, points, coordinates, players, wordsLeft} | Palabra validada |
| `playerFrozen` | {playerId, nickname, duration} | 3 errores |
| `timerUpdate` | {timeLeft} | Cada segundo |
| `gameEnded` | {winner, stats, finalScores} | Victoria o timeout |

### Puntos Clave
- **Socket rooms**: `socket.join(gameId)` crea salas para broadcast
- **io.to(gameId)**: emite a TODOS en la sala (incluyendo emisor)
- **wordFound incluye**: `players` y `wordsLeft` para actualizar UI sin polling

---

## Análisis de Errores en Sesiones V2 (08/05/2026)

### Problema Central
Las palabras encontradas por un jugador NO se actualizaban en los demás jugadores.

### Causas Raíz Identificadas

#### 1. Uso de `playerIndex` en lugar de `playerId` real

**Síntoma**: El servidor no encontraba al jugador que enviaba la palabra.

**Causa**:
- El cliente (`GameScreen.jsx`) enviaba `playerIndex` (número que varía por cliente)
- El servidor buscaba por índice: `game.players[playerIndex]`
- Pero cada cliente tenía un índice diferente para el mismo jugador
- El socket del GameScreen era diferente al del Lobby, causando mismatch de IDs

**Solución**:
- Cambiar a enviar `playerId` (ID real del jugador) en lugar de `playerIndex`
- Cliente: usa `gameData.players[playerIndex].id` para obtener el ID correcto
- Servidor: busca por `.find(p => p.id === playerId)` en lugar de índice

---

#### 2. Reconexión fallida por IDs diferentes

**Síntoma**: El jugador se unía en el Lobby con un socket, pero al entrar al GameScreen creaba un nuevo socket con ID diferente.

**Causa**:
- Al crear partida: el jugador se guardaba con el `socket.id` del Lobby
- Al entrar al GameScreen: se creaba un nuevo socket con diferente `socket.id`
- El servidor no reconocía al jugador porque buscaba por el ID del socket nuevo

**Solución**:
- Modificar `joinGame` para buscar siempre por `nickname` antes de crear nuevo jugador
- Permite reconexión: si el nickname ya existe, usa el ID original del jugador
- Ya no se elimina al jugador al desconectarse (para permitir reconexión)

---

#### 3. Referencias circulares en datos enviados (Stack Overflow)

**Síntoma**: `RangeError: Maximum call stack size exceeded` en el servidor.

**Causa**:
- Los objetos `game` contenían referencias circulares
- Al usar `{ ...game }` en callbacks, se copiaban todas las referencias
- Socket.io intentaba serializar y fallaba por recursión infinita

**Solución**:
- Crear objetos planos explícitamente en lugar de usar spread operator
- Campos incluidos: `gameId`, `players` (limpio), `words` (limpio), `settings`, `grid`, `gameState`, `startTime`
- Aplicado en todos los callbacks: `createGame`, `joinGame`, `startGame`

---

#### 4. Clientes con stale references en listeners de socket

**Síntoma**: Los listeners de socket-usaban valores stale del closure.

**Causa**:
- El `useEffect` de listeners dependía de `players` array
- Al actualizar `players`, los listeners se recreaban con referencias antiguas

**Solución**:
- Usar `currentPlayerIdRef` (useRef) que mantiene el ID actual
- Actualizar la ref cuando cambia el jugador
- Usar la ref en lugar del closure en los listeners

---

### Archivos Modificados

1. **Servidor** (`server/socketHandlers.js`):
   - Cambiar validación de límite: `>= 2` → `>= 4`
   - Buscar jugador por `playerId` en lugar de índice
   - Buscar por nickname siempre (reconexión)
   - No eliminar jugador al desconectar
   - Crear objetos planos para todos los callbacks

2. **Cliente V2** (`client/src/v2/GameScreen.jsx`):
   - Enviar `playerId` real en `selectWord` (desde `gameData.players[playerIndex].id`)
   - Usar ref para mantener el playerId actual
   - Agregar validación antes de enviar

---

### Flujo Correcto Actual

1. **Lobby**: Jugador crea partida → se guarda con su `socket.id` como `player.id`
2. **GameScreen**: Nuevo socket hace `joinGame` con su `nickname`
3. **Servidor**: Busca por nickname, encuentra el jugador con su ID original
4. **Cliente**: Envía `selectWord` con el `playerId` real del `gameData`
5. **Servidor**: Busca jugador por `playerId`, procesa, emite `wordFound`
6. **Todos**: Reciben evento con `playerId` real y actualizan correctamente

---

### Logs para Debug

El servidor ahora imprime:
- `📥 joinGame - gameId, socket.id, nickname` - entrada de jugador
- `📋 Jugadores en la partida:` - IDs y nicknames al iniciar
- `✅ Reconectado - playerIndex` - cuando se reconecta por nickname
- `📥 selectWord recibido - playerId, word` - cuando se envía palabra
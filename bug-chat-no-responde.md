# Bug: Socket.io No Entrega Eventos al Cliente

## Problema

Socket.io no entregaba los eventos al cliente. El servidor recibía los mensajes y los reenviaba, pero el cliente no los recibía. Esto afectaba:
- Chat: los mensajes enviados no llegaban al cliente
- Botón Confirmar: las palabras seleccionadas no se validaban

## Síntomas

- El servidor recibía correctamente los eventos (`socket.emit`)
- El servidor reenviaba a la sala (`io.to(gameId).emit(...)`)
- El cliente NO recibía los eventos
- No había errores en consola

## Causa Raíz

**Race condition con los event listeners de Socket.io**:

1. El socket se crea a nivel de componente (`const socket = io(SOCKET_URL)`)
2. Los listeners se registran en un `useEffect`
3. El socket puede conectarse ANTES de que el useEffect se ejecute
4. Cuando el useEffect se ejecuta, el socket ya está conectado pero el listener no se registra correctamente
5. Alternativamente, los listeners se sobrescriben o limpian en algún momento

El modelo "push" de WebSocket depende de que el cliente tenga listeners activos en todo momento, lo cual es frágil en React.

## Solución Implementada

**HTTP Polling en lugar de WebSocket push**:

### Envío
- HTTP POST a endpoints específicos
- Ejemplo: `POST /api/chat` con JSON body

### Recepción
- El cliente pregunta al servidor cada 1 segundo (`setInterval`)
- HTTP GET a `/api/chat/{gameId}`
- Actualiza el estado local con la respuesta

### Endpoints Creados

```
POST /api/chat          - Enviar mensaje de chat
GET  /api/chat/:gameId - Obtener mensajes (polling)

POST /api/selectWord   - Confirmar palabra seleccionada
GET  /api/selectWord/:gameId - Obtener resultado (polling)
```

## Por Qué Funciona

1. **No depende de listeners activos**: El cliente pregunta, el servidor responde
2. **Modelo "pull" en lugar de "push"**: Más tolerante a problemas de timing
3. **Simple y predecible**: Cada request es independiente
4. **1 segundo de delay**: Aceptable para un chat

## Código Cliente

```javascript
// Enviar (HTTP)
await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ gameId, message, playerId, nickname })
});

// Recibir (polling)
setInterval(async () => {
  const res = await fetch(`/api/chat/${gameId}`);
  const data = await res.json();
  setChatMessages(data.messages);
}, 1000);
```

## Impacto

- Chat: ✓ Funciona
- Confirmar palabra: ✓ Funciona
- El resto del juego (crear/unir partida, timer, freeze) sigue usando Socket.io porque esos funcionan correctamente

## Notas

- Esta solución es menos "tiempo real" que WebSocket puro ( ~1 segundo de delay)
- Para un chat de juego cooperativo es aceptable
- Para juegos competitivos rápidos podría needing más investigación
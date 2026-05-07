# Análisis Comparativo: Selección de Palabras V1 vs V2

## Cliente V1 (App.js)

- **Envío:** HTTP POST a `/api/selectWord`
- **Procesamiento:** Respuesta INMEDIATA del servidor (líneas 408-420)
  - Actualiza palabras encontradas (foundBy)
  - Actualiza puntuación del jugador
- **Polling:** Cada 1seg a `/api/selectWord/{gameId}` para recibir resultados de otros jugadores

## Cliente V2 (GameScreen.jsx)

- **Envío:** Socket `socket.emit('selectWord')`
- **Procesamiento:** Escucha evento `socket.on('wordFound')` para actualizar UI
- **También tiene:** Polling HTTP a `/api/selectWord/{gameId}` (líneas 70-105)

## Servidor

- **HTTP `/api/selectWord`:** Procesa y guarda resultado en variable para polling
- **Socket `socket.on('selectWord'`:** Procesa y emite `wordFound` a la sala (NO guarda para polling)

## Problema Identificado

El polling HTTP en V2 **no funciona** porque:
1. El servidor guarda el resultado solo para el endpoint HTTP
2. V2 envía por Socket, que tiene su propio flujo (emite `wordFound`)
3. El cliente depende del evento socket, pero el evento podría no estar chegando correctamente

## Solución

Hacer que V2 procese la respuesta INMEDIATAMENTE después de enviar por Socket (como V1), además de escuchar el evento `wordFound` para actualizaciones de otros jugadores.
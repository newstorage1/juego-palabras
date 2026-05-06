# Bug: Puntuación No Se Sumaba Al Encontrar Palabras

## Problema

Al presionar el botón "Confirmar" después de seleccionar una palabra válida:
- El servidor validaba correctamente la palabra
- El servidor calculaba los puntos
- Los puntos NO se reflejaban en la interfaz del cliente

## Síntomas

1. El servidor mostraba en logs:
```
📥 selectWord: { word: 'NODEJS', ... }
🔍 Validation: { wordSent: 'NODEJS', wordFromGrid: 'NODEJS', valid: true }
```
2. El cliente no actualizaba los puntos
3. Errores `ERR_CONNECTION_REFUSED` en consola del navegador (causados por reinicios de nodemon)

## Causas Raíz

### 1. Cliente ignoraba la respuesta HTTP

El cliente en `App.js` hacía el `fetch` pero **no procesaba la respuesta**:

```javascript
// ANTES - No procesaba la respuesta
await fetch('http://localhost:3001/api/selectWord', { ... });
```

El servidor devolvía `{ success: true, points }` pero el cliente lo descartaba.

### 2. Dependencia del polling defectuoso

El cliente intentaba obtener el resultado via polling (`GET /api/selectWord/:gameId`), pero:
- El servidor se reiniciaba frecuentemente (nodemon detectando cambios)
- El resultado se almacenaba en memoria volátil (`wordSelectResults`)
- Cuando el cliente hacía la solicitud GET, el servidor ya se había reiniciado y había perdido el resultado

### 3. Estructura de datos inconsistente

El servidor respondía con formato plano `{ success: true, points }` pero el código de polling buscaba `wordData.result.found`, causando que nunca se procesara correctamente.

## Solución Implementada

### 1. Procesar respuesta inmediata del servidor

**Archivo**: `client/src/App.js`

El cliente ahora procesa directamente la respuesta del POST:

```javascript
const response = await fetch('http://localhost:3001/api/selectWord', { ... });
const data = await response.json();

if (data.success && data.points > 0) {
  // Actualizar palabras encontradas
  setWords(prev => prev.map(w => 
    w.word === data.word ? { ...w, foundBy: data.playerId } : w
  ));
  // Actualizar puntuación
  setPlayers(prev => prev.map(p => 
    p.id === data.playerId 
      ? { ...p, score: p.score + data.points, foundWords: [...p.foundWords, data.word] }
      : p
  ));
}
```

### 2. Mejorar respuesta del servidor

**Archivo**: `server/index.js`

El servidor ahora devuelve información completa en la respuesta:

```javascript
res.json({ 
  success: true, 
  points,
  word,
  playerId: game.players[playerIndex]?.id,
  coordinates
});
```

## Archivos Modificados

### `server/index.js` (líneas ~115-125)
- Mejorada la respuesta del endpoint `/api/selectWord` para incluir `word`, `playerId` y `coordinates`

### `client/src/App.js` (líneas ~369-400)
- Agregado procesamiento de la respuesta inmediata del servidor
- Actualizado el estado local de `players` y `words` con los datos recibidos

## Resultado

Ahora cuando un jugador encuentra una palabra válida:
1. El servidor valida la palabra
2. El servidor calcula los puntos (1 punto para palabras < 5 letras, 2 puntos para 5-7 letras, 3 puntos para 8+ letras)
3. El servidor marca la palabra como encontrada (`foundBy`)
4. El cliente recibe la respuesta y actualiza inmediatamente la puntuación y la lista de palabras encontradas

## Notas

- Esta solución funciona incluso si el servidor se reinicia después de procesar la palabra
- El polling ya no es necesario para este flujo (aunque sigue existiendo para otros casos)
- La documentación original en `configurar-boton-confirmacion.md` describía problemas previos relacionados con funciones faltantes en el servidor
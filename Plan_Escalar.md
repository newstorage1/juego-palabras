# Plan de Escalamiento del Proyecto

## Objetivo
Implementar las funcionalidades definidas en `Game_Updated.md` sin modificar lo ya existente sin discutir primero.

---

## Estado Actual del Proyecto

### ✅ Implementado actualmente:
- Lobby integrado con: nickname, avatar, idioma, dificultad, selector de tema
- Sistema de crear/unirse a partidas
- Juego completo (tablero, congelamiento, temporizador, puntuación)
- Chat durante el juego (no es el chat global del lobby)
- Persistencia de partidas en JSON

### ❌ Pendiente según Game_Updated.md:
- Pre-lobby como pantalla de registro separada
- Lobby Individual vs Multijugador separados
- Chat global del lobby multijugador
- Estadísticas de usuario (partidasGanadas, mejorPuntaje)
- Notificaciones automáticas en chat al crear/unirse a partida

---

## Plan Escalonado

### Fase 1: Pre-lobby (Pantalla de Registro)
**Objetivo**: Crear la pantalla inicial de registro antes de entrar al lobby

**Tareas**:
1. Crear componente `PreLobby.jsx` con los campos:
   - Nickname (3-15 caracteres, obligatorio)
   - Edad (1-120 años, obligatorio)
   - Avatar (selector visual)
   - Tipo de Juego (Individual/Multijugador) - solo mayores de 13 años
2. Implementar validaciones según restricciones de edad
3. Guardar datos del usuario en localStorage con estructura:
   ```json
   { "nickname": "...", "age": 20, "avatar": "🦁", "gameMode": "multijugador", "partidasGanadas": 0, "mejorPuntaje": 0 }
   ```
4. Redirigir al lobby correspondiente según gameMode

**Notas**: No modificar el Lobby actual - crear ruta nueva o integrar con la lógica existente.

---

### Fase 2: Separar Lobby Individual y Multijugador
**Objetivo**: Diferenciar el lobby según el modo de juego seleccionado

**Tareas**:
1. Modificar App.js para detectar si viene del Pre-lobby
2. Crear/ajustar componente Lobby Individual:
   - Crear partida individual
   - Unirse a partida individual
   - Configuración (idioma, dificultad, tema)
3. Crear Lobby Multijugador:
   - Chat global del lobby (todos ven todos los mensajes)
   - Crear partida (genera código, envía notificación al chat)
   - Unirse a partida (envía notificación al chat)
   - Lista de espera de la partida

**Notas**: Mantener compatibilidad con lo existente. El juego en sí no se modifica.

---

### Fase 3: Chat Global del Lobby Multijugador
**Objetivo**: Implementar el chat global donde todos los jugadores pueden conversar

**Tareas**:
1. Implementar evento socket `joinLobby` para conectar al room global
2. Implementar evento `lobbyChatMessage` para enviar/recibir mensajes
3. Persistir historial de mensajes (últimos 50)
4. Mostrar historial a nuevos jugadores que se conecten

**Notas**: El chat del juego (durante la partida) se mantiene igual.

---

### Fase 4: Notificaciones en Chat
**Objetivo**: Mostrar notificaciones automáticas cuando se crea/unirse a partida

**Tareas**:
1. Al crear partida: emit message tipo system "El jugador [Nickname] ha creado la sala [Código]"
2. Al unirse a partida: emit message tipo system "El jugador [Nickname] se ha unido a la sala [Código]"
3. Estos mensajes aparecen en el chat global del lobby

---

### Fase 5: Estadísticas del Usuario
**Objetivo**: Registrar y mostrar el desempeño del jugador

**Tareas**:
1. Actualizar `partidasGanadas` cuando el usuario gana una partida
2. Actualizar `mejorPuntaje` si el puntaje actual es mayor al anterior
3. Estas estadísticas se guardan en localStorage junto con el perfil
4. Opcional: Mostrar estadísticas en el Pre-lobby o Lobby

**Notas**: No modificar la lógica del juego, solo actualizar el perfil al terminar.

---

### Fase 6: Integración y Pruebas
**Objetivo**: Verificar que todo funcione correctamente

**Tareas**:
1. Probar flujo completo: Pre-lobby → Lobby → Partida → Fin
2. Probar ambos modos (individual y multijugador)
3. Verificar chat global y notificaciones
4. Verificar estadísticas se actualizan correctamente
5. Verificar que lo existente no se haya roto

---

## Notas Importantes

1. **No modificar código existente** sin discutirlo primero con el usuario
2. **Cada fase se discute antes de implementar** para revisar alcance
3. **El juego en sí (tablero, congelamiento, puntuación)** ya está implementado - no tocar
4. **Las rutas y estructura de archivos** se definirá en cada fase
5. **El servidor** tiene los handlers necesarios - evaluar si agregar nuevos eventos socket

---

## Prioridades Sugeridas

1. **Fase 1**: Pre-lobby - Implementación más básica y nueva
2. **Fase 2**: Separar lobbies - Necesario para el flujo correcto
3. **Fase 3**: Chat global - Complementa el lobby multijugador
4. **Fase 4**: Notificaciones - Mejora UX
5. **Fase 5**: Estadísticas - Funcionalidad adicional
6. **Fase 6**: Pruebas - Al final

---

*Este plan se irá revisando y ajustando según se avance y se discutan los detalles de cada fase.*
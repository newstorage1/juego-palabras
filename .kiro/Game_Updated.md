# Sopa de Letras Competitiva en Tiempo Real - Especificación Actualizada

## ---

## 📋 Actualizaciones y Aclaraciones

### **1. Generación de Palabras**

#### Fuentes de Palabras:
- **Base de Datos Local**: Temas predefinidos en español e inglés
- **Asistencia con IA**: Los participantes pueden solicitar temarios personalizados (ej. "20 palabras de animales raros")
- **Restricciones de Contenido**:
  - Prohibido contenido sexual y violento
  - Solo lenguaje formal (sin coloquialismos)
  - Filtro automático de contenido inapropiado

#### Bilingüismo:
- Soporte nativo para español e inglés
- La IA debe generar palabras en el idioma solicitado
- La base de datos local contendrá categorías en ambos idiomas

#### Lógica de Generación:
- El servidor valida que las palabras cumplan con las restricciones
- Se asegura que las palabras se crucen en el tablero
- Se evita generar palabras que sean subcadenas de otras (para evitar ambigüedad)

---

### **2. Sistema UI para Selección**

#### Diseño de Interacción:
- **Arrastrar y Soltar**: Selección de palabras arrastrando el mouse o dedo
- **Feedback Visual**:
  - Línea conectando las letras seleccionadas
  - Colores distintos para cada jugador (verde para jugador local, rojo para rival)
  - Animación de "resaltado" al pasar por encima de una letra

#### Direcciones de Selección:
- Horizontal (izquierda a derecha y derecha a izquierda)
- Vertical (arriba a abajo y abajo a arriba)
- Diagonal (4 direcciones)

#### Validación en Tiempo Real:
- Mientras se arrastra: muestra una línea punteada
- Al soltar: valida la palabra seleccionada
- Feedback inmediato: correcto/incorrecto con animación

#### Estado de "Congelamiento":
- Jugador congelado ve el tablero pero no puede interactuar
- Se muestra un temporizador visual en la esquina superior
- Mensaje: "Espera X segundos para volver a jugar"

---

### **3. Sistema de Guardado y Recuperación**

#### Persistencia:
- **Formato**: JSON
- **Contenido del archivo**:
  ```json
  {
    "gameId": "SOPA-X92",
    "players": [
      { "id": "p1", "nickname": "Jugador A", "avatar": "default", "score": 12 },
      { "id": "p2", "nickname": "Jugador B", "avatar": "default", "score": 8 }
    ],
    "grid": [
      ["A", "B", "C", ...],
      ...
    ],
    "words": [
      { "word": "NODEJS", "foundBy": null, "coordinates": [[0,0], [0,5]] },
      ...
    ],
    "settings": {
      "difficulty": "medium",
      "gridSize": 15,
      "theme": "technology"
    },
    "timestamp": "2026-05-04T10:30:00Z"
  }
  ```

#### Recuperación:
- Al reiniciar el servidor, busca archivos `.json` en el directorio de partidas
- Restaura el estado de cada partida
- Notifica a los jugadores conectados que la partida ha sido recuperada
- Si un jugador no está conectado, se mantiene en espera hasta que regrese

#### Frecuencia de Guardado:
- Auto-guardado cada 30 segundos
- Guardado forzado al finalizar una partida
- Guardado inmediato al encontrar una palabra

#### Configuración de Desarrollo:
- Archivo `nodemon.json` para evitar reinicios no deseados
- Ignora cambios en la carpeta `saves/` para prevenir conflictos durante el juego
- El servidor monitoriza solo la carpeta `server/`

---

### **4. Temporizador y Condición de Victoria**

#### Temporizador Global:
- Tiempo límite por partida (configurable: 10, 15, 20 minutos)
- Se muestra en el scoreboard como "Tiempo: 15:00"
- Al llegar a 0, se finaliza la partida automáticamente

#### Condición de Victoria:
- **Modo Individual**: Encontrar el 100% de las palabras antes de que termine el tiempo
- **Modo Multijugador**: Encontrar el 51% de las palabras (ej. 26 de 50)
- **Empate**: Si ambos llegan al 51% al mismo tiempo, gana quien tenga más puntos
- **Puntos**: 
  - Palabras cortas (≤4 letras): 1 punto
  - Palabras medianas (5-7 letras): 2 puntos
  - Palabras largas (≥8 letras): 3 puntos

#### Penalización por Intentos Fallidos:
- 3 intentos incorrectos consecutivos → Congelamiento de 5 segundos
- El contador de intentos fallidos se resetea al encontrar una palabra correctamente

#### Final de Partida:
- Pantalla de Fin de Juego con:
  - Nombre del ganador y puntuación
  - Puntuación final de todos los jugadores
  - Estadísticas: palabras encontradas, palabra más larga
  - Botón "Regresar al Lobby"

---

## 🏗️ Arquitectura Técnica Actualizada

### Puertos de Desarrollo:
- **Puerto 3001**: Servidor Node.js/Express (API REST + Socket.io)
- **Puerto 3000**: Cliente React (dev server de create-react-app)
- **Proxy**: El cliente tiene configurado un proxy en `client/package.json` que redirige las llamadas a `/api/*` hacia `http://localhost:3001`

### Backend:
- **Node.js** con **Express.js**
- **Socket.io** para comunicación en tiempo real
- **Redis** (opcional pero recomendado para persistencia rápida)
- **Base de datos local**: Archivos JSON para persistencia

### Frontend:
- **React** con TypeScript
- **CSS Modules** o **Tailwind CSS** para estilos
- **Framer Motion** para animaciones

### Estructura de Archivos:
```
/sopa-pro-multiplayer
├── /client
│   ├── /components
│   │   ├── Board.jsx           // Renderiza la matriz y maneja selección
│   │   ├── Marquee.jsx         // Efecto marquesina de palabras
│   │   ├── Chat.jsx            // Sistema de mensajería
│   │   ├── Scoreboard.jsx      // Marcador en vivo
│   │   ├── Timer.jsx           // Temporizador global
│   │   └── CongestionOverlay.jsx // Pantalla de congelamiento
│   ├── /hooks
│   │   ├── useGameLogic.js     // Lógica del juego
│   │   └── useSocket.js        // Manejo de sockets
│   └── App.jsx
├── /server
│   ├── index.js                // Configuración de Express y Socket.io
│   ├── gameLogic.js            // Algoritmo de generación de sopa de letras
│   ├── socketHandlers.js       // Gestión de salas y eventos
│   ├── wordGenerator.js        // Generación de palabras con IA
│   ├── persistence.js          // Guardado y recuperación JSON
│   └── validation.js           // Validación de palabras y selecciones
├── /data
│   ├── words_es.json           // Base de datos en español
│   └── words_en.json           // Base de datos en inglés
├── /saves
│   └── [gameId].json           // Partidas guardadas
└── package.json
```

---

## 🚀 Flujo y Menús del Juego (Actualizado)

### **1. Pantalla de Entrada (Pre-lobby)**

El **Pre-lobby** es la pantalla inicial de registro donde el usuario crea su perfil para acceder al juego. Es el punto de entrada obligatorio antes de acceder a cualquier modo de juego.

#### Campos del Formulario:

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|-------------|
| **Nickname** | Texto | Apodo del jugador (identificador en el juego) | Obligatorio, 3-15 caracteres |
| **Edad** | Número | Edad del jugador | Obligatorio, 1-120 años |
| **Avatar** | Selector visual | Icono que representa al jugador | Opcional, emoji predefinido |
| **Tipo de Juego** | Selector | Modalidad de juego a jugar | Obligatorio, según edad |

#### Restricciones por Edad:

- **Menores de 13 años**: Solo pueden jugar en **modo individual**. La opción multijugador se deshabilita y muestra un mensaje informativo.
- **13 años o más**: Pueden elegir entre **modo individual** o **modo multijugador**.

#### Modos de Juego:

- 🔵 **Modo Individual**: El jugador participa solo contra el tiempo, buscando todas las palabras en el tablero.
- 🟢 **Modo Multijugador**: El jugador se une a una sala de espera donde puede crear o unirse a partidas con otros jugadores en línea.

#### Persistencia del Usuario:

- El perfil del usuario se guarda en `localStorage` del navegador
- Mientras el navegador permanezca abierto, el usuario mantiene su sesión activa
- Al cerrar o refrescar la página, los datos del usuario se eliminan
- Al volver a entrar, el usuario debe completar el pre-lobby nuevamente como un jugador nuevo

#### Estadísticas del Usuario:

El perfil del usuario además de los datos básicos (nickname, edad, avatar, modo de juego) también mantiene un registro histórico de su desempeño:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **partidasGanadas** | Número | Cantidad total de partidas que el usuario ha ganado |
| **mejorPuntaje** | Número | El puntaje más alto alcanzado en una sola partida |

Estas estadísticas se actualizan cada vez que el usuario completa una partida:
- Al finalizar una partida, si el usuario resultó ganador, se incrementa `partidasGanadas`
- Al finalizar cualquier partida, si el puntaje obtenido es mayor al `mejorPuntaje` actual, se actualiza este valor
- Las estadísticas persisten en `localStorage` junto con los datos del perfil

#### Validaciones:

- Nickname no puede estar vacío ni tener menos de 3 o más de 15 caracteres
- Edad debe ser un número válido entre 1 y 120 años
- Si edad < 13: Deshabilitar opción multijugador y mostrar mensaje informativo
- Todos los campos obligatorios deben completarse antes de poder entrar

### **Lobby**

Según la opción que seleccionó el jugador en el Pre-lobby, cargará una de estas dos opciones:

### **2. Lobby - Modo Individual**

(Si选择了Individual o tiene menos de 13 años)

El Lobby es la pantalla principal donde el jugador gestiona sus partidas. Según la opción seleccionada en el Pre-lobby, se carga uno de los siguientes modos:

#### Opciones de Configuración de Partida:

- **Selector de Dificultad**: Tamaño de cuadrícula (Fácil 10x10, Medio 15x15, Difícil 20x20)
- **Selector de Idioma**: Español o Inglés
- **Selecciona tu Tema**: Opción para elegir el tema visual del juego (Claro, Oscuro, Neón, Natural, etc.)

#### Acciones Disponibles:

##### Crear Partida:
- **Idioma**: Selector del idioma de las palabras
- **Dificultad**: Selector del tamaño del tablero
- **Botón "Crear Partida"**: Al presionarlo, genera un código único de partida (ej. SOPA-X92)

##### Unirse a Partida:
- **Campo "Código de Partida"**: Formulario para introducir el código de la partida a la que se desea unir
- **Botón "Unirse a Partida"**: Al presionarlo, valida el código y une al jugador a la partida

- **Solicitar Temario con IA**: Botón para pedir palabras personalizadas
- **Botón "Iniciar Juego"**: Comienza la partida individualmente

### **3. Lobby - Modo Multijugador (Sala de Espera)**

(Si选择了Multijugador y tiene 13 años o más)

El Lobby Multijugador funciona como una **sala de espera global** donde todos los jugadores conectados pueden interactuar antes de entrar a una partida específica.

#### Características del Lobby Global:

- **Chat Global en Tiempo Real**: Todos los jugadores conectados a la sala de espera pueden escribir y ver los mensajes de todos los demás. No existe un chat privado; todo el mundo comparte el mismo espacio de conversación.
- **Historial de mensajes**: Los mensajes anteriores persisten y cualquier nuevo jugador que ingrese puede ver todo el historial de conversación
- **Indicación de usuarios conectados**: Muestra quién está en la sala de espera

#### Opciones de Configuración (para crear partida):

- **Selector de Dificultad**: Tamaño de cuadrícula (Fácil 10x10, Medio 15x15, Difícil 20x20)
- **Selector de Idioma**: Español o Inglés
- **Selecciona tu Tema**: Opción para elegir el tema visual del juego

#### Acciones Disponibles:

##### Crear Partida:
- **Idioma**: Selector del idioma de las palabras
- **Dificultad**: Selector del tamaño del tablero
- **Botón "Crear Partida"**: Al presionarlo, genera un código único de partida (ej. SOPA-X92)
- **Notificación en Chat**: Al crear la partida, el sistema envía automáticamente un mensaje al chat global indicando: "El jugador [Nickname] ha creado la sala [Código]" para que todos puedan verlo

##### Unirse a Partida:
- **Campo "Código de Partida"**: Formulario para introducir el código de la partida a la que se desea unir
- **Botón "Unirse a Partida"**: Al presionarlo, valida el código y une al jugador a la partida
- **Notificación en Chat**: Al unirse a una partida, el sistema envía automáticamente un mensaje al chat global indicando: "El jugador [Nickname] se ha unido a la sala [Código]" para que todos puedan verlo

#### Lista de Espera de la Partida:

- **Lista de jugadores**: Muestra los jugadores que se han unido a una partida específica
- **Estado de preparación**: Cada jugador debe confirmar que está listo

#### Control del Juego:
- **Solo el creador puede iniciar**: Cuando todos los jugadores desired están unidos, el creador presiona "Iniciar Juego"
- **Sincronización**: Al presionar iniciar, todos los jugadores entran al juego simultáneamente
- **El juego no comienza hasta que el creador lo indique**

#### Información Mostrada:
- Código de la partida (para compartir)
- Lista de jugadores conectados al lobby global
- Lista de jugadores en cada partida específica
- Contador de jugadores listos
- Botón "Crear Partida" (para cualquier jugador en el lobby)
- Botón "Unirse a Partida" con campo de código
- Botón "Iniciar Juego" (solo visible para el creador de la partida)

---

### **4. Ejemplo de Flujo - Modo Multijugador**

```
Usuario entra al juego → Pantalla de Entrada
  ├── Ingresa Nick: "Juanito"
  ├── Ingresa Edad: 20
  └── Selecciona: Multijugador
       ↓
Entra al Lobby Multijugador (Sala de Espera)
  ├── Chat público disponible
  ├── Juanito escribe: "Voy a crear partida, esperen"
  ├── Juanito presiona "Crear Partida"
  ├── Sistema genera: "SOPA-ABC"
  ├── Juanito escribe en chat: "Mi código es SOPA-ABC, únanse"
  ├── María ve el código y presiona "Unirse", ingresa "SOPA-ABC"
  ├── Pedro ve el código y presiona "Unirse", ingresa "SOPA-ABC"
  ├── Juanito ve en la lista: "María conectada", "Pedro conectado"
  ├── Juanito escribe: "Ya estamos todos, inicio?"
  ├── Juanito presiona "Iniciar Juego"
  └── Todos entran al juego simultáneamente
```

### **2. Interfaz de Juego (Dashboard)**

#### Zona Superior (Scoreboard):
- Marcador en vivo: "Jugador A: 12 pts | Jugador B: 8 pts"
- Temporizador: "Tiempo: 15:00"
- Porcentaje de palabras encontradas

#### Zona Central (El Tablero):
- Rejilla interactiva con selección por arrastre
- Feedback visual de selección
- Animaciones al encontrar palabras

#### Zona Inferior (Marquesina de Palabras):
- Palabras desplazándose de derecha a izquierda
- Animación de explosión al encontrar palabra
- Color según jugador que la encontró

#### Lateral (Chat y Log):
- Chat para comunicarse (funciona mediante HTTP polling)
- Historial de quién encontró qué palabra
- Notificaciones de congelamiento

---

## 📊 Estructura de Datos JSON (Actualizada)

```json
{
  "gameId": "SOPA-X92",
  "players": [
    {
      "id": "p1",
      "nickname": "Jugador A",
      "avatar": "default",
      "score": 12,
      "consecutiveFailures": 0,
      "frozenUntil": null,
      "foundWords": ["NODEJS", "REACT"]
    },
    {
      "id": "p2",
      "nickname": "Jugador B",
      "avatar": "default",
      "score": 8,
      "consecutiveFailures": 2,
      "frozenUntil": 1680512400000,
      "foundWords": ["EXPRESS"]
    }
  ],
  "grid": [
    ["A", "B", "C", ...],
    ...
  ],
  "words": [
    {
      "word": "NODEJS",
      "foundBy": "p1",
      "coordinates": [[0,0], [0,5]],
      "points": 2
    },
    {
      "word": "REACT",
      "foundBy": "p1",
      "coordinates": [[1,1], [1,5]],
      "points": 2
    },
    {
      "word": "EXPRESS",
      "foundBy": "p2",
      "coordinates": [[2,2], [2,8]],
      "points": 3
    }
  ],
  "settings": {
    "difficulty": "medium",
    "gridSize": 15,
    "theme": "technology",
    "language": "en",
    "timeLimitMinutes": 15,
    "mode": "solo" // o "multiplayer"
  },
  "timestamp": "2026-05-04T10:30:00Z",
  "gameState": "waiting" | "playing" | "finished",
  "lastWordResult": null, // Resultado de la última palabra encontrada (para polling)
  "winner": null
}
```

---

## 💡 Nuevas Funcionalidades

### **Generación con IA**:
- Endpoint `/api/generate-words` que recibe una solicitud como "20 palabras de animales raros"
- Filtra contenido inapropiado
- Devuelve palabras en el idioma solicitado
- Valida que las palabras sean formales y no coloquiales

### **Persistencia Automática**:
- Guardado cada 30 segundos
- Recuperación al reiniciar
- Notificación a jugadores de partida recuperada
- El resultado de palabras se guarda en el objeto game para survive a reinicios del servidor

### **Temporizador Global**:
- Contador regresivo visible para todos
- Finalización automática al llegar a 0
- Modal de estadísticas al finalizar

### **Sistema de Congelamiento**:
- Visualización clara del estado
- Temporizador de recuperación
- Bloqueo de interacción con tablero

---

## 🎨 Personalización por Usuario

### Temas y Estilos:
- **Selección de Tema**: Cada usuario puede elegir un tema visual (Claro, Oscuro, Neón, Natural, etc.)
- **Imagen de Fondo**: Opción para subir una imagen personalizada
- **Colores UI Personalizables**:
  - Color del tablero
  - Color de las letras
  - Color de selección (por jugador)
  - Color de fondo de marquesina
  - Color de texto del chat

### Modos de Juego:
- **Juego Individual**: Un jugador contra el tiempo
  - Objetivo: Encontrar todas las palabras antes de que termine el tiempo
  - Sin rival, pero con marcador personal
  - Estadísticas individuales (precisión, tiempo por palabra)
- **Juego Multijugador**: Dos jugadores en competencia
  - Sincronización en tiempo real
  - Marcador competitivo
  - Chat entre jugadores

### Configuración de Perfil:
- Avatar personalizado
- Nickname
- Tema preferido
- Colores UI personalizados
- Idioma preferido

---

## 🎮 Cómo Funciona la Mecánica del Juego

### Flujo cuando un jugador encuentra una palabra:

1. **Selección de letras**: El jugador arrastra o hace clic en las celdas del tablero para formar una palabra
2. **Confirmar**: El jugador presiona el botón "Confirmar"
3. **Validación del servidor**: 
   - El servidor valida que la palabra exista en las coordenadas seleccionadas
   - Usa `validateSelection()` para verificar
4. **Cálculo de puntos**:
   ```
   - 1-4 letras: 1 punto
   - 5-7 letras: 2 puntos
   - 8+ letras: 3 puntos
   ```
5. **Actualización en tiempo real**:
   - El servidor emite evento `wordFound` a TODOS los jugadores
   - Cada cliente actualiza su estado local
6. **Polling**: Cada 1 segundo, el cliente hace polling a `/api/selectWord/{gameId}` para recibir resultados de otros jugadores

### Visualización de palabras encontradas:

| Estado | Color | Significado |
|--------|-------|-------------|
| **Pendiente** | Gris claro | La palabra aún no ha sido encontrada |
| **Encontrada por mí** | Verde (#48bb78) | Yo encontré esta palabra |
| **Encontrada por otro** | Gris (#999) | Otro jugador la encontró primero |

### Actualización de puntuación:

- La puntuación se actualiza tanto por respuesta inmediata como por polling
- Todos los jugadores ven la puntuación actualizada en el scoreboard
- El servidor envía el array de `players` actualizado en cada evento

### Sistema de congelamiento:

- Si un jugador fallan 3 palabras consecutivas, queda congelado por 5 segundos
- Durante ese tiempo no puede interactuar con el tablero
- Se muestra un overlay con temporizador

### Condición de victoria:

- **Modo Individual**: Encontrar el 100% de las palabras
- **Modo Multijugador**: Encontrar el 51% de las palabras
- Cuando se alcanza, el servidor ejecuta `endGame()` y emite `gameEnded` a todos los jugadores

### Chat del juego:

- Funciona mediante HTTP polling (cada 1 segundo)
- Los mensajes se almacenan en memoria en el servidor
- Cualquier jugador en la partida puede enviar y ver mensajes

---

## 🎯 Funcionalidades Implementadas

1. ✅ Sistema de UI para selección (botón Confirmar)
2. ✅ Sistema de persistencia JSON
3. ✅ Temporizador global
4. ✅ Lógica de congelamiento
5. ✅ Sistema de personalización (temas, colores, fondos)
6. ✅ Modo individual y multijugador
7. ✅ Chat mediante HTTP polling
8. ✅ Pantalla de fin de juego con botón de regresar al lobby
9. ✅ Botón de confirmación de palabras

---

## 🎯 Próximos Pasos (Por Implementar)

1. Implementar generación de palabras con IA
2. Mejorar animaciones de feedback visual
3. Añadir más estadísticas al final del juego (tiempo promedio de reacción, precisión)
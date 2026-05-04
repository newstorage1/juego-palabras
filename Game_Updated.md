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

---

### **4. Temporizador y Condición de Victoria**

#### Temporizador Global:
- Tiempo límite por partida (configurable: 10, 15, 20 minutos)
- Se muestra en el scoreboard como "Tiempo: 15:00"
- Al llegar a 0, se finaliza la partida automáticamente

#### Condición de Victoria:
- **Objetivo**: Encontrar el 51% de las palabras (ej. 26 de 50)
- **Empate**: Si ambos llegan al 51% al mismo tiempo, gana quien tenga más puntos
- **Puntos**: 
  - Palabras cortas (≤4 letras): 1 punto
  - Palabras medianas (5-7 letras): 2 puntos
  - Palabras largas (≥8 letras): 3 puntos

#### Penalización por Intentos Fallidos:
- 3 intentos incorrectos consecutivos → Congelamiento de 5 segundos
- El contador de intentos fallidos se resetea al encontrar una palabra correctamente

#### Final de Partida:
- Modal de "MVP" con estadísticas:
  - Palabra más larga encontrada
  - Tiempo promedio de reacción (segundos por palabra)
  - Precisión (palabras correctas / total de intentos)
  - Ganador con puntaje final

---

## 🏗️ Arquitectura Técnica Actualizada

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

### **1. Menú Principal (Lobby)**

- **Crear Partida**: Genera código único (ej. SOPA-X92)
- **Unirse a Partida**: Campo para introducir código
- **Perfil Rápido**: Selección de Avatar y Nickname
- **Selector de Dificultad**: Tamaño de cuadrícula y temática
- **Selector de Idioma**: Español o Inglés
- **Solicitar Temario con IA**: Botón para pedir palabras personalizadas

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
- Chat para comunicarse
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
    "timeLimitMinutes": 15
  },
  "timestamp": "2026-05-04T10:30:00Z",
  "gameState": "playing",
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

## 🎯 Próximos Pasos

1. Diseñar el sistema de UI para selección (arrastre y validación)
2. Implementar generación de palabras con IA
3. Crear sistema de persistencia JSON
4. Implementar temporizador global
5. Desarrollar lógica de congelamiento
6. Implementar sistema de personalización (temas, colores, fondos)
7. Implementar modo individual

---

¿Quieres que comience a implementar el demo inicial con estas características?
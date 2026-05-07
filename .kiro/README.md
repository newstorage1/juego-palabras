# Sopa de Letras Competitiva en Tiempo Real

Sistema de Sopa de Letras multijugador en tiempo real con soporte para IA, personalización completa y persistencia de partidas.

## 🚀 Características

### Modos de Juego
- **Juego Individual**: Un jugador contra el tiempo
- **Juego Multijugador**: Dos jugadores en competencia en tiempo real

### Personalización
- **Temas Visuales**: Clásico, Oscuro, Neón, Naturaleza, Océano
- **Avatar Personalizado**: Selección de emojis como avatar
- **Colores UI Personalizables**: Configura los colores del juego
- **Imagen de Fondo**: Opción para subir una imagen personalizada

### Generación de Palabras
- **Base de Datos Local**: Temas predefinidos en español e inglés
- **Asistencia con IA**: Generación de temarios personalizados
- **Filtros de Contenido**: Prohibido contenido sexual, violento y coloquial

### Sistema de Juego
- **Tablero Interactivo**: Selección por arrastre con 8 direcciones
- **Temporizador Global**: Contador regresivo visible para todos
- **Marcador en Vivo**: Puntos en tiempo real
- **Marquesina de Palabras**: Animación de palabras restantes
- **Chat en Tiempo Real**: Comunicación entre jugadores
- **Sistema de Congelamiento**: Penalización por intentos fallidos

### Persistencia
- **Guardado Automático**: Cada 30 segundos
- **Recuperación**: Al reiniciar el servidor
- **Formato JSON**: Fácil de leer y editar

## 📋 Requisitos

- Node.js (v16 o superior)
- npm (v8 o superior)
- uvx y uv (para servidores MCP si se usan)

## 🚀 Instalación y Ejecución

### Opción 1: Script de inicio rápido

```bash
./start.sh
```

### Opción 2: Manual

```bash
# Instalar dependencias del servidor
npm install

# Instalar dependencias del cliente
cd client && npm install

# Volver al directorio raíz
cd ..

# Crear directorio de partidas
mkdir -p saves

# Iniciar el servidor
npm start
```

### Opción 3: Modo desarrollo

```bash
npm run dev
```

## 🎮 Cómo Jugar

1. **Acceder al juego**: Abre tu navegador en `http://localhost:3000`

2. **Configurar perfil**:
   - Elige un nickname
   - Selecciona un avatar
   - Elige un tema visual
   - Selecciona el idioma

3. **Crear o unirse a partida**:
   - **Crear**: Genera un código único (ej. SOPA-X92)
   - **Unirse**: Introduce el código de un amigo

4. **Configurar partida**:
   - Selecciona dificultad (tamaño del tablero)
   - Elige un tema de palabras
   - Configura el tiempo límite

5. **Jugar**:
   - Arrastra sobre el tablero para seleccionar palabras
   - Las palabras se pueden seleccionar en 8 direcciones
   - Encuentra el 51% de las palabras para ganar
   - Usa el chat para comunicarte con tu rival

## 📊 Puntuación

- Palabras cortas (≤4 letras): 1 punto
- Palabras medianas (5-7 letras): 2 puntos
- Palabras largas (≥8 letras): 3 puntos

## 🛠️ Estructura del Proyecto

```
/sopa-pro-multiplayer
├── /client              # Aplicación React
│   ├── /public          # Archivos públicos
│   ├── /src             # Código fuente
│   │   ├── components   # Componentes React
│   │   ├── hooks        # Custom hooks
│   │   └── App.js       # Componente principal
│   └── package.json
├── /data                # Base de datos de palabras
│   ├── words_es.json    # Español
│   └── words_en.json    # Inglés
├── /server              # Servidor Node.js
│   ├── index.js         # Configuración principal
│   ├── gameLogic.js     # Lógica del juego
│   ├── socketHandlers.js # Manejo de sockets
│   ├── wordGenerator.js  # Generación de palabras
│   ├── persistence.js    # Persistencia JSON
│   └── validation.js     # Validación
├── /saves               # Partidas guardadas
├── package.json
└── README.md
```

## 🌐 API de Socket.io

### Eventos del Cliente al Servidor

- `createGame`: Crear una nueva partida
- `joinGame`: Unirse a una partida existente
- `startGame`: Iniciar la partida
- `selectWord`: Seleccionar una palabra en el tablero
- `generateWordsWithAI`: Generar palabras con IA
- `updateUserSettings`: Actualizar configuración del usuario
- `chatMessage`: Enviar mensaje al chat

### Eventos del Servidor al Cliente

- `playerJoined`: Jugador se ha unido
- `gameStarted`: Juego iniciado
- `wordFound`: Palabra encontrada
- `playerFrozen`: Jugador congelado
- `timerUpdate`: Actualización del temporizador
- `gameEnded`: Juego terminado
- `chatMessage`: Mensaje del chat

## 🎨 Temas Disponibles

1. **Clásico**: Colores suaves (azul/púrpura)
2. **Oscuro**: Modo oscuro para jugar en la noche
3. **Neón**: Colores brillantes estilo cyberpunk
4. **Naturaleza**: Colores verdes y naturales
5. **Océano**: Colores azules y turquesa

## 📝 Configuración Avanzada

### Configuración del Servidor

Edita `server/index.js` para cambiar:
- Puerto del servidor (por defecto: 3001)
- Tiempo límite por partida
- Tamaño máximo del tablero
- Número máximo de jugadores

### Configuración de la Base de Datos

Edita `data/words_es.json` o `data/words_en.json` para:
- Agregar nuevas palabras
- Crear nuevos temas
- Modificar palabras existentes

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

## 🙏 Agradecimientos

- Socket.io por el excelente framework de websockets
- React por el framework de UI
- Todos los contribuidores y usuarios

## 📞 Soporte

Para soporte, abre un issue en GitHub o contacta al equipo de desarrollo.

---

**Disfruta jugando Sopa Pro Multiplayer!** 🎮

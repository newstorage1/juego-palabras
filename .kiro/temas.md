# Sistema de Temas - V2

## Variables CSS

El sistema de temas usa variables CSS que se aplican según el atributo `data-theme` en el elemento `<html>`.

### Variables Base

```css
--v2-bg           /* Fondo principal de paneles */
--v2-bg-alt       /* Fondo alternativo (secondary) */
--v2-bg-input     /* Fondo para inputs */
--v2-text         /* Color de texto principal */
--v2-text-light   /* Color de texto secundario */
--v2-text-muted   /* Color de texto terciario */
--v2-primary      /* Color primario (gradientes, botones) */
--v2-secondary    /* Color secundario (gradientes) */
--v2-border       /* Color de bordes */
--v2-shadow       /* Sombras */
--v2-heading      /* Color para títulos */

/* Celdas del tablero */
--v2-cell-bg      /* Fondo de celda */
--v2-cell-text    /* Texto de celda */
--v2-cell-selected /* Celda seleccionada */
--v2-cell-found   /* Celda encontrada */

/* Botones */
--v2-btn-success  /* Botón verde (éxito) */
--v2-btn-success-hover
```

## Temas Disponibles

### 1. Clásico (default)
```css
--v2-bg: #ffffff
--v2-bg-alt: #f5f5f5
--v2-text: #333333
--v2-primary: #667eea
--v2-secondary: #764ba2
--v2-chat-system-bg: #e8eaff
```

### 2. Oscuro (dark)
```css
--v2-bg: #1a202c
--v2-bg-alt: #2d3748
--v2-text: #f7fafc
--v2-primary: #4a5568
--v2-secondary: #2d3748
--v2-heading: #ffffff
--v2-chat-system-bg: #4a5568
--v2-cell-bg: #2d3748
--v2-cell-text: #f7fafc
--v2-cell-selected: #667eea
--v2-cell-found: #48bb78
```

### 3. Neón (neon)
```css
--v2-bg: #000000
--v2-bg-alt: #1a001a
--v2-text: #ffffff
--v2-primary: #ff00ff
--v2-secondary: #00ffff
--v2-heading: #00ffff
--v2-chat-system-bg: #330033
--v2-cell-bg: #1a001a
--v2-cell-text: #00ffff
--v2-cell-selected: #ff00ff
--v2-cell-found: #00ff00
```

### 4. Naturaleza (nature)
```css
--v2-bg: #f0fff0
--v2-bg-alt: #c6f6d5
--v2-text: #1a1a1a
--v2-primary: #228b22
--v2-secondary: #32cd32
--v2-chat-system-bg: #c6f6d5
--v2-cell-bg: #ffffff
--v2-cell-text: #228b22
--v2-cell-selected: #32cd32
--v2-cell-found: #006400
```

### 5. Océano (ocean)
```css
--v2-bg: #e0f7ff
--v2-bg-alt: #b3e5fc
--v2-text: #003366
--v2-primary: #006994
--v2-secondary: #00bfff
--v2-chat-system-bg: #b3e5fc
--v2-cell-bg: #ffffff
--v2-cell-text: #006994
--v2-cell-selected: #00bfff
--v2-cell-found: #004466
```

## Cómo Aplicar un Tema

```javascript
// En V2App.jsx
useEffect(() => {
  if (userData?.theme) {
    document.documentElement.setAttribute('data-theme', userData.theme);
  }
}, [userData?.theme]);

// Para cambiar tema
const handleUpdateTheme = (theme) => {
  const updated = { ...userData, theme };
  setUserData(updated);
  localStorage.setItem('v2_userData', JSON.stringify(updated));
  document.documentElement.setAttribute('data-theme', theme);
};
```

## Clases Reutilizables

| Clase | Descripción |
|-------|-------------|
| `.v2-panel` | Panel base con fondo y sombra |
| `.v2-panel-title` | Título de panel (usa --v2-heading) |
| `.v2-text` | Texto principal |
| `.v2-text-light` | Texto secundario |
| `.v2-text-muted` | Texto terciario |
| `.v2-btn-primary` | Botón primario con gradiente |
| `.v2-btn-secondary` | Botón secundario |
| `.v2-btn-success` | Botón verde (éxito) |
| `.v2-input` | Campo de entrada |

## Notas de Implementación

- Los títulos de paneles (Marcador, Palabras, Chat) usan `--v2-heading` para garantizar legibilidad
- El tema oscuro tiene texto blanco en `.v2-mode` gracias a: `[data-theme="dark"] .v2-mode { color: #ffffff; }`
- Las celdas del tablero tienen colores específicos por tema para garantizar contraste letra/fondo
- El botón "Regresar al Lobby" usa `--v2-btn-success` para consistencia

## Estructura - Pantalla de Juego (GameScreen V2)

### HTML

```html
<!-- Contenedor principal -->
<div class="v2-game-screen">
  <!-- Header con título, código, avatar y botón -->
  <div class="game-header-v2">
    <h1>🎮 Sopa de Letras</h1>
    <div class="game-header-right">
      <span class="game-code-header">Código: {gameId}</span>
      <div class="game-user-info">
        <span class="game-avatar">{avatar}</span>
        <span class="game-nickname">{nickname}</span>
      </div>
      <button class="game-btn-back">← Regresar al Lobby</button>
    </div>
  </div>

  <!-- Contenido centrado con max-width -->
  <div class="game-screen-content">
    <div class="game-container-v2">
      <!-- Layout a dos columnas -->
      <div class="game-layout-v2">
        <!-- Sidebar (izquierda) -->
        <div class="game-sidebar-v2">
          <div class="scoreboard-v2">...</div>
          <div class="timer-display-v2">...</div>
          <div class="word-marquee-v2">...</div>
          <div class="chat-container-v2">...</div>
        </div>

        <!-- Board (derecha) -->
        <div class="board-container-v2">
          <div class="board-v2">...</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### CSS Requerido

```css
/* Contenedor principal */
.v2-game-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--v2-primary) 0%, var(--v2-secondary) 100%);
}

.game-screen-content {
  flex: 1;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Layout a dos columnas */
.game-layout-v2 {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.game-container-v2 {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* Sidebar */
.game-sidebar-v2 {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Board */
.board-container-v2 {
  flex: 2;
  min-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Header */
.game-header-v2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--v2-primary) 0%, var(--v2-secondary) 100%);
  padding: 1rem 1.5rem;
}

.game-header-v2 h1 {
  color: #ffffff;
  font-size: 1.5rem;
}

.game-header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.game-code-header {
  color: #ffffff;
  font-weight: 600;
}

.game-user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.game-nickname {
  color: #ffffff;
  font-weight: 600;
}

.game-btn-back {
  padding: 0.5rem 1rem;
  background: var(--v2-btn-success);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
```

### Notas

- El layout usa flexbox con `justify-content: center` para centrar el contenido
- `game-layout-v2` es el contenedor clave que pone sidebar a la izquierda y board a la derecha
- El header usa gradiente del tema (`--v2-primary` a `--v2-secondary`)
- Los elementos del header (código, avatar, nickname, botón) se estilizan con colores claros sobre fondo oscuro

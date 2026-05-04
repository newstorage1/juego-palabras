// Configuración por defecto del juego
export const defaultSettings = {
  nickname: 'Jugador',
  avatar: 'default',
  theme: 'default',
  backgroundImage: null,
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb'
  },
  gridSize: 15,
  language: 'es',
  timeLimitMinutes: 15,
  mode: 'solo' // 'solo' o 'multiplayer'
};

// Validar configuración
export const validateSettings = (settings) => {
  const errors = [];
  
  if (!settings.nickname || settings.nickname.length < 2 || settings.nickname.length > 20) {
    errors.push('El nickname debe tener entre 2 y 20 caracteres');
  }
  
  if (!['default', 'dark', 'neon', 'nature', 'ocean', 'sunset', 'forest', 'midnight'].includes(settings.theme)) {
    errors.push('Tema inválido');
  }
  
  if (!['es', 'en'].includes(settings.language)) {
    errors.push('Idioma inválido');
  }
  
  if (settings.gridSize < 10 || settings.gridSize > 25) {
    errors.push('El tamaño del tablero debe estar entre 10 y 25');
  }
  
  if (settings.timeLimitMinutes < 1 || settings.timeLimitMinutes > 60) {
    errors.push('El tiempo debe estar entre 1 y 60 minutos');
  }
  
  if (!['solo', 'multiplayer'].includes(settings.mode)) {
    errors.push('Modo de juego inválido');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Guardar configuración en localStorage
export const saveSettings = (settings) => {
  try {
    localStorage.setItem('sopaProSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error guardando configuración:', error);
    return false;
  }
};

// Cargar configuración desde localStorage
export const loadSettings = () => {
  try {
    const saved = localStorage.getItem('sopaProSettings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error cargando configuración:', error);
    return defaultSettings;
  }
};

// Limpiar configuración
export const clearSettings = () => {
  try {
    localStorage.removeItem('sopaProSettings');
    return true;
  } catch (error) {
    console.error('Error limpiando configuración:', error);
    return false;
  }
};

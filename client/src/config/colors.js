// Configuración de colores personalizables
export const colorPresets = {
  default: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    text: '#333333',
    bg: '#ffffff',
    board: '#f8f9fa',
    cellHover: '#e9ecef',
    cellSelected: '#667eea',
    cellFound: '#28a745'
  },
  dark: {
    primary: '#4a5568',
    secondary: '#2d3748',
    accent: '#4fd1c5',
    text: '#f7fafc',
    bg: '#1a202c',
    board: '#2d3748',
    cellHover: '#4a5568',
    cellSelected: '#667eea',
    cellFound: '#48bb78'
  },
  neon: {
    primary: '#ff00ff',
    secondary: '#00ffff',
    accent: '#ffff00',
    text: '#ffffff',
    bg: '#000000',
    board: '#1a001a',
    cellHover: '#330033',
    cellSelected: '#ff00ff',
    cellFound: '#00ff00'
  },
  nature: {
    primary: '#228b22',
    secondary: '#32cd32',
    accent: '#90ee90',
    text: '#2f4f4f',
    bg: '#f0fff0',
    board: '#e8f5e9',
    cellHover: '#c8e6c9',
    cellSelected: '#4caf50',
    cellFound: '#8bc34a'
  },
  ocean: {
    primary: '#006994',
    secondary: '#00bfff',
    accent: '#87cefa',
    text: '#003366',
    bg: '#f0f8ff',
    board: '#e6f7ff',
    cellHover: '#b3e5fc',
    cellSelected: '#007bff',
    cellFound: '#20c997'
  },
  sunset: {
    primary: '#ff6b35',
    secondary: '#f7b731',
    accent: '#ff9a3d',
    text: '#4a3b2a',
    bg: '#fff5e6',
    board: '#fff0e0',
    cellHover: '#ffe0b2',
    cellSelected: '#ff8a65',
    cellFound: '#ffca28'
  },
  forest: {
    primary: '#1b5e20',
    secondary: '#388e3c',
    accent: '#66bb6a',
    text: '#1b5e20',
    bg: '#e8f5e9',
    board: '#c8e6c9',
    cellHover: '#a5d6a7',
    cellSelected: '#4caf50',
    cellFound: '#8bc34a'
  },
  midnight: {
    primary: '#1a237e',
    secondary: '#303f9f',
    accent: '#536dfe',
    text: '#ffffff',
    bg: '#0d1b2a',
    board: '#1b263b',
    cellHover: '#415a77',
    cellSelected: '#778da9',
    cellFound: '#90be6d'
  }
};

// Función para obtener colores por tema
export const getColors = (themeName) => {
  return colorPresets[themeName] || colorPresets.default;
};

// Función para generar colores aleatorios
export const getRandomColors = () => {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#ff6b35', '#f7b731',
    '#006994', '#00bfff', '#87cefa', '#228b22', '#32cd32',
    '#90ee90', '#1b5e20', '#388e3c', '#66bb6a', '#1a237e',
    '#303f9f', '#536dfe', '#ff00ff', '#00ffff', '#ffff00'
  ];
  
  return {
    primary: colors[Math.floor(Math.random() * colors.length)],
    secondary: colors[Math.floor(Math.random() * colors.length)],
    accent: colors[Math.floor(Math.random() * colors.length)]
  };
};

// Función para validar color hex
export const isValidHex = (color) => {
  const regex = /^#([0-9A-F]{3}){1,2}$/i;
  return regex.test(color);
};

// Función para convertir color a rgba
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

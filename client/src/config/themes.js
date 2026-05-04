// Configuración de temas personalizables
export const themes = {
  default: {
    name: 'default',
    label: 'Clásico',
    colors: {
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
    backgroundImage: null
  },
  dark: {
    name: 'dark',
    label: 'Oscuro',
    colors: {
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
    backgroundImage: null
  },
  neon: {
    name: 'neon',
    label: 'Neón',
    colors: {
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
    backgroundImage: null
  },
  nature: {
    name: 'nature',
    label: 'Naturaleza',
    colors: {
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
    backgroundImage: null
  },
  ocean: {
    name: 'ocean',
    label: 'Océano',
    colors: {
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
    backgroundImage: null
  },
  sunset: {
    name: 'sunset',
    label: 'Atardecer',
    colors: {
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
    backgroundImage: null
  },
  forest: {
    name: 'forest',
    label: 'Bosque',
    colors: {
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
    backgroundImage: null
  },
  midnight: {
    name: 'midnight',
    label: 'Medianoche',
    colors: {
      primary: '#1a237e',
      secondary: '#303f9f',
      accent: '#536dfe',
      text: '#ffffff',
      bg: '#0d1b2a',
      board: '#1b263b',
      cellHover: '#415a77',
      cellSelected: '#778da9',
      cellFound: '#90be6d'
    },
    backgroundImage: null
  }
};

// Temas por defecto
export const defaultTheme = themes.default;

// Función para obtener un tema por nombre
export const getTheme = (themeName) => {
  return themes[themeName] || defaultTheme;
};

// Función para obtener todos los temas
export const getAllThemes = () => {
  return Object.values(themes);
};

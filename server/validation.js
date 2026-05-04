// Validar contenido de palabras
function validateContent(word) {
  // Palabras prohibidas (contenido sexual, violento y coloquial)
  const prohibited = [
    // Español
    'PUTA', 'PUTO', 'MIERDA', 'CAGADA', 'CULO', 'PENE', 'VAGINA', 'FOLLAR', 'CUNA', 'PITO',
    'PEDO', 'FREGAR', 'JODER', 'CABRÓN', 'CACHON', 'MAMÁ', 'PAPÁ', 'COJONES', 'HUEVOS', 'PERRA',
    'PERRO', 'PUTEZ', 'PUTERÍA', 'MILAGRO', 'CHINGAR', 'GUEY', 'WUEY', 'BOLA', 'HUEVADA',
    // Inglés
    'PUT', 'FUCK', 'SHIT', 'DICK', 'COCK', 'PENIS', 'VAGINA', 'CUNT', 'SLUT', 'WHORE',
    'BITCH', 'ASS', 'DUMB', 'STUPID', 'IDIOT', 'RETARD', 'NIGGER', 'KIKE', 'CHINK', 'PISS',
    'POOP', 'FART', 'WANK', 'JACKASS', 'DUMBASS', 'BITCH', 'SLUT', 'WHORE', 'BULLSHIT'
  ];
  
  const upperWord = word.toUpperCase();
  
  // Verificar si contiene palabras prohibidas
  for (const prov of prohibited) {
    if (upperWord.includes(prov)) {
      return false;
    }
  }
  
  // Verificar longitud mínima y máxima
  if (word.length < 2 || word.length > 15) {
    return false;
  }
  
  // Verificar que solo contenga letras
  if (!/^[A-ZÑ]+$/i.test(word)) {
    return false;
  }
  
  return true;
}

// Validar selección del tablero
function validateSelection(grid, coordinates) {
  if (coordinates.length < 2) {
    return { valid: false, reason: 'Muy corta' };
  }
  
  // Verificar si las coordenadas forman una línea recta
  if (!isValidLine(coordinates)) {
    return { valid: false, reason: 'No es una línea recta' };
  }
  
  // Verificar que no se repitan celdas
  const uniqueCells = new Set(coordinates.map(c => `${c[0]},${c[1]}`));
  if (uniqueCells.size !== coordinates.length) {
    return { valid: false, reason: 'Celdas repetidas' };
  }
  
  return { valid: true };
}

function isValidLine(coordinates) {
  if (coordinates.length < 2) return true;
  
  const rowDiffs = [];
  const colDiffs = [];
  
  for (let i = 1; i < coordinates.length; i++) {
    const rowDiff = coordinates[i][0] - coordinates[i - 1][0];
    const colDiff = coordinates[i][1] - coordinates[i - 1][1];
    
    rowDiffs.push(rowDiff);
    colDiffs.push(colDiff);
  }
  
  // Verificar que todas las diferencias sean iguales
  const firstRowDiff = rowDiffs[0];
  const firstColDiff = colDiffs[0];
  
  // Verificar que sea una dirección válida (horizontal, vertical o diagonal)
  const validDirections = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];
  
  const isValidDirection = validDirections.some(([dr, dc]) => 
    dr === firstRowDiff && dc === firstColDiff
  );
  
  if (!isValidDirection) {
    return false;
  }
  
  // Verificar que todas las diferencias sean iguales
  return rowDiffs.every(d => d === firstRowDiff) && 
         colDiffs.every(d => d === firstColDiff);
}

// Validar que una palabra no sea subcadena de otra
function validateNoSubstrings(words) {
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  
  for (let i = 0; i < sortedWords.length; i++) {
    for (let j = i + 1; j < sortedWords.length; j++) {
      if (sortedWords[i].includes(sortedWords[j])) {
        return false;
      }
    }
  }
  
  return true;
}

// Validar configuración del usuario
function validateUserSettings(settings) {
  const errors = [];
  
  if (!settings.nickname || settings.nickname.length < 2 || settings.nickname.length > 20) {
    errors.push('El nickname debe tener entre 2 y 20 caracteres');
  }
  
  if (!settings.avatar) {
    errors.push('Se requiere un avatar');
  }
  
  if (!['default', 'dark', 'neon', 'nature', 'ocean', 'sunset', 'forest', 'midnight'].includes(settings.theme)) {
    errors.push('Tema inválido');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validar código de partida
function validateGameCode(code) {
  // Formato: SOPA-XXX
  const regex = /^SOPA-[A-Z0-9]{3}$/;
  return regex.test(code.toUpperCase());
}

module.exports = {
  validateContent,
  validateSelection,
  validateNoSubstrings,
  validateUserSettings,
  validateGameCode
};

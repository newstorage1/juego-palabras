// Generar matriz de sopa de letras
function generateWordSearch(words, gridSize = 15) {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const placedWords = [];
  
  // Ordenar palabras por longitud (de mayor a menor)
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  
  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
      const direction = Math.floor(Math.random() * 8);
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      
      if (canPlaceWord(grid, word, row, col, direction, gridSize)) {
        placeWord(grid, word, row, col, direction);
        placedWords.push({
          word,
          coordinates: getWordCoordinates(word, row, col, direction)
        });
        placed = true;
      }
      attempts++;
    }
  }
  
  // Rellenar espacios vacíos con letras aleatorias
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
    }
  }
  
  return { grid, placedWords };
}

function canPlaceWord(grid, word, row, col, direction, gridSize) {
  const directions = [
    [0, 1],   // Horizontal derecha
    [0, -1],  // Horizontal izquierda
    [1, 0],   // Vertical abajo
    [-1, 0],  // Vertical arriba
    [1, 1],   // Diagonal abajo-derecha
    [1, -1],  // Diagonal abajo-izquierda
    [-1, 1],  // Diagonal arriba-derecha
    [-1, -1]  // Diagonal arriba-izquierda
  ];
  
  const [dr, dc] = directions[direction];
  
  for (let i = 0; i < word.length; i++) {
    const newRow = row + dr * i;
    const newCol = col + dc * i;
    
    if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) {
      return false;
    }
    
    if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
      return false;
    }
  }
  
  return true;
}

function placeWord(grid, word, row, col, direction) {
  const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];
  
  const [dr, dc] = directions[direction];
  
  for (let i = 0; i < word.length; i++) {
    grid[row + dr * i][col + dc * i] = word[i];
  }
}

function getWordCoordinates(word, row, col, direction) {
  const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];
  
  const [dr, dc] = directions[direction];
  const coordinates = [];
  
  for (let i = 0; i < word.length; i++) {
    coordinates.push([row + dr * i, col + dc * i]);
  }
  
  return coordinates;
}

// Validar selección de palabra
function validateSelection(grid, coordinates, words) {
  // Construir palabra desde coordenadas
  const word = coordinates.map(([row, col]) => grid[row][col]).join('');
  
  // Verificar si la palabra existe en la lista
  const foundWord = words.find(w => w.word === word && !w.foundBy);
  
  return {
    valid: !!foundWord,
    word: foundWord ? foundWord.word : word,
    points: calculatePoints(word)
  };
}

// Calcular puntos
function calculatePoints(word) {
  if (word.length >= 8) return 3;
  if (word.length >= 5) return 2;
  return 1;
}

// Verificar condición de victoria
function checkWinCondition(words, minPercentage = 0.51) {
  const totalWords = words.length;
  const foundWords = words.filter(w => w.foundBy).length;
  
  return {
    win: foundWords >= Math.ceil(totalWords * minPercentage),
    found: foundWords,
    total: totalWords,
    percentage: (foundWords / totalWords) * 100
  };
}

// Calcular estadísticas del juego
function calculateStats(gameData) {
  const { players, words } = gameData;
  
  // Jugador ganador
  let winner = null;
  if (players.length > 0) {
    winner = players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );
  }
  
  // Palabra más larga encontrada
  const longestWord = words.reduce((longest, word) => {
    if (word.foundBy && word.word.length > (longest?.length || 0)) {
      return word.word;
    }
    return longest;
  }, null);
  
  // Total de palabras encontradas
  const totalFound = words.filter(w => w.foundBy).length;
  
  return {
    winner: winner ? {
      nickname: winner.nickname,
      score: winner.score
    } : null,
    longestWord,
    totalFound,
    totalWords: words.length,
    players: players.map(p => ({
      nickname: p.nickname,
      score: p.score,
      foundWords: p.foundWords.length
    }))
  };
}

module.exports = {
  generateWordSearch,
  validateSelection,
  calculatePoints,
  checkWinCondition,
  calculateStats
};

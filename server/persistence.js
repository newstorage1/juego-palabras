const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.join(__dirname, '../saves');

// Crear directorio si no existe
if (!fs.existsSync(GAMES_DIR)) {
  fs.mkdirSync(GAMES_DIR);
}

// Guardar partida
function saveGame(gameId, gameData) {
  const filePath = path.join(GAMES_DIR, `${gameId}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(gameData, null, 2));
    return true;
  } catch (error) {
    console.error(`Error guardando partida ${gameId}:`, error);
    return false;
  }
}

// Cargar partida
function loadGame(gameId) {
  const filePath = path.join(GAMES_DIR, `${gameId}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data;
    }
    return null;
  } catch (error) {
    console.error(`Error cargando partida ${gameId}:`, error);
    return null;
  }
}

// Eliminar partida
function deleteGame(gameId) {
  const filePath = path.join(GAMES_DIR, `${gameId}.json`);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error eliminando partida ${gameId}:`, error);
    return false;
  }
}

// Listar partidas guardadas
function listSavedGames() {
  try {
    if (!fs.existsSync(GAMES_DIR)) {
      return [];
    }
    
    const files = fs.readdirSync(GAMES_DIR);
    const games = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const gameId = file.replace('.json', '');
        const data = JSON.parse(fs.readFileSync(path.join(GAMES_DIR, file), 'utf8'));
        return {
          gameId,
          timestamp: data.timestamp,
          players: data.players?.length || 0,
          gameState: data.gameState
        };
      });
    
    return games;
  } catch (error) {
    console.error('Error listando partidas:', error);
    return [];
  }
}

// Verificar si una partida existe
function gameExists(gameId) {
  const filePath = path.join(GAMES_DIR, `${gameId}.json`);
  return fs.existsSync(filePath);
}

module.exports = {
  saveGame,
  loadGame,
  deleteGame,
  listSavedGames,
  gameExists,
  GAMES_DIR
};

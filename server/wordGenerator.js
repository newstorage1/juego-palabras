const fs = require('fs');
const path = require('path');

// Cargar palabras desde archivos JSON
function loadWordsFromFiles() {
  const words = {
    es: {
      animales: [],
      tecnologia: [],
      deportes: [],
      paises: [],
      colores: [],
      frutas: [],
      vegetales: []
    },
    en: {
      animals: [],
      technology: [],
      sports: [],
      countries: [],
      colors: [],
      fruits: [],
      vegetables: []
    }
  };

  try {
    // Cargar español
    const wordsEsPath = path.join(__dirname, '../data/words_es.json');
    if (fs.existsSync(wordsEsPath)) {
      const data = JSON.parse(fs.readFileSync(wordsEsPath, 'utf8'));
      words.es.animales = data.temas.animales || [];
      words.es.tecnologia = data.temas.tecnologia || [];
      words.es.deportes = data.temas.deportes || [];
      words.es.paises = data.temas.países || [];
      words.es.colores = data.temas.colores || [];
      words.es.frutas = data.temas.frutas || [];
      words.es.vegetales = data.temas.vegetales || [];
    }

    // Cargar inglés
    const wordsEnPath = path.join(__dirname, '../data/words_en.json');
    if (fs.existsSync(wordsEnPath)) {
      const data = JSON.parse(fs.readFileSync(wordsEnPath, 'utf8'));
      words.en.animals = data.themes.animals || [];
      words.en.technology = data.themes.technology || [];
      words.en.sports = data.themes.sports || [];
      words.en.countries = data.themes.countries || [];
      words.en.colors = data.themes.colors || [];
      words.en.fruits = data.themes.fruits || [];
      words.en.vegetables = data.themes.vegetables || [];
    }
  } catch (error) {
    console.error('Error cargando palabras:', error);
  }

  return words;
}

// Generar palabras con IA (simulación)
function generateWordsWithAI(topic, language, count = 20) {
  const wordData = loadWordsFromFiles();
  
  // Mapeo de temas
  const themeMapping = {
    es: {
      animales: 'animales',
      animalesraros: 'animales',
      animalesexóticos: 'animales',
      tecnologia: 'tecnologia',
      deportes: 'deportes',
      paises: 'paises',
      colores: 'colores',
      frutas: 'frutas',
      vegetales: 'vegetales'
    },
    en: {
      animals: 'animals',
      rareanimals: 'animals',
      exoticanimals: 'animals',
      technology: 'technology',
      sports: 'sports',
      countries: 'countries',
      colors: 'colors',
      fruits: 'fruits',
      vegetables: 'vegetables'
    }
  };

  const themeKey = themeMapping[language]?.[topic.toLowerCase()] || 'technology';
  const availableWords = wordData[language]?.[themeKey] || wordData.en.technology;

  // Seleccionar palabras al azar
  const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, count);

  // Validar contenido (filtrado básico)
  const filteredWords = selectedWords.filter(word => {
    // Palabras prohibidas (ejemplo)
    const prohibited = ['PUTA', 'PUTO', 'MIERDA', 'CAGADA', 'CULO', 'PENE', 'VAGINA', 'FUCK', 'SHIT', 'DICK'];
    return !prohibited.some(prov => word.includes(prov));
  });

  return filteredWords;
}

// Generar palabras por defecto
function generateDefaultWords(language, count = 20) {
  const wordData = loadWordsFromFiles();
  const themeKey = language === 'es' ? 'tecnologia' : 'technology';
  const availableWords = wordData[language]?.[themeKey] || wordData.en.technology;

  const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Validar palabra
function validateWord(word, language) {
  const wordData = loadWordsFromFiles();
  
  // Buscar en todos los temas
  const allWords = Object.values(wordData[language] || wordData.en).flat();
  
  return allWords.includes(word.toUpperCase());
}

// Obtener temas disponibles
function getAvailableThemes(language) {
  const wordData = loadWordsFromFiles();
  
  if (language === 'es') {
    return Object.keys(wordData.es);
  } else {
    return Object.keys(wordData.en).map(k => {
      const mapping = {
        animals: 'animals',
        technology: 'technology',
        sports: 'sports',
        countries: 'countries',
        colors: 'colors',
        fruits: 'fruits',
        vegetables: 'vegetables'
      };
      return mapping[k] || k;
    });
  }
}

module.exports = {
  loadWordsFromFiles,
  generateWordsWithAI,
  generateDefaultWords,
  validateWord,
  getAvailableThemes
};

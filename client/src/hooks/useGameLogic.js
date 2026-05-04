import { useState, useCallback } from 'react';

export function useGameLogic() {
  const [selectedCells, setSelectedCells] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [foundWords, setFoundWords] = useState([]);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [frozenTime, setFrozenTime] = useState(0);

  // Manejar selección de celda
  const handleCellClick = useCallback((row, col, letter) => {
    if (frozen) return;

    const cell = { row, col, letter };
    
    if (selectedCells.length === 0) {
      setSelectedCells([cell]);
      setCurrentWord(letter);
    } else {
      const lastCell = selectedCells[selectedCells.length - 1];
      const rowDiff = row - lastCell.row;
      const colDiff = col - lastCell.col;
      
      // Verificar si es una dirección válida
      const validDirections = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ];
      
      if (validDirections.some(([dr, dc]) => dr === rowDiff && dc === colDiff)) {
        setSelectedCells([...selectedCells, cell]);
        setCurrentWord(currentWord + letter);
      }
    }
  }, [selectedCells, currentWord, frozen]);

  // Confirmar selección
  const confirmSelection = useCallback((word, onValid, onInvalid) => {
    if (currentWord.length < 2) {
      setSelectedCells([]);
      setCurrentWord('');
      return;
    }

    if (foundWords.includes(word)) {
      // Palabra ya encontrada
      setConsecutiveFailures(prev => prev + 1);
      if (consecutiveFailures >= 2) {
        setFrozen(true);
        setFrozenTime(5);
        setConsecutiveFailures(0);
      }
      onInvalid(word);
      setSelectedCells([]);
      setCurrentWord('');
      return;
    }

    onValid(word);
    setFoundWords(prev => [...prev, word]);
    setSelectedCells([]);
    setCurrentWord('');
    setConsecutiveFailures(0);
  }, [currentWord, foundWords, consecutiveFailures, frozen]);

  // Temporizador de congelamiento
  React.useEffect(() => {
    if (frozen) {
      const interval = setInterval(() => {
        setFrozenTime(prev => {
          if (prev <= 1) {
            setFrozen(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [frozen]);

  // Resetear selección
  const resetSelection = useCallback(() => {
    setSelectedCells([]);
    setCurrentWord('');
  }, []);

  return {
    selectedCells,
    currentWord,
    foundWords,
    consecutiveFailures,
    frozen,
    frozenTime,
    handleCellClick,
    confirmSelection,
    resetSelection
  };
}

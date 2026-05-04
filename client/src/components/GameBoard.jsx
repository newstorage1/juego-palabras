import React from 'react';

function GameBoard({ grid, selectedCells, foundWords, onCellClick }) {
  return (
    <div className="board-container">
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${grid.length}, 1fr)`
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedCells.some(
              c => c.row === rowIndex && c.col === colIndex
            );
            const isFound = foundWords.some(
              w => w.coordinates.some(
                coord => coord[0] === rowIndex && coord[1] === colIndex
              )
            );

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${isSelected ? 'selected' : ''} ${isFound ? 'found' : ''}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {cell}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default GameBoard;

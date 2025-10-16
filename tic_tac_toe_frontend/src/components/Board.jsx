import React from 'react';
import Cell from './Cell';

/**
 * PUBLIC_INTERFACE
 * Board component renders a 3x3 grid for Tic Tac Toe.
 * Provides ARIA roles for accessibility and forwards cell interactions to parent.
 *
 * Props:
 * - board: Array(9) with values 'X' | 'O' | null
 * - onCellSelect: function(index: number) => void, invoked when a cell is activated
 * - isGameOver: boolean, disables interactions when true
 */
function Board({ board, onCellSelect, isGameOver }) {
  return (
    <div
      className="ttt-board"
      role="grid"
      aria-label="Tic Tac Toe board"
      aria-disabled={isGameOver ? 'true' : 'false'}
    >
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          onSelect={() => onCellSelect(index)}
          disabled={isGameOver || value !== null}
        />
      ))}
    </div>
  );
}

export default Board;

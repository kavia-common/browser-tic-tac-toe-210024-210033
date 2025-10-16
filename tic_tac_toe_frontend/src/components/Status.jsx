import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Status displays the current game state and announces changes for screen readers.
 *
 * Props:
 * - currentPlayer: 'X' | 'O'
 * - winner: 'X' | 'O' | null
 * - isDraw: boolean
 */
function Status({ currentPlayer, winner, isDraw }) {
  let message = `Current player: ${currentPlayer}`;
  if (winner) {
    message = `Winner: ${winner}`;
  } else if (isDraw) {
    message = 'Draw game';
  }

  return (
    <div className="ttt-status" aria-live="polite" role="status" data-testid="status">
      {message}
    </div>
  );
}

export default Status;

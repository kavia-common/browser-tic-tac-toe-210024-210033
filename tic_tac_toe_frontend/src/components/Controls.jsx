import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Controls provides UI actions like restarting the game.
 *
 * Props:
 * - onRestart: () => void
 * - disabled: boolean (optional) - disable controls if needed
 */
function Controls({ onRestart, disabled = false }) {
  return (
    <div className="ttt-controls">
      <button
        type="button"
        className="btn-restart"
        onClick={onRestart}
        disabled={disabled}
        aria-label="Restart game"
        data-testid="restart"
      >
        Restart
      </button>
    </div>
  );
}

export default Controls;

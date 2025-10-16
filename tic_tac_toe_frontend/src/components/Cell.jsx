import React, { useCallback } from 'react';

/**
 * PUBLIC_INTERFACE
 * Cell represents a single square in the Tic Tac Toe board.
 *
 * Props:
 * - index: number (0..8)
 * - value: 'X' | 'O' | null
 * - onSelect: () => void
 * - disabled: boolean
 */
function Cell({ index, value, onSelect, disabled }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;
      // Activate on Enter or Space for keyboard users
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    },
    [disabled, onSelect]
  );

  return (
    <button
      type="button"
      className={`ttt-cell ${value ? 'filled' : ''}`}
      role="gridcell"
      aria-label={`Cell ${index + 1}${value ? ` contains ${value}` : ' empty'}`}
      aria-disabled={disabled ? 'true' : 'false'}
      aria-pressed={value ? 'true' : 'false'}
      tabIndex={0}
      onClick={() => !disabled && onSelect()}
      onKeyDown={handleKeyDown}
      data-testid={`cell-${index}`}
    >
      {value || ''}
    </button>
  );
}

export default Cell;

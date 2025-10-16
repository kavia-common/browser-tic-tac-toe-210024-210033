import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

/**
 * Integration Test Suite for App, Board, Cell, Status, Controls
 *
 * Traceability:
 * - PRD REQ-001: Display a 3x3 grid (validated implicitly by 9 gridcells)
 * - PRD REQ-002: Track/display current player (status text updates)
 * - PRD REQ-003: Click empty cell to place X/O (user click/keyboard)
 * - PRD REQ-004: Prevent overwriting an occupied cell
 * - PRD REQ-005: Detect win and show winner; lock input
 * - PRD REQ-006: Detect draw and show draw; lock input
 * - PRD REQ-007: Restart resets game
 * - PRD REQ-008: Accessibility roles/aria-live; keyboard operable cells
 *
 * TRACEABILITY.md Test IDs:
 * - TC-001: Board renders 9 cells
 * - TC-002: Status shows current player
 * - TC-003: Clicking empty cell places mark
 * - TC-004: Clicking occupied cell has no effect
 * - TC-005: Win detection triggers status update
 * - TC-006: Draw detection triggers status update
 * - TC-007: Restart resets board and status
 * - TC-009: Accessibility attributes present on interactive controls
 */

function getCells() {
  // Prefer role-based query per a11y; cells are buttons with role="gridcell"
  const grid = screen.getByRole('grid', { name: /tic tac toe board/i });
  return within(grid).getAllByRole('gridcell');
}

describe('App integration: gameplay and accessibility', () => {
  test('REQ-001, REQ-002, REQ-003 (TC-001..TC-003): renders App and allows placing X then O with status updates', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Status shows current player X initially (REQ-002, TC-002)
    const status = screen.getByRole('status', { name: /current player|winner|draw/i });
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent(/Current player:\s*X/i);

    // Board renders 9 gridcells (REQ-001, TC-001)
    const cells = getCells();
    expect(cells).toHaveLength(9);

    // Click first cell -> X appears, status updates to O (REQ-003, TC-003)
    await user.click(cells[0]);
    expect(cells[0]).toHaveTextContent('X');
    expect(status).toHaveTextContent(/Current player:\s*O/i);

    // Click second cell -> O appears, status updates to X
    await user.click(cells[1]);
    expect(cells[1]).toHaveTextContent('O');
    expect(status).toHaveTextContent(/Current player:\s*X/i);
  });

  test('REQ-004 (TC-004): clicking an occupied cell does nothing', async () => {
    const user = userEvent.setup();
    render(<App />);

    const status = screen.getByRole('status');
    const cells = getCells();

    // First move X in cell 0
    await user.click(cells[0]);
    expect(cells[0]).toHaveTextContent('X');
    expect(status).toHaveTextContent(/Current player:\s*O/i);

    // Try to click occupied cell 0 again - should have no effect
    await user.click(cells[0]);
    // It remains 'X' and turn does not switch due to invalid move
    expect(cells[0]).toHaveTextContent('X');
    expect(status).toHaveTextContent(/Current player:\s*O/i);
  });

  test('REQ-005 (TC-005): simulate winning sequence; assert winner and lock input afterwards', async () => {
    const user = userEvent.setup();
    render(<App />);

    const status = screen.getByRole('status');
    const cells = getCells();

    // X wins on top row: cells [0,1,2]
    // Sequence: X(0), O(3), X(1), O(4), X(2)
    await user.click(cells[0]); // X
    await user.click(cells[3]); // O
    await user.click(cells[1]); // X
    await user.click(cells[4]); // O
    await user.click(cells[2]); // X -> win

    expect(status).toHaveTextContent(/Winner:\s*X/i);

    // After game over, further clicks should not change board (input locked)
    const snapshot = cells.map((c) => c.textContent);
    await user.click(cells[5]);
    const after = cells.map((c) => c.textContent);
    expect(after).toEqual(snapshot);
  });

  test('REQ-006 (TC-006): simulate a draw; assert draw status and input locked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const status = screen.getByRole('status');
    const cells = getCells();

    // Fill the board to a known draw (no winner):
    // X O X
    // X O O
    // O X X
    // Sequence of indices: 0,1,2,3,4,5,6,7,8
    // We must alternate to avoid wins; use a draw-safe sequence:
    // 0:X, 4:O, 8:X, 1:O, 2:X, 6:O, 3:X, 5:O, 7:X
    const seq = [0, 4, 8, 1, 2, 6, 3, 5, 7];
    for (const idx of seq) {
      await user.click(cells[idx]);
    }

    expect(status).toHaveTextContent(/Draw game/i);

    const snapshot = cells.map((c) => c.textContent);
    // Attempt another click after draw - should have no effect
    // Click on any cell (e.g., 0)
    await user.click(cells[0]);
    const after = cells.map((c) => c.textContent);
    expect(after).toEqual(snapshot);
  });

  test('REQ-007 (TC-007): Restart button resets board and status', async () => {
    const user = userEvent.setup();
    render(<App />);

    const status = screen.getByRole('status');
    const cells = getCells();

    // Make a couple of moves
    await user.click(cells[0]); // X
    await user.click(cells[1]); // O
    expect(cells[0]).toHaveTextContent('X');
    expect(cells[1]).toHaveTextContent('O');

    // Restart
    const restartBtn = screen.getByRole('button', { name: /restart game/i });
    await user.click(restartBtn);

    // All cells empty, status back to "Current player: X"
    cells.forEach((c) => expect(c).toHaveTextContent(''));
    expect(status).toHaveTextContent(/Current player:\s*X/i);
  });

  test('REQ-008 (TC-009): Keyboard interactions via Enter/Space operate cells; ARIA roles present, status uses aria-live', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Accessibility checks
    const grid = screen.getByRole('grid', { name: /tic tac toe board/i });
    expect(grid).toBeInTheDocument();

    const cells = getCells();
    expect(cells.every((c) => c.getAttribute('role') === 'gridcell')).toBe(true);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');

    // Keyboard: focus first cell and press Enter to place X
    cells[0].focus();
    await user.keyboard('{Enter}');
    expect(cells[0]).toHaveTextContent('X');
    expect(status).toHaveTextContent(/Current player:\s*O/i);

    // Move focus to second cell and press Space to place O
    cells[1].focus();
    await user.keyboard(' ');
    expect(cells[1]).toHaveTextContent('O');
    expect(status).toHaveTextContent(/Current player:\s*X/i);

    // Attempt keyboard activation on already filled cell should not change turn
    const currentStatusText = status.textContent;
    cells[1].focus();
    await user.keyboard('{Enter}');
    expect(status.textContent).toBe(currentStatusText);
  });
});

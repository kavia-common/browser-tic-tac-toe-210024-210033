//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement IDs: REQ-003, REQ-004, REQ-005, REQ-006
// User Story: As a player, I want the game to validate moves, detect wins/draws,
//             and apply moves immutably so that gameplay is correct and reliable.
// Acceptance Criteria:
//  - REQ-003: Place marks only in empty cells and within valid indices.
//  - REQ-004: Prevent overwriting an occupied cell.
//  - REQ-005: Detect wins across all rows, columns, and diagonals.
//  - REQ-006: Detect draw when board is full and no winner.
// GxP Impact: NO - Frontend-only local game logic (no persistence); still follows
//             coding/documentation best practices and validation controls.
// Risk Level: LOW
// Validation Protocol: Unit tests in src/game/logic.test.js
// ============================================================================

/**
 * All functions in this module are pure and operate on a board represented as:
 *   Array(9) of ('X' | 'O' | null)
 * No mutation is performed; new arrays are returned when needed.
 */

export const WIN_LINES = Object.freeze([
  [0, 1, 2], // row 1
  [3, 4, 5], // row 2
  [6, 7, 8], // row 3
  [0, 3, 6], // col 1
  [1, 4, 7], // col 2
  [2, 5, 8], // col 3
  [0, 4, 8], // diag
  [2, 4, 6], // anti-diag
]);

/**
 * INTERNAL: Safely clone a board (defensive copy).
 * @param {Array<('X'|'O'|null)>} board
 * @returns {Array<('X'|'O'|null)>}
 */
function cloneBoard(board) {
  return Array.isArray(board) ? [...board] : Array(9).fill(null);
}

// PUBLIC_INTERFACE
/**
 * Determine if a move is valid.
 * REQ-003: Only place marks in empty cells.
 * REQ-004: Prevent overwriting an occupied cell.
 *
 * @param {Array<('X'|'O'|null)>} board - Current board of length 9.
 * @param {number} index - Target cell index (0-8).
 * @param {boolean} gameOver - Whether the game has ended (winner or draw).
 * @returns {boolean} True if the move is valid.
 */
export function isValidMove(board, index, gameOver) {
  /** Ensure valid inputs and enforce business rules */
  if (!Array.isArray(board) || board.length !== 9) return false;
  if (typeof index !== 'number' || index < 0 || index > 8) return false;
  if (gameOver) return false;
  return board[index] == null;
}

// PUBLIC_INTERFACE
/**
 * Get the winner for the current board.
 * REQ-005: Detect win conditions across all 8 winning lines.
 *
 * @param {Array<('X'|'O'|null)>} board - Current board.
 * @returns {'X'|'O'|null} Winner symbol or null if no winner.
 */
export function getWinner(board) {
  if (!Array.isArray(board) || board.length !== 9) return null;
  for (const [a, b, c] of WIN_LINES) {
    const v = board[a];
    if (v && v === board[b] && v === board[c]) {
      return v;
    }
  }
  return null;
}

// PUBLIC_INTERFACE
/**
 * Determine if the board is a draw.
 * REQ-006: Draw occurs when no empty cells remain and there is no winner.
 *
 * @param {Array<('X'|'O'|null)>} board - Current board.
 * @returns {boolean} True if the board is a draw.
 */
export function isDraw(board) {
  if (!Array.isArray(board) || board.length !== 9) return false;
  if (getWinner(board)) return false;
  return board.every(cell => cell === 'X' || cell === 'O');
}

// PUBLIC_INTERFACE
/**
 * Apply a move and return a new board immutably.
 * REQ-003/REQ-004: Only apply if valid (empty, in range, not game over).
 * Additional rule: If invalid, return the original board unchanged.
 *
 * @param {Array<('X'|'O'|null)>} board - Current board.
 * @param {number} index - Target cell index (0-8).
 * @param {'X'|'O'} player - The player making the move.
 * @param {boolean} [gameOver=false] - Whether the game is already over; if true, ignore.
 * @returns {Array<('X'|'O'|null)>} New board if move applied; original board otherwise.
 */
export function applyMove(board, index, player, gameOver = false) {
  if (!Array.isArray(board) || board.length !== 9) return cloneBoard(board);
  if (player !== 'X' && player !== 'O') return cloneBoard(board);

  // guard against post-game moves and overwriting
  if (!isValidMove(board, index, gameOver)) {
    return board;
  }

  const next = cloneBoard(board);
  next[index] = player;
  return next;
}

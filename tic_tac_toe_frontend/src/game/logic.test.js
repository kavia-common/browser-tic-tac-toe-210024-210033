/**
 * Traceability Header
 * Tests mapped to PRD:
 *  - REQ-003: Place marks only in empty cells
 *  - REQ-004: Prevent overwriting an occupied cell
 *  - REQ-005: Detect all win conditions (8 lines)
 *  - REQ-006: Detect draw condition
 *
 * Additional behavior covered:
 *  - Prevent moves after game over (using isValidMove's gameOver param)
 *  - Immutability / pure-function behavior (applyMove does not mutate input)
 */

import { isValidMove, getWinner, isDraw, applyMove, WIN_LINES } from './logic';

function emptyBoard() {
  return Array(9).fill(null);
}

describe('TicTacToe Game Logic - Core (REQ-003..REQ-006)', () => {
  // REQ-003: valid moves only in empty cells and within range
  test('REQ-003: isValidMove allows placing mark in empty cell within index range', () => {
    const board = emptyBoard();
    expect(isValidMove(board, 0, false)).toBe(true);
    expect(isValidMove(board, 8, false)).toBe(true);
  });

  test('REQ-003: isValidMove rejects invalid indices', () => {
    const board = emptyBoard();
    expect(isValidMove(board, -1, false)).toBe(false);
    expect(isValidMove(board, 9, false)).toBe(false);
    expect(isValidMove(board, 100, false)).toBe(false);
  });

  // REQ-004: prevent overwriting occupied cell
  test('REQ-004: isValidMove returns false for occupied cell', () => {
    const board = emptyBoard();
    board[0] = 'X';
    expect(isValidMove(board, 0, false)).toBe(false);
  });

  test('Prevent moves after game over (using gameOver flag)', () => {
    const board = emptyBoard();
    expect(isValidMove(board, 1, true)).toBe(false);
  });

  // applyMove behavior
  test('applyMove places mark immutably when valid (REQ-003)', () => {
    const board = emptyBoard();
    const next = applyMove(board, 4, 'X', false);
    expect(next).not.toBe(board); // immutability
    expect(next[4]).toBe('X');
    // original board not mutated
    expect(board[4]).toBeNull();
  });

  test('applyMove returns original board when invalid (REQ-004 - occupied)', () => {
    const board = emptyBoard();
    const mid = applyMove(board, 4, 'X', false);
    const attemptOverwrite = applyMove(mid, 4, 'O', false);
    expect(attemptOverwrite).toBe(mid); // unchanged because invalid
    expect(mid[4]).toBe('X');
  });

  test('applyMove returns original board when gameOver=true', () => {
    const board = emptyBoard();
    const blocked = applyMove(board, 0, 'X', true);
    expect(blocked).toBe(board);
    expect(board[0]).toBeNull();
  });

  test('applyMove ignores invalid player tokens by returning a clone (defensive)', () => {
    const board = emptyBoard();
    const result = applyMove(board, 0, 'Z', false); // invalid token
    // It returns a clone (not the same reference), but content remains equal
    expect(result).not.toBe(board);
    expect(result).toEqual(board);
  });

  // REQ-005: detect all win lines
  describe('REQ-005: getWinner detects wins across all 8 lines', () => {
    const players = ['X', 'O'];

    WIN_LINES.forEach((line, idx) => {
      players.forEach((p) => {
        test(`Win line #${idx + 1} for ${p} -> cells [${line.join(', ')}]`, () => {
          const board = emptyBoard();
          line.forEach(i => { board[i] = p; });
          expect(getWinner(board)).toBe(p);
        });
      });
    });

    test('No winner when no line has three in a row', () => {
      const board = [
        'X', 'O', 'X',
        'X', 'O', null,
        null, null, 'O',
      ];
      expect(getWinner(board)).toBeNull();
    });
  });

  // REQ-006: draw detection
  test('REQ-006: isDraw true when board full and no winner', () => {
    // Full draw board example:
    // X O X
    // X O O
    // O X X
    const board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ];
    expect(getWinner(board)).toBeNull();
    expect(isDraw(board)).toBe(true);
  });

  test('REQ-006: isDraw false when spaces remain', () => {
    const board = [
      'X', 'O', 'X',
      'X', 'O', null,
      null, null, 'O',
    ];
    expect(isDraw(board)).toBe(false);
  });

  test('REQ-006: isDraw false when a winner exists even if board is full', () => {
    const board = [
      'X', 'X', 'X',
      'O', 'O', 'X',
      'O', 'X', 'O',
    ];
    expect(getWinner(board)).toBe('X');
    expect(isDraw(board)).toBe(false);
  });

  // Immutability and pure function checks
  test('Immutability: applyMove returns a new array and does not mutate input', () => {
    const board = emptyBoard();
    const next = applyMove(board, 2, 'O', false);
    expect(next).not.toBe(board);
    expect(board[2]).toBeNull();
    expect(next[2]).toBe('O');
  });

  test('Pure behavior: getWinner and isDraw do not mutate board', () => {
    const board = emptyBoard();
    board[0] = 'X';
    const snapshot = [...board];
    getWinner(board);
    isDraw(board);
    expect(board).toEqual(snapshot);
  });

  // Turn alternation assumptions note: The logic here does not enforce alternation;
  // it focuses on board state validation. Alternation would be enforced at a higher state layer.
});

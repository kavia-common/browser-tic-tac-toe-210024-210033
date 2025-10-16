import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Board from './components/Board';
import Status from './components/Status';
import Controls from './components/Controls';
import { applyMove, getWinner, isDraw, isValidMove } from './game/logic';

/**
 * Simple in-memory audit log stub for GxP alignment (frontend-only).
 * Captures timestamp, action, and before/after snapshots for moves and restart.
 * Not persisted; suitable for console inspection in development.
 */
const auditLog = [];

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);

  // Focus management reference (optional future enhancement)
  const lastMoveIndexRef = useRef(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Recompute winner/draw when board changes
  useEffect(() => {
    const w = getWinner(board);
    const d = !w && isDraw(board);
    setWinner(w);
    setDraw(Boolean(d));
  }, [board]);

  /**
   * PUBLIC_INTERFACE
   * toggleTheme
   * Toggle between light and dark themes.
   */
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  /**
   * PUBLIC_INTERFACE
   * handleCellSelect
   * Process a move: validate using isValidMove, apply move using applyMove, audit log, and swap turns.
   * Guards against moves on occupied cells or when game is over.
   */
  const handleCellSelect = (index) => {
    const gameOver = Boolean(winner) || draw;
    const before = { board: [...board], currentPlayer };

    if (!isValidMove(board, index, gameOver)) {
      // No-op for invalid attempts; optionally, we could log attempted invalid move in future.
      return;
    }

    const nextBoard = applyMove(board, index, currentPlayer, gameOver);
    if (nextBoard === board) {
      return; // applyMove indicates no change (defensive)
    }

    setBoard(nextBoard);
    lastMoveIndexRef.current = index;

    // Alternate player if game not over after the move
    const computedWinner = getWinner(nextBoard);
    const computedDraw = !computedWinner && isDraw(nextBoard);
    if (!computedWinner && !computedDraw) {
      setCurrentPlayer(prev => (prev === 'X' ? 'O' : 'X'));
    }

    // Audit stub
    const after = {
      board: [...nextBoard],
      currentPlayer: (!computedWinner && !computedDraw) ? (currentPlayer === 'X' ? 'O' : 'X') : currentPlayer
    };
    const entry = {
      ts: new Date().toISOString(),
      action: 'MOVE',
      before,
      after,
      reason: null
    };
    auditLog.push(entry);
    // eslint-disable-next-line no-console
    console.log('[AUDIT]', entry);
  };

  /**
   * PUBLIC_INTERFACE
   * restartGame
   * Resets game state to initial values and creates an audit log entry.
   */
  const restartGame = () => {
    const before = { board: [...board], currentPlayer };
    const initialBoard = Array(9).fill(null);
    setBoard(initialBoard);
    setCurrentPlayer('X');
    setWinner(null);
    setDraw(false);

    const after = { board: [...initialBoard], currentPlayer: 'X' };
    const entry = {
      ts: new Date().toISOString(),
      action: 'RESTART',
      before,
      after,
      reason: null
    };
    auditLog.push(entry);
    // eslint-disable-next-line no-console
    console.log('[AUDIT]', entry);
  };

  const isGameOver = Boolean(winner) || draw;

  return (
    <div className="App">
      <header className="App-header surface">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <main className="ttt-container">
          <Status currentPlayer={currentPlayer} winner={winner} isDraw={draw} />
          <Board board={board} onCellSelect={handleCellSelect} isGameOver={isGameOver} />
          <Controls onRestart={restartGame} disabled={false} />
        </main>
      </header>
    </div>
  );
}

export default App;

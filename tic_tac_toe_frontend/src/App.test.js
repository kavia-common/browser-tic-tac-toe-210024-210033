import { render, screen } from '@testing-library/react';
import App from './App';

test('renders status and board', () => {
  render(<App />);
  // Status should be present with default current player
  expect(screen.getByTestId('status')).toHaveTextContent(/Current player/i);
  // Board should have 9 cells
  const cells = Array.from({ length: 9 }, (_, i) => screen.getByTestId(`cell-${i}`));
  expect(cells).toHaveLength(9);
});

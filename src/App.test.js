import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => localStorage.clear());

test('shows the role picker without any login', () => {
  render(<App />);
  expect(screen.getByText(/Enter as Manager/i)).toBeInTheDocument();
  expect(screen.getByText(/Enter as Player/i)).toBeInTheDocument();
});

test('manager can enter the demo and see the sample team', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Enter as Manager/i));
  fireEvent.click(screen.getAllByText('Roster')[0]);
  expect(screen.getByText('Thunder FC')).toBeInTheDocument();
});

test('player can enter the demo and see their profile', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Enter as Player/i));
  fireEvent.click(screen.getAllByText('My Profile')[0]);
  expect(screen.getByText('Marcus Reed')).toBeInTheDocument();
  expect(screen.getByText(/Thunder FC/)).toBeInTheDocument();
});

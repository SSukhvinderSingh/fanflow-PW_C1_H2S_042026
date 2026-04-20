import { render, screen } from '@testing-library/react';
import WaitTimes from '../WaitTimes';
import { AuthProvider } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Mocking AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { displayName: 'Test User' },
    logout: vi.fn(),
  }),
}));

// Mocking Realtime DB data
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  onValue: vi.fn((ref, callback) => {
    // Return mock data for concessions/restrooms/gates
    const mockData = {
      'c1': { id: 'c1', name: 'West Concession', waitMinutes: 5, lastUpdated: '10:00 AM' },
      'c2': { id: 'c2', name: 'East Concession', waitMinutes: 20, lastUpdated: '10:05 AM' }
    };
    callback({ val: () => mockData });
    return () => {};
  }),
}));

describe('WaitTimes Page', () => {
  it('renders section headings', () => {
    render(
      <BrowserRouter>
        <WaitTimes />
      </BrowserRouter>
    );
    expect(screen.getByText(/Live Beat/i)).toBeInTheDocument();
  });

  it('renders wait time cards for concessions', () => {
    render(
      <BrowserRouter>
        <WaitTimes />
      </BrowserRouter>
    );
    // Use getAllByText because our mock currently returns the same data for all sections
    expect(screen.getAllByText(/West Concession/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/East Concession/i).length).toBeGreaterThan(0);
  });

  it('shows correct wait time numbers', () => {
    render(
      <BrowserRouter>
        <WaitTimes />
      </BrowserRouter>
    );
    // Looking for "5m" and "20m" as per WaitTimes.jsx formatting
    expect(screen.getByText(/5m/i)).toBeInTheDocument();
    expect(screen.getByText(/20m/i)).toBeInTheDocument();
  });
});

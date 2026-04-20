import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../layout/Header';
import { AuthProvider } from '../../context/AuthContext';
import { describe, it, expect, vi } from 'vitest';

// Mocking AuthContext to avoid Firebase dependencies in UI tests
vi.mock('../../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({
      user: { displayName: 'John Doe' },
      logout: vi.fn(),
    }),
  };
});

describe('Header Component', () => {
  it('renders the FanFlow logo', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByText(/FanFlow/i)).toBeInTheDocument();
  });

  it('shows logout button when authenticated', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../Context/AuthContext.jsx';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Componente simples para testar o contexto
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <button onClick={() => login('test@test.com', 'password123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // MSW will intercept the login request defined in handlers.js
  });

  it('provides initial state without user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
  });

  it('logs user in and updates state', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click login button
    await user.click(screen.getByText('Login'));

    // Wait for state update after API mock response
    expect(await screen.findByText('Test User')).toBeInTheDocument();
    
    // Check localStorage
    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    expect(localStorage.getItem('currentUser')).toContain('Test User');
  });

  it('logs user out and clears state', async () => {
    const user = userEvent.setup();
    // Preset localStorage to simulate already logged in
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('currentUser', JSON.stringify({ name: 'Old User' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(await screen.findByText('Test User')).toBeInTheDocument();

    await user.click(screen.getByText('Logout'));

    expect(await screen.findByText('No user')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });
});

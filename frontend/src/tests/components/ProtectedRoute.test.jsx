import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute.jsx';
import { AuthProvider } from '../../Context/AuthContext.jsx';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock do authService para controlar o AuthContext nativo usando spies ou mock
import { authService } from '../../services/authService';
vi.mock('../../services/authService');

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
const LoginComponent = () => <div data-testid="login-page">Login Page</div>;
const HomePage = () => <div data-testid="home-page">Home Page</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui, initialEntries = ['/protected']) => {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/protected" element={ui} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  };

  it('redirects to /login if user is not authenticated', () => {
    authService.isAuthenticated.mockReturnValue(false);
    authService.getCurrentUser.mockReturnValue(null);

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders children if user is authenticated and no roles are required', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.getCurrentUser.mockReturnValue({ name: 'User 1', role: 'user' });
    // mockar getMe também para o AuthProvider n limpar
    authService.getMe.mockResolvedValue({ success: true, data: { name: 'User 1', role: 'user' } });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(await screen.findByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to / if user does not have the required role', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.getCurrentUser.mockReturnValue({ name: 'User 1', role: 'user' });
    authService.getMe.mockResolvedValue({ success: true, data: { name: 'User 1', role: 'user' } });

    renderWithRouter(
      <ProtectedRoute roles={['admin']}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });

  it('renders children if user has the required role', async () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.getCurrentUser.mockReturnValue({ name: 'Admin User', role: 'admin' });
    authService.getMe.mockResolvedValue({ success: true, data: { name: 'Admin User', role: 'admin' } });

    renderWithRouter(
      <ProtectedRoute roles={['admin']}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(await screen.findByTestId('protected-content')).toBeInTheDocument();
  });
});

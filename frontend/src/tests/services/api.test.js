import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../../services/api';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';

describe('api.js (Axios instance)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should add Authorization header if token exists in localStorage', async () => {
    localStorage.setItem('token', 'test-token-123');

    server.use(
      http.get('http://localhost:5000/api/test-auth-header', ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        return HttpResponse.json({ authHeader });
      })
    );

    const response = await api.get('/test-auth-header');
    expect(response.data.authHeader).toBe('Bearer test-token-123');
  });

  it('should not add Authorization header if token does not exist', async () => {
    server.use(
      http.get('http://localhost:5000/api/test-auth-header', ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        return HttpResponse.json({ authHeader });
      })
    );

    const response = await api.get('/test-auth-header');
    expect(response.data.authHeader).toBeNull();
  });

  it('should redirect to /login and clear storage on 401 response', async () => {
    localStorage.setItem('token', 'old-token');
    localStorage.setItem('currentUser', 'user-data');

    // Mudar config do window.location para podermos mockar/spy
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, href: 'http://localhost' };

    server.use(
      http.get('http://localhost:5000/api/test-401', () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    try {
      await api.get('/test-401');
    } catch (e) {
      // Ignora erro
    }

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(window.location.href).toBe('/login');

    // Restaurar window.location
    window.location = originalLocation;
  });
});

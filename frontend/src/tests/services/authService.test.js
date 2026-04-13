import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../services/authService';
import api from '../../services/api';

// Mock do api
vi.mock('../../services/api');

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should save token and currentUser on success', async () => {
      const mockData = {
        data: {
          success: true,
          token: 'auth-token-123',
          data: { name: 'User Test', email: 'user@test.com' }
        }
      };
      api.post.mockResolvedValueOnce(mockData);

      const result = await authService.login('test@test.com', 'pass123');

      expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'pass123' });
      expect(localStorage.getItem('token')).toBe('auth-token-123');
      expect(JSON.parse(localStorage.getItem('currentUser'))).toEqual({ name: 'User Test', email: 'user@test.com' });
      expect(result).toEqual(mockData.data);
    });

    it('should throw error response data on failure', async () => {
      const mockError = {
        response: {
          data: { success: false, message: 'Invalid credentials' }
        }
      };
      api.post.mockRejectedValueOnce(mockError);

      await expect(authService.login('test@test.com', 'wrong'))
        .rejects.toEqual(mockError.response.data);
    });
  });

  describe('logout', () => {
    it('should remove token and currentUser from localStorage', () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('currentUser', JSON.stringify({ name: 'Someone' }));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('token', 'real-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false if token does not exist', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});

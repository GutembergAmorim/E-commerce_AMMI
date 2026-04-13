import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '../../services/userService';
import api from '../../services/api';

vi.mock('../../services/api');

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should fetch all users', async () => {
      const mockResponse = { data: { success: true, data: [{ _id: '1', name: 'User 1' }] } };
      api.get.mockResolvedValueOnce(mockResponse);

      const result = await userService.list();

      expect(api.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('get', () => {
    it('should fetch a single user by id', async () => {
      const mockResponse = { data: { success: true, data: { _id: '123', name: 'User 1' } } };
      api.get.mockResolvedValueOnce(mockResponse);

      const result = await userService.get('123');

      expect(api.get).toHaveBeenCalledWith('/users/123');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('setRole', () => {
    it('should update user role', async () => {
      const mockResponse = { data: { success: true, message: 'Role updated' } };
      api.put.mockResolvedValueOnce(mockResponse);

      const result = await userService.setRole('123', 'admin');

      expect(api.put).toHaveBeenCalledWith('/users/123/role', { role: 'admin' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('setStatus', () => {
    it('should update user status', async () => {
      const mockResponse = { data: { success: true, message: 'Status updated' } };
      api.put.mockResolvedValueOnce(mockResponse);

      const result = await userService.setStatus('123', false);

      expect(api.put).toHaveBeenCalledWith('/users/123/status', { isActive: false });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('remove', () => {
    it('should delete user by id', async () => {
      const mockResponse = { data: { success: true, message: 'User deleted' } };
      api.delete.mockResolvedValueOnce(mockResponse);

      const result = await userService.remove('123');

      expect(api.delete).toHaveBeenCalledWith('/users/123');
      expect(result).toEqual(mockResponse.data);
    });
  });
});

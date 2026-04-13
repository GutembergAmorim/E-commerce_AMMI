import { protect, admin } from '../../src/middleware/auth.js';
import User from '../../src/models/User.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

describe('Auth Middleware Tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('protect middleware', () => {
    it('should call next if token is valid and user exists', async () => {
      req.headers.authorization = 'Bearer validtoken123';
      
      jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'user123' });
      
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user123', role: 'user', isActive: true })
      });

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalled();
      expect(User.findById).toHaveBeenCalled();
      expect(req.user._id).toBe('user123');
      expect(next).toHaveBeenCalled();

      jwt.verify.mockRestore();
      User.findById.mockRestore();
    });

    it('should return 401 if no token is provided', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Token não fornecido' }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid or expired', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Token inválido' }));
      expect(next).not.toHaveBeenCalled();

      jwt.verify.mockRestore();
    });
  });

  describe('admin middleware', () => {
    it('should call next if user is an admin', () => {
      req.user = { role: 'admin' };
      
      admin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not an admin', () => {
      req.user = { role: 'user' };
      
      admin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Acesso negado. Apenas administradores.' }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});

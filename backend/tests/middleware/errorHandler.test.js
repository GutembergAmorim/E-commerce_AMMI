import errorHandler from '../../src/middleware/errorHandler.js';
import { jest } from '@jest/globals';

describe('Error Handler Middleware Tests', () => {
  let err;
  let req;
  let res;
  let next;

  beforeEach(() => {
    err = new Error('Test error');
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    // Cache the original environment
    process.env.NODE_ENV = 'test';
  });

  it('should format CastError correctly (Mongoose bad ObjectId)', () => {
    err.name = 'CastError';
    err.path = '_id';
    
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Recurso não encontrado' })
    );
  });

  it('should format ValidationError correctly', () => {
    err.name = 'ValidationError';
    err.errors = {
      field1: { message: 'Required field' }
    };
    
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    // Values array mapped message
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: ['Required field'] })
    );
  });

  it('should format duplicate key error correctly', () => {
    err.code = 11000;
    
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Valor duplicado' })
    );
  });

  it('should use 500 as default status code if statusCode is missing', () => {
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test error' })
    );
  });
});

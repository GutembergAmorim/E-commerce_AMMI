import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';

export const createTestUser = async (overrides = {}) => {
  return await User.create({
    name: 'Test User',
    email: `test-${Date.now()}@test.com`,
    password: 'password123',
    ...overrides
  });
};

export const generateTestToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'super-secret-test-key', {
    expiresIn: '1h'
  });
};

export const createTestProduct = async (overrides = {}) => {
  return await Product.create({
    name: 'Test Product',
    price: 99.90,
    category: 'tops',
    isNewProduct: false,
    onSale: false,
    ...overrides
  });
};

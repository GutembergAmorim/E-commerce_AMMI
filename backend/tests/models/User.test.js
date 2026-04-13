import mongoose from 'mongoose';
import User from '../../src/models/User.js';

describe('User Model Test', () => {
  it('should create and save user successfully', async () => {
    const validUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    const savedUser = await validUser.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(validUser.name);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.role).toBe('user');
  });

  it('should fail user creation without required fields', async () => {
    const invalidUser = new User({ name: 'Test User' });
    let err;
    try {
      await invalidUser.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });

  it('should fail when email is duplicated', async () => {
    const user1 = new User({ name: 'User 1', email: 'duplicate@test.com', password: 'password123' });
    await user1.save();
    
    const user2 = new User({ name: 'User 2', email: 'duplicate@test.com', password: 'password123' });
    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });

  it('should hash the password before saving', async () => {
    const user = new User({ name: 'Pass', email: 'pass@test.com', password: 'password123' });
    const savedUser = await user.save();
    expect(savedUser.password).not.toBe('password123');
  });

  it('should correctly match passwords', async () => {
    const user = new User({ name: 'Match', email: 'match@test.com', password: 'password123' });
    const savedUser = await user.save();
    const isMatch = await savedUser.matchPassword('password123');
    const isNotMatch = await savedUser.matchPassword('wrongpassword');
    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });
});

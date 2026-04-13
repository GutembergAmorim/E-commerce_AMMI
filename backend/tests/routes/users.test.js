import request from 'supertest';
import app from '../../app.js';
import User from '../../src/models/User.js';

describe('Users API Tests', () => {
  let adminToken;
  let userToken;
  let testUser;

  beforeEach(async () => {
    await User.deleteMany({});
    
    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.token || adminLogin.body.data?.token;

    // Create normal user
    testUser = await User.create({
      name: 'User 1',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = userLogin.body.token || userLogin.body.data?.token;
  });

  it('should list all users for admin', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // At least admin and testUser
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('should block normal user from listing all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin to change role of another user', async () => {
    const res = await request(app)
      .put(`/api/users/${testUser._id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.role).toBe('admin');
  });

  it('should allow user to update their own profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'User Updated', phone: '11999999999' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.name).toBe('User Updated');
    expect(updatedUser.phone).toBe('11999999999');
  });

  it('should fail profile update with wrong current password', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ 
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Senha atual incorreta');
  });
});

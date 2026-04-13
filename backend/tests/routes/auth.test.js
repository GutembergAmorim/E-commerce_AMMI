import request from 'supertest';
import app from '../../app.js';
import User from '../../src/models/User.js';

describe('Auth API Tests', () => {
  const getValidUser = () => ({
    name: 'Auth Test User',
    email: 'auth.test@example.com',
    password: 'password123',
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user successfully', async () => {
    const validUser = getValidUser();
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(validUser.email);
    expect(response.body.token).toBeDefined();

    const userInDb = await User.findOne({ email: validUser.email });
    expect(userInDb).toBeTruthy();
  });

  it('should fail to register with an existing email', async () => {
    const validUser = getValidUser();
    await new User(validUser).save();

    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);
    
    expect(response.status).toBe(400); 
    expect(response.body.success).toBe(false);
  });

  it('should login an existing user', async () => {
    const validUser = getValidUser();
    await new User(validUser).save(); // Use save to ensure hash

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  it('should fail login with incorrect password', async () => {
    const validUser = getValidUser();
    await new User(validUser).save();

    const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'wrongpassword'
        });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
  
  it('should get current user with valid token', async () => {
    const validUser = getValidUser();
    await new User(validUser).save();

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });
    
    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.email).toBe(validUser.email);
  });
});

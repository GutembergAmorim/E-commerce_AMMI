import request from 'supertest';
import app from '../../app.js';
import Product from '../../src/models/Product.js';
import User from '../../src/models/User.js';

describe('Products API Tests', () => {
  let adminToken;
  let userToken;

  const validProduct = {
    name: 'Legging Test',
    description: 'Uma legging perfeita para o treino',
    price: 199.90,
    images: ['legging.jpg'],
    category: 'Legging',
    stock: 50,
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    
    // Create admin
    const admin = new User({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    await admin.save();
    
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.token || adminLogin.body.data?.token;

    // Create normal user
    const user = new User({
      name: 'User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });
    await user.save();

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = userLogin.body.token || userLogin.body.data?.token;
  });

  it('should get a list of products', async () => {
    await new Product(validProduct).save();
    const res = await request(app).get('/api/products');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].name).toBe(validProduct.name);
  });

  it('should create a product if user is admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validProduct);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(validProduct.name);
  });

  it('should reject product creation if user is not admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validProduct);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Acesso negado');
  });

  it('should update a product if admin', async () => {
    const product = await new Product(validProduct).save();
    
    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 150 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.price).toBe(150);
  });

  it('should delete a product if admin', async () => {
    const product = await new Product(validProduct).save();

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await Product.findById(product._id);
    expect(deleted).toBeNull();
  });
});

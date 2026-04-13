import request from 'supertest';
import app from '../../app.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';

describe('Stock API Tests', () => {
  let adminToken;
  let userToken;
  let testProduct;

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    
    // Create admin
    await User.create({
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
    await User.create({
      name: 'User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = userLogin.body.token || userLogin.body.data?.token;

    // Create product
    testProduct = await Product.create({
      name: 'Top Test Stock',
      description: 'Test',
      price: 100,
      images: ['img.jpg'],
      category: 'Top',
      stock: 50,
      lowStockAlert: 10
    });
  });

  it('admin can adjust stock by adding', async () => {
    const res = await request(app)
      .post(`/api/stock/adjust/${testProduct._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        adjustment: 20, // add 20
        reason: 'Restocking'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stock).toBe(70);
  });

  it('admin can adjust stock by removing', async () => {
    const res = await request(app)
      .post(`/api/stock/adjust/${testProduct._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        adjustment: -10, // remove 10
        reason: 'Damage'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stock).toBe(40);
  });

  it('should block non-admin from adjusting stock', async () => {
    const res = await request(app)
      .post(`/api/stock/adjust/${testProduct._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        adjustment: 20,
        reason: 'Restocking'
      });

    expect(res.status).toBe(403);
  });

  it('admin can list low stock items', async () => {
    // Create a low stock product
    await Product.create({
      name: 'Low Stock Item',
      description: 'Test',
      price: 100,
      images: ['img.jpg'],
      category: 'Top',
      stock: 5,
      lowStockAlert: 10
    });

    const res = await request(app)
      .get('/api/stock/low-stock')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should have at least one logic element that is low stock
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some(p => p.name === 'Low Stock Item')).toBe(true);
  });
});

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import Order from '../../src/models/Order.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';

describe('Orders API Tests', () => {
  let adminToken;
  let userToken;
  let anotherUserToken;
  let testUser;
  let testProduct;

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    
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

    // Create another normal user to test authorization
    await User.create({
      name: 'User 2',
      email: 'another@test.com',
      password: 'password123',
      role: 'user'
    });

    const anotherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'another@test.com', password: 'password123' });
    anotherUserToken = anotherLogin.body.token || anotherLogin.body.data?.token;

    // Create a product to use in orders
    testProduct = await Product.create({
      name: 'Legging Test',
      description: 'Test',
      price: 100,
      images: ['img.jpg'],
      category: 'Legging',
      stock: 50,
    });
  });

  const getValidOrderData = () => ({
    orderItems: [{
      product: testProduct._id,
      name: testProduct.name,
      price: testProduct.price,
      quantity: 1,
      color: 'Purple',
      size: 'M',
      image: 'img.jpg'
    }],
    shippingAddress: {
      address: 'Rua Teste',
      number: '123',
      neighborhood: 'Centro',
      city: 'SP',
      state: 'SP',
      postalCode: '12345-678'
    },
    paymentMethod: 'PIX',
    itemsPrice: 100,
    shippingPrice: 15,
    taxPrice: 0,
    total: 115
  });

  it('should get logged in user orders', async () => {
    // Manually create an order for the user
    await Order.create({
      ...getValidOrderData(),
      user: testUser._id
    });

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].total).toBe(115);
  });

  it('should get order by ID if user owns it', async () => {
    const order = await Order.create({
      ...getValidOrderData(),
      user: testUser._id
    });

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id.toString()).toBe(order._id.toString());
  });

  it('should not allow user to get another users order', async () => {
    const order = await Order.create({
      ...getValidOrderData(),
      user: testUser._id
    });

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${anotherUserToken}`);

    expect(res.status).toBe(403);
    // the application might return 401, 403 or 404 depending on implementation. Usually 403 or 404.
  });

  it('admin can get any order by ID', async () => {
    const order = await Order.create({
      ...getValidOrderData(),
      user: testUser._id
    });

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id.toString()).toBe(order._id.toString());
  });

  it('should get all orders for admin', async () => {
    await Order.create({ ...getValidOrderData(), user: testUser._id });

    const res = await request(app)
      .get('/api/orders/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should block non-admin from getting all orders', async () => {
    const res = await request(app)
      .get('/api/orders/admin/all')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});

import request from 'supertest';
import app from '../../app.js';
import User from '../../src/models/User.js';
import Coupon from '../../src/models/Coupon.js';

describe('Coupons API Tests', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await Coupon.deleteMany({});
    
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
    const user = await User.create({
      name: 'User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = userLogin.body.token || userLogin.body.data?.token;
  });

  const validCoupon = {
    code: 'TEST20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 100
  };

  it('should validate a good coupon', async () => {
    await Coupon.create(validCoupon);

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'TEST20', orderTotal: 150 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('TEST20');
  });

  it('should fail validation if minimum block not met', async () => {
    await Coupon.create(validCoupon);

    const res = await request(app)
      .post('/api/coupons/validate')
      .send({ code: 'TEST20', orderTotal: 50 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('admin can create coupon', async () => {
    const res = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validCoupon);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('TEST20');
  });

  it('admin can list coupons', async () => {
    await Coupon.create(validCoupon);
    const res = await request(app)
      .get('/api/coupons')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('admin can delete coupon', async () => {
    const coupon = await Coupon.create(validCoupon);
    const res = await request(app)
      .delete(`/api/coupons/${coupon._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const found = await Coupon.findById(coupon._id);
    expect(found).toBeNull();
  });
});

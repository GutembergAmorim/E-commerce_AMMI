import request from 'supertest';
import app from '../../app.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';
import Review from '../../src/models/Review.js';

describe('Reviews API Tests', () => {
  let adminToken;
  let userToken;
  let testUser;
  let testProduct;

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    
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
    testUser = await User.create({
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
      name: 'Top Test',
      description: 'Test',
      price: 100,
      images: ['img.jpg'],
      category: 'Top',
      stock: 50,
    });
  });

  it('should create a review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: testProduct._id,
        rating: 5,
        comment: 'Ótimo produto!',
        title: 'Review Title'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
  });

  it('should list approved reviews for a product', async () => {
    // Create an approved review manually
    await Review.create({
      user: testUser._id,
      product: testProduct._id,
      rating: 4,
      comment: 'Approved review',
      status: 'Aprovada'
    });

    const res = await request(app).get(`/api/reviews/product/${testProduct._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('admin can toggle approval for a review', async () => {
    // Create a pending review
    const review = await Review.create({
      user: testUser._id,
      product: testProduct._id,
      rating: 4,
      comment: 'Pending review',
      isApproved: false
    });

    const res = await request(app)
      .put(`/api/reviews/${review._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Aprovada' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isApproved).toBe(true);
  });

  it('author can delete their own review', async () => {
    const review = await Review.create({
      user: testUser._id,
      product: testProduct._id,
      rating: 4,
      comment: 'To be deleted',
      status: 'Pendente'
    });

    const res = await request(app)
      .delete(`/api/reviews/${review._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await Review.findById(review._id);
    expect(deleted).toBeNull();
  });
});

import mongoose from 'mongoose';
import Product from '../../src/models/Product.js';

describe('Product Model Test', () => {
  it('should create and save product successfully', async () => {
    const validProduct = new Product({
      name: 'Test Product',
      description: 'A simple test product',
      price: 99.90,
      images: ['image1.png'],
      category: 'Top',
      stock: 10,
    });
    const savedProduct = await validProduct.save();
    
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe('Test Product');
    expect(savedProduct.category).toBe('Top');
    expect(savedProduct.stock).toBe(10);
  });

  it('should fail if missing required fields', async () => {
    const invalidProduct = new Product({ name: 'Test' });
    let err;
    try {
      await invalidProduct.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.description).toBeDefined();
    expect(err.errors.price).toBeDefined();
    expect(err.errors.category).toBeDefined();
  });

  it('should fail with negative price or stock', async () => {
    const invalidProduct = new Product({
      name: 'Test',
      description: 'Desc',
      price: -10,
      stock: -5,
      category: 'Top',
      images: ['img.jpg']
    });
    
    let err;
    try {
      await invalidProduct.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.price).toBeDefined();
    expect(err.errors.stock).toBeDefined();
  });

  it('should enforce category enum validation', async () => {
    const product = new Product({
      name: 'P', description: 'D', price: 10, images: ['i.jpg'],
      category: 'InvalidCat', stock: 1
    });
    
    let err;
    try {
      await product.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.category).toBeDefined();
  });
});

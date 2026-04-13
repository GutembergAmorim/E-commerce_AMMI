import mongoose from 'mongoose';
import Order from '../../src/models/Order.js';

describe('Order Model Test', () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyProductId = new mongoose.Types.ObjectId();
  
  const validOrderData = {
    user: dummyUserId,
    orderItems: [{
      product: dummyProductId,
      name: 'Produto 1',
      price: 50,
      quantity: 1,
      color: 'Red',
      size: 'M',
      image: 'img.jpg'
    }],
    shippingAddress: {
      address: 'Rua A',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01000-000',
    },
    paymentMethod: 'PIX',
    itemsPrice: 50,
    shippingPrice: 10,
    taxPrice: 0,
    total: 60,
  };

  it('should create and save order successfully', async () => {
    const order = new Order(validOrderData);
    const savedOrder = await order.save();
    
    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.status).toBe('Pendente');
    expect(savedOrder.paymentMethod).toBe('PIX');
    expect(savedOrder.total).toBe(60);
  });

  it('should fail with invalid paymentMethod', async () => {
    const order = new Order({ ...validOrderData, paymentMethod: 'DINHEIRO' });
    let err;
    try {
      await order.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.paymentMethod).toBeDefined();
  });

  it('should fail with invalid status', async () => {
    const order = new Order({ ...validOrderData, status: 'INVALID_STATUS' });
    let err;
    try {
      await order.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.status).toBeDefined();
  });
});

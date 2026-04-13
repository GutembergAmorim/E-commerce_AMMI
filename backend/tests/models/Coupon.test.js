import mongoose from 'mongoose';
import Coupon from '../../src/models/Coupon.js';

describe('Coupon Model Test', () => {
  it('should create and save coupon successfully', async () => {
    const validCoupon = new Coupon({
      code: 'PROMO10',
      discountType: 'percentage',
      discountValue: 10,
    });
    const savedCoupon = await validCoupon.save();
    
    expect(savedCoupon._id).toBeDefined();
    expect(savedCoupon.code).toBe('PROMO10');
    expect(savedCoupon.isActive).toBe(true);
  });

  it('isValid() should return valid: true for active coupons', () => {
    const coupon = new Coupon({ code: 'TEST', discountValue: 10, isActive: true });
    const result = coupon.isValid(100);
    expect(result.valid).toBe(true);
  });

  it('isValid() should return valid: false for inactive or expired coupons', () => {
    const inactive = new Coupon({ code: 'TEST', discountValue: 10, isActive: false });
    expect(inactive.isValid(100).valid).toBe(false);

    const expired = new Coupon({ 
      code: 'TEST2', 
      discountValue: 10, 
      expiresAt: new Date(Date.now() - 10000) 
    });
    expect(expired.isValid(100).valid).toBe(false);
  });

  it('isValid() should apply minOrderValue rule', () => {
    const coupon = new Coupon({ code: 'TEST', discountValue: 10, minOrderValue: 200 });
    expect(coupon.isValid(150).valid).toBe(false);
    expect(coupon.isValid(250).valid).toBe(true);
  });

  it('isValid() should validate maxUses', () => {
    const coupon = new Coupon({ code: 'TEST', discountValue: 10, maxUses: 5, usedCount: 5 });
    expect(coupon.isValid(100).valid).toBe(false);
  });

  it('calculateDiscount() should calculate percentage and fixed correctly', () => {
    const percCoupon = new Coupon({ code: 'TEST', discountType: 'percentage', discountValue: 20 }); // 20%
    const fixedCoupon = new Coupon({ code: 'TEST2', discountType: 'fixed', discountValue: 30 }); // R$30

    expect(percCoupon.calculateDiscount(200)).toBe(40);
    expect(percCoupon.calculateDiscount(10)).toBe(2); // (10 * 20%)

    expect(fixedCoupon.calculateDiscount(100)).toBe(30);
    expect(fixedCoupon.calculateDiscount(20)).toBe(20); // should not exceed order total
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { productService } from '../../services/productService';
import api from '../../services/api';

vi.mock('../../services/api');

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products with filters', async () => {
      const mockResponse = { data: { success: true, data: [] } };
      api.get.mockResolvedValueOnce(mockResponse);

      const result = await productService.getProducts({ category: 'Top', limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/products?category=Top&limit=10');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error response on failure', async () => {
      const mockError = { response: { data: { message: 'Erro ao buscar produtos' } } };
      api.get.mockRejectedValueOnce(mockError);

      await expect(productService.getProducts()).rejects.toEqual(mockError.response.data);
    });
  });

  describe('getBestSellers', () => {
    it('should fetch best sellers with limit', async () => {
      const mockResponse = { data: { success: true, data: [] } };
      api.get.mockResolvedValueOnce(mockResponse);

      const result = await productService.getBestSellers(5);

      expect(api.get).toHaveBeenCalledWith('/products?sort=best-sellers&limit=5');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createProduct', () => {
    it('should post product data and return response', async () => {
      const payload = { name: 'New Top', price: 99 };
      const mockResponse = { data: { success: true, data: { _id: '123' } } };
      api.post.mockResolvedValueOnce(mockResponse);

      const result = await productService.createProduct(payload);

      expect(api.post).toHaveBeenCalledWith('/products', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteProduct', () => {
    it('should send delete request and return response', async () => {
      const mockResponse = { data: { success: true } };
      api.delete.mockResolvedValueOnce(mockResponse);

      const result = await productService.deleteProduct('123');

      expect(api.delete).toHaveBeenCalledWith('/products/123');
      expect(result).toEqual(mockResponse.data);
    });
  });
});

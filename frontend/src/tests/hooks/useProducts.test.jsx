import { renderHook, waitFor } from '@testing-library/react';
import { useProducts, useProduct, useHighlightedProducts } from '../../hooks/useProducts.js';
import { describe, it, expect, vi } from 'vitest';
import { productService } from '../../services/productService.js';

// Usamos mock do productService pois o MWS pode também ser usado, mas renderHook com mock de service é mais direto e rápido para testes unitários de hooks.
vi.mock('../../services/productService.js', () => ({
  productService: {
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    getHighlightedProducts: vi.fn(),
    getBestSellers: vi.fn()
  }
}));

describe('useProducts Hook Tests', () => {
  it('useProducts fetches and returns products', async () => {
    productService.getProducts.mockResolvedValueOnce({
      success: true,
      data: [{ _id: '1', name: 'Product 1' }]
    });

    const { result } = renderHook(() => useProducts());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for the effect to resolve
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products.length).toBe(1);
    expect(result.current.products[0].name).toBe('Product 1');
    expect(result.current.error).toBeNull();
  });

  it('useProducts handles errors', async () => {
    productService.getProducts.mockResolvedValueOnce({
      success: false,
      message: 'Failed to fetch'
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.products.length).toBe(0);
  });

  it('useProduct fetches a single product', async () => {
    productService.getProductById.mockResolvedValueOnce({
      success: true,
      data: { _id: '1', name: 'Product 1' }
    });

    const { result } = renderHook(() => useProduct('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.product.name).toBe('Product 1');
  });

  it('useHighlightedProducts fetches highlighted items', async () => {
    productService.getHighlightedProducts.mockResolvedValueOnce({
      success: true,
      data: [{ _id: '2', name: 'Highlight 1' }]
    });

    const { result } = renderHook(() => useHighlightedProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products[0].name).toBe('Highlight 1');
  });
});

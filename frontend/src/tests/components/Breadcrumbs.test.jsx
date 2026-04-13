import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs.jsx';
import { productService } from '../../services/productService';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../services/productService');

describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialRoute) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="*" element={<Breadcrumbs />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('does not render on home page', () => {
    const { container } = renderWithRouter('/');
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly for simple routes', () => {
    renderWithRouter('/collections');
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Coleções')).toBeInTheDocument();
    expect(screen.getByText('Coleções')).toHaveClass('active');
  });

  it('fetches and displays product name for product route', async () => {
    // mock a successful product response
    productService.getProductById.mockResolvedValueOnce({
      success: true,
      data: { name: 'Legging Teste' },
    });

    // 24-char hex string as mock ObjectId
    const mockId = '507f1f77bcf86cd799439011';
    renderWithRouter(`/products/${mockId}`);

    expect(screen.getByText('Produtos')).toBeInTheDocument();
    
    // Initially shows something like Loading... or the ID
    expect(screen.getByText('Carregando...')).toBeInTheDocument();

    // After async useEffect fetches data
    await waitFor(() => {
      expect(screen.getByText('Legging Teste')).toBeInTheDocument();
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    expect(productService.getProductById).toHaveBeenCalledWith(mockId);
  });

  it('displays placeholder if product fetch fails', async () => {
    productService.getProductById.mockRejectedValueOnce(new Error('Fetch failed'));

    const mockId = '507f1f77bcf86cd799439011';
    renderWithRouter(`/products/${mockId}`);

    // Still trying to load then fails
    await waitFor(() => {
      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });
  });
});

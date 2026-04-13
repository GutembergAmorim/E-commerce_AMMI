import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import { useFavorites } from '../../Context/FavoritesContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../Context/FavoritesContext', () => ({
  useFavorites: vi.fn(),
}));

describe('ProductCard Component', () => {
  const mockToggleFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useFavorites.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
      isFavorite: vi.fn(),
    });
  });

  const renderCard = (productProps = {}, mockIsFavorite = false) => {
    useFavorites.mockReturnValue({
      toggleFavorite: mockToggleFavorite,
      isFavorite: (id) => mockIsFavorite,
    });

    const product = {
      _id: '123',
      name: 'Test Product',
      price: 99.9,
      images: ['test-image.jpg'],
      ...productProps,
    };

    return render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    );
  };

  it('renders product information correctly', () => {
    renderCard({ oldPrice: 150.0 });
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('R$ 99,90')).toBeInTheDocument();
    expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
    expect(screen.getByText('Ver Detalhes')).toBeInTheDocument();
    
    const img = screen.getByAltText('Test Product');
    expect(img).toHaveAttribute('src', 'test-image.jpg');
  });

  it('shows out of stock badge when stock is 0', () => {
    renderCard({ stock: 0 });
    expect(screen.getByText('ESGOTADO')).toBeInTheDocument();
    expect(screen.getByText('Indisponível')).toBeInTheDocument();
    expect(screen.getByText('Indisponível').closest('button')).toBeDisabled();
  });

  it('shows low stock alert', () => {
    renderCard({ stock: 3 });
    expect(screen.getByText(/ÚLTIMAS UNIDADES/)).toBeInTheDocument();
  });

  it('calls toggleFavorite when heart icon is clicked', () => {
    renderCard();
    const btnList = screen.getAllByRole('button');
    // Top-right button is the favorite toggle
    const favButton = btnList[0];
    
    // Simulate event
    fireEvent.click(favButton);
    expect(mockToggleFavorite).toHaveBeenCalledWith(expect.objectContaining({ _id: '123' }));
  });
});

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoritesProvider, useFavorites } from '../../Context/FavoritesContext.jsx';
import { describe, it, expect, beforeEach } from 'vitest';

const TestComponent = () => {
  const { toggleFavorite, isFavorite, favorites } = useFavorites();

  return (
    <div>
      <div data-testid="fav-count">{favorites.length}</div>
      <div data-testid="is-fav">{isFavorite('prod1') ? 'Yes' : 'No'}</div>
      <button onClick={() => toggleFavorite({ _id: 'prod1', name: 'Product 1' })}>
        Toggle Prod 1
      </button>
      <button onClick={() => toggleFavorite({ _id: 'prod2', name: 'Product 2' })}>
        Toggle Prod 2
      </button>
    </div>
  );
};

describe('FavoritesContext Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty by default', () => {
    render(<FavoritesProvider><TestComponent /></FavoritesProvider>);
    expect(screen.getByTestId('fav-count')).toHaveTextContent('0');
    expect(screen.getByTestId('is-fav')).toHaveTextContent('No');
  });

  it('toggles favorite and saves to limit', async () => {
    const user = userEvent.setup();
    render(<FavoritesProvider><TestComponent /></FavoritesProvider>);

    await user.click(screen.getByText('Toggle Prod 1'));
    
    expect(screen.getByTestId('fav-count')).toHaveTextContent('1');
    expect(screen.getByTestId('is-fav')).toHaveTextContent('Yes');
    
    const storageFavs = JSON.parse(localStorage.getItem('favorites'));
    expect(storageFavs.length).toBe(1);
    expect(storageFavs[0]._id).toBe('prod1');

    // Toggle again removes it
    await user.click(screen.getByText('Toggle Prod 1'));
    expect(screen.getByTestId('fav-count')).toHaveTextContent('0');
    expect(screen.getByTestId('is-fav')).toHaveTextContent('No');
    expect(JSON.parse(localStorage.getItem('favorites'))).toHaveLength(0);
  });

  it('restores favorites from localStorage', () => {
    localStorage.setItem('favorites', JSON.stringify([{ _id: 'prod1' }, { _id: 'prod3' }]));
    
    render(<FavoritesProvider><TestComponent /></FavoritesProvider>);
    
    expect(screen.getByTestId('fav-count')).toHaveTextContent('2');
    expect(screen.getByTestId('is-fav')).toHaveTextContent('Yes');
  });
});

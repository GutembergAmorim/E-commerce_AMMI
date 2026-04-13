import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../../Context/CartContext.jsx';
import { describe, it, expect, beforeEach } from 'vitest';

const TestCartComponent = () => {
  const { cartItems, addItemToCart, handleRemoveItem, clearCart, total } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{cartItems.length}</div>
      <div data-testid="cart-total">{total}</div>
      <button 
        onClick={() => addItemToCart({ id: 'prod1', name: 'Product 1', price: 50, originalPrice: 60, quantity: 1, color: 'Black', size: 'M' })}
      >
        Add Product 1
      </button>
      <button 
        onClick={() => addItemToCart({ id: 'prod2', name: 'Product 2', price: 100, originalPrice: 100, quantity: 2, color: 'Red', size: 'S' })}
      >
        Add Product 2
      </button>
      <button onClick={() => handleRemoveItem('prod1', 'Black', 'M')}>Remove Product 1</button>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
};

describe('CartContext Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty cart', () => {
    render(<CartProvider><TestCartComponent /></CartProvider>);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });

  it('add item to cart updates local state and storage', async () => {
    const user = userEvent.setup();
    render(<CartProvider><TestCartComponent /></CartProvider>);

    await user.click(screen.getByText('Add Product 1'));
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    const storageCart = JSON.parse(localStorage.getItem('cartItems'));
    expect(storageCart.length).toBe(1);
    expect(storageCart[0].name).toBe('Product 1');
  });

  it('adding same item increases quantity', async () => {
    const user = userEvent.setup();
    render(<CartProvider><TestCartComponent /></CartProvider>);

    await user.click(screen.getByText('Add Product 1'));
    await user.click(screen.getByText('Add Product 1'));
    
    const storageCart = JSON.parse(localStorage.getItem('cartItems'));
    // Depending on logic, it either creates 1 item with quantity 2 or 2 items
    expect(storageCart.length).toBe(1);
    expect(storageCart[0].quantity).toBe(2);
  });

  it('removing item updates state', async () => {
    const user = userEvent.setup();
    render(<CartProvider><TestCartComponent /></CartProvider>);

    await user.click(screen.getByText('Add Product 1'));
    await user.click(screen.getByText('Add Product 2'));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');

    await user.click(screen.getByText('Remove Product 1'));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    
    const storageCart = JSON.parse(localStorage.getItem('cartItems'));
    expect(storageCart[0].name).toBe('Product 2');
  });

  it('clearing cart removes all items', async () => {
    const user = userEvent.setup();
    render(<CartProvider><TestCartComponent /></CartProvider>);

    await user.click(screen.getByText('Add Product 1'));
    await user.click(screen.getByText('Add Product 2'));
    await user.click(screen.getByText('Clear Cart'));
    
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(localStorage.getItem('cartItems')).toBe('[]');
  });

  it('restores cart from localStorage on mount', () => {
    // Preset cart
    localStorage.setItem('cartItems', JSON.stringify([
      { id: 'prod1', name: 'Saved Product', quantity: 1, price: 10, color: 'Blue', size: 'L' }
    ]));
    
    render(<CartProvider><TestCartComponent /></CartProvider>);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
  });
});

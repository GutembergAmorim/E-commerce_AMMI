import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Banner from '../../components/Banner/Banner.jsx';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('Banner Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <Banner />
      </MemoryRouter>
    );
  };

  it('renders initial slides correctly', () => {
    renderWithRouter();
    const slides = screen.getAllByRole('img');
    expect(slides.length).toBeGreaterThan(0);
    // Botões
    expect(screen.getByText('Ver Coleção')).toBeInTheDocument();
  });

  it('goes to next slide when next arrow is clicked', () => {
    renderWithRouter();
    
    // Check initial dot is active
    const dots = screen.getAllByLabelText(/Ir para slide/);
    expect(dots[0]).toHaveClass('banner-dot--active');
    expect(dots[1]).not.toHaveClass('banner-dot--active');

    // Click next arrow
    act(() => {
      fireEvent.click(screen.getByLabelText('Próximo slide'));
    });

    expect(dots[0]).not.toHaveClass('banner-dot--active');
    expect(dots[1]).toHaveClass('banner-dot--active');
  });

  it('auto plays after delay', () => {
    renderWithRouter();

    const dots = screen.getAllByLabelText(/Ir para slide/);
    expect(dots[0]).toHaveClass('banner-dot--active');

    // advance time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(dots[1]).toHaveClass('banner-dot--active');
  });
});

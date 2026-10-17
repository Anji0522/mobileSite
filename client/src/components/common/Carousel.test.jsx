import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Carousel } from './Carousel.jsx';

describe('Carousel Component', () => {
  const mockImages = [
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  ];

  it('renders the initial active image', () => {
    render(<Carousel images={mockImages} alt="Test Mobile" />);

    const mainImage = screen.getByAltText('Test Mobile - View 1');
    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveAttribute('src', mockImages[0]);
  });

  it('navigates to next image when Next button is clicked', () => {
    render(<Carousel images={mockImages} alt="Test Mobile" />);

    const nextBtn = screen.getByRole('button', { name: /next image/i });
    fireEvent.click(nextBtn);

    const activeImage = screen.getByAltText('Test Mobile - View 2');
    expect(activeImage).toBeInTheDocument();
    expect(activeImage).toHaveAttribute('src', mockImages[1]);
  });

  it('navigates to previous image when Prev button is clicked', () => {
    render(<Carousel images={mockImages} alt="Test Mobile" />);

    const prevBtn = screen.getByRole('button', { name: /previous image/i });
    // Clicking prev on first item wraps to the last item
    fireEvent.click(prevBtn);

    const activeImage = screen.getByAltText('Test Mobile - View 3');
    expect(activeImage).toBeInTheDocument();
    expect(activeImage).toHaveAttribute('src', mockImages[2]);
  });
});

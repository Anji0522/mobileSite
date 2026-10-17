import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileCard } from './MobileCard.jsx';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { CartProvider } from '../../context/CartContext.jsx';
import { CompareProvider } from '../../context/CompareContext.jsx';
import { ToastProvider } from '../../context/ToastContext.jsx';

const mockMobile = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d1',
  name: 'OnePlus 12',
  slug: 'oneplus-12',
  brandName: 'OnePlus',
  brand: 'OnePlus',
  price: {
    mrp: 69999,
    current: 64999,
    discountPercentage: 7,
  },
  images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'],
  rating: {
    avg: 4.7,
    count: 320,
  },
  variants: [
    { sku: 'OP12-12-256', ram: '12GB', storage: '256GB', color: 'Silky Black', mrp: 69999, price: 64999 }
  ],
  specs: {
    processor: 'Snapdragon 8 Gen 3',
    battery: { capacity: '5400 mAh' },
    is5G: true,
  }
};

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <CompareProvider>
              {ui}
            </CompareProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('MobileCard Component', () => {
  it('renders phone name, brand, and formatted INR price', () => {
    renderWithProviders(<MobileCard mobile={mockMobile} />);

    expect(screen.getByText('OnePlus 12')).toBeInTheDocument();
    expect(screen.getByText('OnePlus')).toBeInTheDocument();
    expect(screen.getByText('₹64,999')).toBeInTheDocument();
  });

  it('renders add to cart button and compare button', () => {
    renderWithProviders(<MobileCard mobile={mockMobile} />);

    const cartBtn = screen.getByRole('button', { name: /add to bag/i });
    expect(cartBtn).toBeInTheDocument();

    const compareBtn = screen.getByRole('button', { name: /compare/i });
    expect(compareBtn).toBeInTheDocument();
  });
});

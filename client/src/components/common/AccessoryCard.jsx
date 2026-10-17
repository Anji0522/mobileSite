import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck } from 'lucide-react';
import { PriceTag } from './PriceTag.jsx';
import { RatingStars } from './RatingStars.jsx';
import { Button } from './Button.jsx';
import { useCart } from '../../context/CartContext.jsx';

export const AccessoryCard = ({ accessory }) => {
  const { addToCart } = useCart();
  if (!accessory) return null;

  const image =
    accessory.images?.[0] ||
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart('accessory', accessory._id, '', 1, {
      name: accessory.name,
      image,
      price: accessory.price.current,
      mrp: accessory.price.mrp,
    });
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
      }}
      className="mobile-card"
    >
      <Link
        to={`/accessories/${accessory.slug}`}
        style={{
          padding: '1.25rem',
          background: 'var(--bg-secondary)',
          textAlign: 'center',
          display: 'block',
        }}
      >
        <img
          src={image}
          alt={accessory.name}
          loading="lazy"
          style={{
            height: '180px',
            width: '100%',
            objectFit: 'contain',
            margin: '0 auto',
          }}
        />
      </Link>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
            {accessory.type?.replace('_', ' ')}
          </span>
          <RatingStars rating={accessory.rating?.avg || 4.5} count={accessory.rating?.count || 0} size={13} />
        </div>

        <Link to={`/accessories/${accessory.slug}`} style={{ color: 'inherit' }}>
          <h4
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 700,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.5em',
              lineHeight: 1.3,
            }}
          >
            {accessory.name}
          </h4>
        </Link>

        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Brand: <strong>{accessory.brand}</strong>
        </span>

        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <PriceTag
            price={accessory.price.current}
            mrp={accessory.price.mrp}
            discountPercentage={accessory.price.discountPercentage}
            size="sm"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleAddToCart}
          icon={ShoppingBag}
          style={{ marginTop: '10px' }}
        >
          Add to Bag
        </Button>
      </div>
    </div>
  );
};

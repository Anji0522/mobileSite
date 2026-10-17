import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeftRight, Check, Zap } from 'lucide-react';
import { PriceTag } from './PriceTag.jsx';
import { RatingStars } from './RatingStars.jsx';
import { Button } from './Button.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useCompare } from '../../context/CompareContext.jsx';

export const MobileCard = ({ mobile }) => {
  const { addToCart } = useCart();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  if (!mobile) return null;

  const inCompare = isInCompare(mobile._id || mobile.slug);
  const primaryImage =
    mobile.images?.[0] ||
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80';

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(mobile._id || mobile.slug);
    } else {
      addToCompare(mobile);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = mobile.variants?.[0];
    addToCart('mobile', mobile._id, defaultVariant?.sku, 1, {
      name: mobile.name,
      image: primaryImage,
      price: mobile.price.current,
      mrp: mobile.price.mrp,
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
        position: 'relative',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
      }}
      className="mobile-card"
    >
      {/* Top badges */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {mobile.isDeal && (
          <span className="badge badge-accent" style={{ boxShadow: 'var(--shadow-sm)' }}>
            🔥 Deal of Day
          </span>
        )}
        {mobile.specs?.network?.has5G && (
          <span className="badge badge-primary" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <Zap size={10} /> 5G India
          </span>
        )}
      </div>

      {/* Compare Toggle Button on top right */}
      <button
        onClick={handleCompareClick}
        title={inCompare ? 'Remove from Compare' : 'Add to Compare'}
        aria-label={`Compare ${mobile.name}`}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 2,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: inCompare ? 'var(--color-primary)' : 'var(--bg-card)',
          color: inCompare ? '#FFFFFF' : 'var(--text-secondary)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        {inCompare ? <Check size={16} /> : <ArrowLeftRight size={15} />}
      </button>

      {/* Image with Link */}
      <Link
        to={`/mobiles/${mobile.slug}`}
        style={{
          display: 'block',
          padding: '1.5rem 1rem 1rem 1rem',
          background: 'var(--bg-secondary)',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={primaryImage}
          alt={mobile.name}
          loading="lazy"
          style={{
            height: '210px',
            width: '100%',
            objectFit: 'contain',
            margin: '0 auto',
            transition: 'transform var(--transition-normal)',
          }}
          className="mobile-card-img"
        />
      </Link>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              letterSpacing: '0.05em',
            }}
          >
            {mobile.brandName}
          </span>
          <RatingStars rating={mobile.rating?.avg || 4.5} count={mobile.rating?.count || 0} size={14} />
        </div>

        <Link to={`/mobiles/${mobile.slug}`} style={{ color: 'inherit' }}>
          <h3
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 700,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6em',
              lineHeight: 1.3,
            }}
          >
            {mobile.name}
          </h3>
        </Link>

        {/* Key Specs Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
          {mobile.specs?.performance?.processor && (
            <span
              style={{
                fontSize: '11px',
                background: 'var(--bg-tertiary)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                maxWidth: '180px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              ⚙️ {mobile.specs.performance.processor.split('(')[0]}
            </span>
          )}
          {mobile.specs?.battery?.capacity && (
            <span
              style={{
                fontSize: '11px',
                background: 'var(--bg-tertiary)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
              }}
            >
              🔋 {mobile.specs.battery.capacity.split(' ')[0]} mAh
            </span>
          )}
          {mobile.specs?.camera?.rear && (
            <span
              style={{
                fontSize: '11px',
                background: 'var(--bg-tertiary)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
              }}
            >
              📸 {mobile.specs.camera.rear.split('+')[0]}
            </span>
          )}
        </div>

        {/* Pricing */}
        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <PriceTag
            price={mobile.price.current}
            mrp={mobile.price.mrp}
            discountPercentage={mobile.price.discountPercentage}
            priceUpdatedAt={mobile.priceUpdatedAt}
            size="md"
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            icon={ShoppingBag}
            style={{ flex: 1 }}
          >
            Add to Bag
          </Button>
          <Button
            as={Link}
            to={`/mobiles/${mobile.slug}`}
            variant="secondary"
            size="sm"
            style={{ padding: '6px 10px' }}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const PriceTag = ({
  price,
  mrp,
  discountPercentage,
  size = 'md',
  priceUpdatedAt,
  showDiscount = true,
  isDeal = false,
}) => {
  const currentPrice = price || 0;
  const originalMrp = mrp || currentPrice;
  const discount =
    discountPercentage !== undefined && discountPercentage !== null
      ? discountPercentage
      : originalMrp > currentPrice
      ? Math.round(((originalMrp - currentPrice) / originalMrp) * 100)
      : 0;

  const fontSizes = {
    sm: { price: 'var(--font-size-sm)', mrp: 'var(--font-size-xs)' },
    md: { price: 'var(--font-size-lg)', mrp: 'var(--font-size-xs)' },
    lg: { price: 'var(--font-size-2xl)', mrp: 'var(--font-size-sm)' },
  };

  const getUpdatedAgoText = (dateStr) => {
    if (!dateStr) return null;
    const diffHours = Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60)));
    if (diffHours < 24) {
      return `Price updated ${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(diffHours / 24);
    return `Price updated ${days} day${days > 1 ? 's' : ''} ago`;
  };

  const updatedText = priceUpdatedAt ? getUpdatedAgoText(priceUpdatedAt) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: fontSizes[size].price,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {formatINR(currentPrice)}
        </span>

        {originalMrp > currentPrice && (
          <span
            style={{
              fontSize: fontSizes[size].mrp,
              color: 'var(--text-muted)',
              textDecoration: 'line-through',
            }}
          >
            {formatINR(originalMrp)}
          </span>
        )}

        {showDiscount && discount > 0 && (
          <span
            className="badge badge-success"
            style={{
              fontSize: '11px',
              padding: '2px 6px',
            }}
          >
            {discount}% OFF
          </span>
        )}
      </div>

      {updatedText && (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
          ⚡ {updatedText}
        </span>
      )}
    </div>
  );
};

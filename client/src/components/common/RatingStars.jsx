import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export const RatingStars = ({ rating = 0, count = 0, size = 16, showCount = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.4;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: '#F59E0B' }}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} fill="#F59E0B" stroke="#F59E0B" />
        ))}
        {hasHalfStar && <StarHalf size={size} fill="#F59E0B" stroke="#F59E0B" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} stroke="var(--text-muted)" fill="none" />
        ))}
      </div>
      <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
        {rating.toFixed(1)}
      </span>
      {showCount && count > 0 && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          ({count.toLocaleString('en-IN')})
        </span>
      )}
    </div>
  );
};

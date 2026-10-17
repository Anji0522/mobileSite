import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton = () => (
  <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <Skeleton height="180px" borderRadius="var(--radius-md)" />
    <Skeleton width="40%" height="0.875rem" />
    <Skeleton width="85%" height="1.25rem" />
    <Skeleton width="60%" height="1rem" />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
      <Skeleton width="45%" height="1.5rem" />
      <Skeleton width="35%" height="2rem" borderRadius="var(--radius-sm)" />
    </div>
  </div>
);

export default Skeleton;

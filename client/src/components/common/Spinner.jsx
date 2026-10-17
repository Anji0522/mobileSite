import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 32, color = 'var(--color-primary)', label = 'Loading content...' }) => {
  return (
    <div
      role="status"
      aria-label={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '2rem',
      }}
    >
      <Loader2
        size={size}
        color={color}
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
};

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style = {} }) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

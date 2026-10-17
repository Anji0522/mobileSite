import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...style,
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: 'var(--font-size-xs)' },
    md: { padding: '10px 18px', fontSize: 'var(--font-size-sm)' },
    lg: { padding: '12px 24px', fontSize: 'var(--font-size-base)' },
  };

  const variants = {
    primary: {
      background: 'var(--color-primary)',
      color: '#FFFFFF',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      background: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
    },
    accent: {
      background: 'var(--color-accent)',
      color: '#0F172A',
      border: '1px solid transparent',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: '1.5px solid var(--color-primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'var(--color-danger)',
      color: '#FFFFFF',
      border: '1px solid transparent',
    },
  };

  const combinedStyle = {
    ...baseStyle,
    ...(sizes[size] || sizes.md),
    ...(variants[variant] || variants.primary),
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={combinedStyle}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
};

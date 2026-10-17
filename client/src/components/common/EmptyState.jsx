import React from 'react';
import { PackageSearch, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  icon: Icon = PackageSearch,
  title = 'No items found',
  message = 'We could not find any records matching your criteria. Try adjusting your filters or search keywords.',
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        border: '1px dashed var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--color-primary)',
        }}
      >
        <Icon size={32} />
      </div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: 'var(--font-size-lg)' }}>{title}</h3>
      <p style={{ maxWidth: '420px', marginBottom: actionText ? '1.5rem' : 0, color: 'var(--text-muted)' }}>
        {message}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'var(--color-danger-light)',
        border: '1px solid var(--color-danger)',
        borderRadius: 'var(--radius-lg)',
        margin: '1.5rem 0',
      }}
    >
      <AlertCircle size={40} color="var(--color-danger)" style={{ marginBottom: '1rem' }} />
      <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-danger)' }}>{title}</h3>
      <p style={{ maxWidth: '460px', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" icon={RefreshCw}>
          Retry
        </Button>
      )}
    </div>
  );
};

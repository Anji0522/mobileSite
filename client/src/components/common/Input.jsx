import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  error,
  helperText,
  required = false,
  className = '',
  style = {},
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(7)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '1rem' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 'var(--font-size-sm)',
          background: 'var(--bg-input)',
          color: 'var(--text-primary)',
          border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span
          id={`${inputId}-error`}
          role="alert"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-danger)',
            fontWeight: 500,
          }}
        >
          {error}
        </span>
      )}
      {!error && helperText && (
        <span
          id={`${inputId}-helper`}
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export const Select = ({
  label,
  id,
  options = [],
  error,
  helperText,
  required = false,
  className = '',
  style = {},
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(7)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '1rem' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        aria-invalid={!!error}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 'var(--font-size-sm)',
          background: 'var(--bg-input)',
          color: 'var(--text-primary)',
          border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          cursor: 'pointer',
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span
          id={`${selectId}-error`}
          role="alert"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-danger)',
            fontWeight: 500,
          }}
        >
          {error}
        </span>
      )}
      {!error && helperText && (
        <span
          id={`${selectId}-helper`}
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

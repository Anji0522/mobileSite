import React from 'react';

export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || name;

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '1rem' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '0.375rem',
            color: 'var(--text-primary)'
          }}
        >
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        style={{
          width: '100%',
          padding: '0.625rem 0.875rem',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          fontSize: '0.9375rem',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>

      {error ? (
        <p
          id={`${selectId}-error`}
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: 'var(--danger)',
            marginTop: '0.25rem',
            marginBottom: 0
          }}
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${selectId}-helper`}
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginTop: '0.25rem',
            marginBottom: 0
          }}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Select;

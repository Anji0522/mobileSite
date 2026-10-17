import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav
      aria-label="Breadcrumb navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0.75rem 0',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--text-secondary)',
        }}
      >
        <Home size={14} />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} color="var(--text-muted)" />
            {isLast || !item.to ? (
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  maxWidth: '200px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link to={item.to} style={{ color: 'var(--text-secondary)' }}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

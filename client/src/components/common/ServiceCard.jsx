import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { formatINR } from './PriceTag.jsx';
import { RatingStars } from './RatingStars.jsx';
import { Button } from './Button.jsx';

export const ServiceCard = ({ service, onBook }) => {
  if (!service) return null;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
      }}
      className="mobile-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          className="badge badge-primary"
          style={{ textTransform: 'capitalize', fontSize: 'var(--font-size-xs)' }}
        >
          <Wrench size={12} /> {service.category?.replace('_', ' ')}
        </span>
        <RatingStars rating={service.rating?.avg || 4.8} count={service.rating?.count || 10} size={14} />
      </div>

      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, lineHeight: 1.3 }}>
        {service.title}
      </h3>

      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}
      >
        {service.description}
      </p>

      {/* Badges: Time, Warranty, City */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
          <Clock size={14} color="var(--color-primary)" /> ~{service.estimatedHours} hrs repair
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}>
          <ShieldCheck size={14} color="var(--color-success)" /> {service.warrantyDays} days warranty
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
          <MapPin size={14} /> {service.city}
        </span>
      </div>

      {/* Price & Action */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Starting from</span>
          <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatINR(service.basePrice)}
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onBook?.(service)}
        >
          Book Repair
        </Button>
      </div>
    </div>
  );
};

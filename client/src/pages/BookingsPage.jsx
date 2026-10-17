import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Wrench, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { servicesAPI } from '../services/api.js';
import { formatINR } from '../components/common/PriceTag.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { Button } from '../components/common/Button.jsx';

export const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await servicesAPI.getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <Spinner label="Loading your repair appointments..." />;
  if (error) return <ErrorState message={error} onRetry={fetchBookings} />;

  return (
    <>
      <Helmet>
        <title>My Repair Bookings | MobiVerse India</title>
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '850px' }}>
        <Breadcrumbs items={[{ label: 'My Repair Bookings' }]} />

        <div style={{ padding: '1rem 0 2rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Doorstep Repair Bookings</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Track technician appointments for screen, battery, and logic board repairs
          </p>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No repair appointments scheduled"
            message="Have a cracked display or failing battery? Book certified doorstep repair with up to 180 days warranty."
            actionText="Browse Repair Services"
            onAction={() => (window.location.href = '/services')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map((b) => (
              <div
                key={b._id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>{b.service?.title}</h3>
                    <span className={`badge badge-${b.status === 'completed' ? 'success' : b.status === 'in_progress' ? 'accent' : 'primary'}`} style={{ textTransform: 'uppercase' }}>
                      {b.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {formatINR(b.finalPrice || b.estimatedPrice)}
                  </span>
                </div>

                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  <strong>Device:</strong> {b.deviceModel} • <strong>Issue:</strong> {b.issueDescription}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--color-primary)" />
                    {new Date(b.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="var(--color-primary)" />
                    {b.appointmentSlot}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="var(--color-primary)" />
                    {b.serviceAddress?.street}, {b.serviceAddress?.city}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

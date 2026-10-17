import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { accessoriesAPI } from '../services/api.js';
import { AccessoryCard } from '../components/common/AccessoryCard.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';

const ACCESSORY_TYPES = [
  { label: 'All Accessories', value: '' },
  { label: 'Cases & Covers', value: 'case' },
  { label: 'Screen Protectors', value: 'screen_guard' },
  { label: 'Fast GaN Chargers', value: 'charger' },
  { label: 'Braided Cables', value: 'cable' },
  { label: 'TWS ANC Earbuds', value: 'earbuds' },
  { label: 'Power Banks', value: 'power_bank' },
];

export const AccessoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [accessories, setAccessories] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedType = searchParams.get('type') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchAccessories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await accessoriesAPI.getAll({
        type: selectedType,
        page: currentPage,
        limit: 12,
      });
      setAccessories(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      setError(err.message || 'Failed to load accessories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, [selectedType, currentPage]);

  const handleTypeChange = (typeVal) => {
    const next = new URLSearchParams(searchParams);
    if (typeVal) next.set('type', typeVal);
    else next.delete('type');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Mobile Accessories in India - Cases, Chargers, Protectors & Earbuds | MobiVerse</title>
        <meta
          name="description"
          content="Shop 600+ mobile phone accessories designed specifically for Samsung, Apple, OnePlus, Xiaomi, Realme, and Vivo phones in India. GaN fast chargers, tempered glass, and military drop cases."
        />
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumbs items={[{ label: 'Accessories' }]} />

        <div style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Mobile Accessories</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            High performance cases, tempered glass, certified GaN chargers, and wireless audio
          </p>

          {/* Type Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '1rem', scrollbarWidth: 'thin' }}>
            {ACCESSORY_TYPES.map((t) => {
              const isActive = selectedType === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    background: isActive ? 'var(--color-primary)' : 'var(--bg-secondary)',
                    color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading && <Spinner label="Loading accessories catalogue..." />}

        {error && <ErrorState message={error} onRetry={fetchAccessories} />}

        {!loading && !error && accessories.length === 0 && (
          <EmptyState
            title="No accessories found"
            message="No accessories match your selected category. Try selecting another accessory type."
            actionText="View All Accessories"
            onAction={() => handleTypeChange('')}
          />
        )}

        {!loading && !error && accessories.length > 0 && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {accessories.map((acc) => (
                <AccessoryCard key={acc._id} accessory={acc} />
              ))}
            </div>

            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </>
  );
};

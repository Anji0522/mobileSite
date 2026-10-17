import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { brandsAPI } from '../services/api.js';
import { MobileCard } from '../components/common/MobileCard.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';

export const BrandsPage = () => {
  const { brand: brandSlug } = useParams();

  const [brands, setBrands] = useState([]);
  const [selectedBrandData, setSelectedBrandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (brandSlug) {
        const res = await brandsAPI.getBySlug(brandSlug);
        setSelectedBrandData(res.data);
      } else {
        const res = await brandsAPI.getAll();
        setBrands(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load brand data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [brandSlug]);

  if (loading) return <Spinner label="Loading brand catalogue..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  // Single Brand View
  if (brandSlug && selectedBrandData?.brand) {
    const { brand, mobiles = [] } = selectedBrandData;
    return (
      <>
        <Helmet>
          <title>{brand.name} Mobiles in India - Price, Specs, Best Offers | MobiVerse</title>
          <meta
            name="description"
            content={`Explore all ${brand.name} mobile phones available in India. Compare prices, official specs, launch dates, and customer ratings.`}
          />
        </Helmet>

        <div className="container" style={{ paddingTop: '1.5rem' }}>
          <Breadcrumbs
            items={[
              { label: 'Brands', to: '/brands' },
              { label: brand.name },
            ]}
          />

          {/* Brand Header Banner */}
          <div
            style={{
              padding: '2.5rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              marginBottom: '2.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}
          >
            <div style={{ maxWidth: '650px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-primary">{brand.country}</span>
                {brand.establishedYear && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Est. {brand.establishedYear}</span>
                )}
                {brand.name === 'Lava' && (
                  <span className="badge badge-accent">🇮🇳 Make in India Certified</span>
                )}
              </div>
              <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{brand.name} Smartphones</h1>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                {brand.description}
              </p>
            </div>

            <div style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '1.25rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
                {mobiles.length}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Mobiles Available</div>
            </div>
          </div>

          {/* Mobiles List */}
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.5rem' }}>
            All {brand.name} Phones in India
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {mobiles.map((mobile) => (
              <MobileCard key={mobile._id} mobile={mobile} />
            ))}
          </div>
        </div>
      </>
    );
  }

  // Brands Index View
  return (
    <>
      <Helmet>
        <title>All Smartphone Brands in India | MobiVerse India</title>
        <meta
          name="description"
          content="Browse verified smartphones across all 16 major mobile brands sold in India: Samsung, Apple, OnePlus, Xiaomi, Realme, Vivo, Oppo, Motorola, Nothing, Google, Lava and more."
        />
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumbs items={[{ label: 'Brands' }]} />

        <div style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Smartphone Brands in India</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Choose a brand to discover all current models, specifications, and authorized seller deals
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {brands.map((b) => (
            <Link
              key={b._id}
              to={`/brands/${b.slug}`}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
              }}
              className="mobile-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>{b.name}</h3>
                <span className="badge badge-neutral">{b.country}</span>
              </div>
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-muted)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.5,
                }}
              >
                {b.description}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '10px', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 700 }}>
                Explore {b.name} Phones →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

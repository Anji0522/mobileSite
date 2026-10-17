import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { mobilesAPI } from '../services/api.js';
import { MobileCard } from '../components/common/MobileCard.jsx';
import { FilterSidebar } from '../components/common/FilterSidebar.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { Button } from '../components/common/Button.jsx';

export const MobilesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [mobiles, setMobiles] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract current filters from URL params
  const currentFilters = {
    q: searchParams.get('q') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    ram: searchParams.get('ram') || '',
    storage: searchParams.get('storage') || '',
    has5G: searchParams.get('has5G') || '',
    isDeal: searchParams.get('isDeal') || '',
    sort: searchParams.get('sort') || 'popular',
    page: parseInt(searchParams.get('page') || '1', 10),
  };

  const fetchMobiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mobilesAPI.getAll({
        ...currentFilters,
        limit: 12,
      });
      setMobiles(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      setError(err.message || 'Failed to load mobiles.');
    } finally {
      setLoading(false);
    }
  }, [searchParams.toString()]);

  useEffect(() => {
    fetchMobiles();
  }, [fetchMobiles]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value !== '' && value !== null && value !== undefined) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
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
        <title>All Mobiles in India - Compare Prices & Specs | MobiVerse India</title>
        <meta
          name="description"
          content="Explore 100+ smartphones available in India across Samsung, Apple, OnePlus, Xiaomi, Realme, Vivo, Lava and more. Filter by 5G, RAM, price, and compare side by side."
        />
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumbs items={[{ label: 'Mobiles' }]} />

        {/* Header & Controls Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1.25rem 0',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
              Mobile Phones in India
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Showing {mobiles.length} of {meta.total} verified smartphones
              {currentFilters.q && ` for "${currentFilters.q}"`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mobile Filter Toggle */}
            <Button
              variant="secondary"
              size="sm"
              icon={SlidersHorizontal}
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="mobile-filter-btn"
            >
              Filters
            </Button>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={16} color="var(--text-muted)" />
              <select
                value={currentFilters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                aria-label="Sort mobiles by"
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest Launches</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }} className="mobiles-layout">
          {/* Desktop Filter Sidebar */}
          <div className="desktop-filter-col">
            <FilterSidebar
              filters={currentFilters}
              onFilterChange={updateFilter}
              onReset={handleResetFilters}
            />
          </div>

          {/* Mobiles Grid */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loading && <Spinner label="Loading smartphones..." />}

            {error && <ErrorState message={error} onRetry={fetchMobiles} />}

            {!loading && !error && mobiles.length === 0 && (
              <EmptyState
                title="No mobiles found"
                message="We couldn't find any phone matching your selected filters or search keyword. Try clearing some filters."
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            )}

            {!loading && !error && mobiles.length > 0 && (
              <>
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

                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

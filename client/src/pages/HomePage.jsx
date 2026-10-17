import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
  Truck,
  Wrench,
  Percent,
  Sparkles,
  Award,
} from 'lucide-react';
import { mobilesAPI, brandsAPI } from '../services/api.js';
import { MobileCard } from '../components/common/MobileCard.jsx';
import { Button } from '../components/common/Button.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';

export const HomePage = () => {
  const [deals, setDeals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newLaunches, setNewLaunches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [featRes, brandRes] = await Promise.all([
        mobilesAPI.getFeatured(),
        brandsAPI.getAll(),
      ]);
      setDeals(featRes.data?.deals || []);
      setTrending(featRes.data?.trending || []);
      setNewLaunches(featRes.data?.newLaunches || []);
      setBrands(brandRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load home page content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>MobiVerse India - One-Stop Marketplace for Mobiles & Accessories in India</title>
        <meta
          name="description"
          content="Browse, compare, and buy every mobile phone and accessory sold in India. Official brand specs, fresh live prices, doorstep repair bookings, and secure Razorpay payment."
        />
        <link rel="canonical" href="https://mobiverse.in/" />
      </Helmet>

      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)',
          padding: '3.5rem 0',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center', gap: '2.5rem' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: 'var(--font-size-xs)',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={14} /> Shop On Your Fingertips • 100% Indian Catalogue
            </div>

            <h1
              style={{
                fontSize: 'var(--font-size-4xl)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
              }}
            >
              Every Mobile Phone in India,{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                In One Place.
              </span>
            </h1>

            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
              Compare full verified specifications across 16+ brands, find the lowest live Indian seller prices, customize accessories, and book certified doorstep repairs.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Button as={Link} to="/mobiles" variant="primary" size="lg" icon={ArrowRight}>
                Explore 100+ Mobiles
              </Button>
              <Button as={Link} to="/compare" variant="secondary" size="lg" icon={Smartphone}>
                Compare Phones
              </Button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={16} color="var(--color-success)" /> 100% Genuine Warranty
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                <Zap size={16} color="var(--color-accent)" /> 5G Bands Tested in India
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                <Truck size={16} color="var(--color-primary)" /> Express Delivery
              </div>
            </div>
          </div>

          {/* Hero Visual Card Showcase */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)',
                textAlign: 'center',
              }}
            >
              <span className="badge badge-accent" style={{ marginBottom: '1rem' }}>
                ⭐ India's #1 Flagship
              </span>
              <img
                src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80"
                alt="Samsung Galaxy S24 Ultra Flagship"
                style={{ height: '240px', objectFit: 'contain', margin: '0 auto 1rem auto' }}
              />
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>Samsung Galaxy S24 Ultra 5G</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: '4px 0 12px 0' }}>
                Snapdragon 8 Gen 3 • 200MP Quad Camera • S-Pen • Galaxy AI
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ₹1,19,999
                </span>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  ₹1,34,999
                </span>
                <span className="badge badge-success">11% OFF</span>
              </div>
              <Button as={Link} to="/mobiles/samsung-galaxy-s24-ultra-5g" variant="primary" style={{ width: '100%', marginTop: '1rem' }}>
                View Full Specifications
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Strip Section */}
      <section style={{ padding: '2.5rem 0', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>Browse by Brand</h2>
            <Link to="/brands" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              View All 16 Brands →
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'thin',
            }}
          >
            {brands.slice(0, 14).map((b) => (
              <Link
                key={b._id}
                to={`/brands/${b.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 18px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  minWidth: '100px',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-xs)',
                  transition: 'all var(--transition-fast)',
                  flexShrink: 0,
                }}
                className="brand-pill"
              >
                <span>{b.name}</span>
                {b.name === 'Lava' && (
                  <span style={{ fontSize: '9px', color: 'var(--color-india-saffron)', fontWeight: 800 }}>
                    🇮🇳 Made in India
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Areas */}
      <div className="container" style={{ paddingTop: '3rem' }}>
        {loading && <Spinner label="Loading fresh Indian catalogue..." />}

        {error && <ErrorState message={error} onRetry={fetchData} />}

        {!loading && !error && (
          <>
            {/* Trending Phones in India */}
            <section style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>🔥 Trending in India</h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    Most viewed and highest rated mobiles by Indian tech enthusiasts this week
                  </p>
                </div>
                <Link to="/mobiles?sort=popular" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                  View All Trending →
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {trending.slice(0, 4).map((mobile) => (
                  <MobileCard key={mobile._id} mobile={mobile} />
                ))}
              </div>
            </section>

            {/* Deals of the Day Banner */}
            <section
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                marginBottom: '3.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                alignItems: 'center',
                gap: '2rem',
              }}
            >
              <div>
                <span className="badge badge-accent" style={{ marginBottom: '1rem', color: '#0F172A' }}>
                  <Percent size={14} /> Mega Savings Festival
                </span>
                <h2 style={{ fontSize: 'var(--font-size-3xl)', color: '#FFFFFF', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Unbeatable Mobile Deals
                </h2>
                <p style={{ color: '#E2E8F0', marginBottom: '1.5rem', fontSize: 'var(--font-size-base)' }}>
                  Save up to 35% on genuine flagship killers, monster 6000mAh batteries, and curved 120Hz AMOLED smartphones.
                </p>
                <Button as={Link} to="/mobiles?isDeal=true" variant="accent" size="lg">
                  Shop All Deals
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Under ₹15k</div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1' }}>Budget 5G heroes</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>₹15k - ₹30k</div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1' }}>Mid-range kings</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>₹50k+</div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1' }}>Ultra flagships</div>
                </div>
              </div>
            </section>

            {/* Special Deals Grid */}
            <section style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>⚡ Handpicked Value Deals</h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    Price drops tracked and updated regularly via our live price-sync service
                  </p>
                </div>
                <Link to="/mobiles?isDeal=true" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                  See All Offers →
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {deals.slice(0, 4).map((mobile) => (
                  <MobileCard key={mobile._id} mobile={mobile} />
                ))}
              </div>
            </section>

            {/* New Launches */}
            <section style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>✨ Latest Launches in India</h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    Fresh arrivals with verified Indian specifications and retail pricing
                  </p>
                </div>
                <Link to="/mobiles?sort=newest" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                  View All New Launches →
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {newLaunches.slice(0, 4).map((mobile) => (
                  <MobileCard key={mobile._id} mobile={mobile} />
                ))}
              </div>
            </section>

            {/* Doorstep Repair Service Highlight */}
            <section
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '2.5rem',
                marginBottom: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                alignItems: 'center',
                gap: '2rem',
              }}
            >
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
                  <Wrench size={14} /> MobiVerse Care
                </span>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: '0.75rem' }}>
                  Doorstep Mobile Screen & Battery Repairs
                </h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Cracked screen or quick-draining battery? Book a certified engineer to repair your smartphone right at your doorstep or office across Bengaluru, Mumbai, Delhi-NCR, Hyderabad, and Pune. 100% genuine parts with up to 180 days warranty.
                </p>
                <Button as={Link} to="/services" variant="primary" icon={Wrench}>
                  Book Doorstep Repair
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '24px' }}>📱</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Genuine Display Replacement</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>From ₹2,499 with 90 days warranty</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '24px' }}>🔋</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Original Battery Swap</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>From ₹1,499 with 180 days warranty</div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
};

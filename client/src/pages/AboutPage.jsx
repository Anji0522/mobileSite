import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Smartphone, Target, Shield, HeartHandshake, Award } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { Button } from '../components/common/Button.jsx';

export const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About MobiVerse India - Shop on Your Fingertips</title>
        <meta
          name="description"
          content="Learn about MobiVerse India's mission to be the single trusted marketplace and verified catalogue for every mobile phone and accessory in India."
        />
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '860px' }}>
        <Breadcrumbs items={[{ label: 'About Us' }]} />

        <div style={{ padding: '2rem 0' }}>
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
            Our Mission & Story
          </span>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Empowering Every Indian with the Right Smartphone at Honest Prices.
          </h1>
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            MobiVerse India was conceived with a clear vision: Indian consumers were tired of jumping across ten fragmented websites, confusing specs tables, and misleading pricing. We built a single unified home for every phone sold in the Indian subcontinent: "Shop on your fingertips."
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              margin: '2.5rem 0',
            }}
          >
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Target size={28} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>Single Trusted Catalogue</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                Every phone sold in India across budget, mid-range, and ultra-flagship segments with verified Indian 5G band support.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Shield size={28} color="var(--color-success)" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>PCI-DSS Safe Payments</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                Strict PCI-DSS compliance using Razorpay. We never store customer card details, CVVs, or UPI PINs.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <HeartHandshake size={28} color="var(--color-accent)" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>Local Indian Repair Network</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                Empowering authorized local service providers and certified doorstep engineers across Tier-1 and Tier-2 Indian cities.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '8px' }}>
              Ready to find your next mobile?
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Browse over 100+ verified phones with live Indian prices and side-by-side comparison.
            </p>
            <Button as={Link} to="/mobiles" variant="primary" size="lg">
              Explore Mobiles Catalogue
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | MobiVerse India</title>
      </Helmet>
      <div
        className="container"
        style={{
          padding: '6rem 1rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: '72px', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.05em' }}>
          404
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: '8px 0' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '2rem' }}>
          The mobile phone page, accessory, or service you are searching for might have been moved or does not exist.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button as={Link} to="/" variant="primary">
            Return to Home
          </Button>
          <Button as={Link} to="/mobiles" variant="secondary">
            Browse Mobiles
          </Button>
        </div>
      </div>
    </>
  );
};

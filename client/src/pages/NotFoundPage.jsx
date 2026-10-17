import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Search, Smartphone } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';

export const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | MobiVerse India</title>
        <meta name="description" content="The page you are looking for does not exist on MobiVerse India." />
      </Helmet>

      <div
        className="container"
        style={{
          minHeight: '65vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '3rem 1rem'
        }}
      >
        <div
          style={{
            fontSize: 'clamp(4rem, 12vw, 8rem)',
            fontWeight: 900,
            color: 'var(--color-primary)',
            lineHeight: 1,
            marginBottom: '1rem',
            letterSpacing: '-2px'
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '1rem' }}>
          Page Not Found
        </h1>
        <p
          style={{
            maxWidth: '520px',
            color: 'var(--text-muted)',
            marginBottom: '2rem',
            fontSize: 'var(--font-size-md)'
          }}
        >
          Oops! The phone, accessory, or page you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/">
            <Button variant="primary" icon={Home}>
              Back to Home
            </Button>
          </Link>
          <Link to="/mobiles">
            <Button variant="outline" icon={Smartphone}>
              Browse Mobiles
            </Button>
          </Link>
          <Link to="/compare">
            <Button variant="ghost" icon={Search}>
              Compare Phones
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;

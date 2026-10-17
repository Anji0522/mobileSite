import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { accessoriesAPI } from '../services/api.js';
import { PriceTag, formatINR } from '../components/common/PriceTag.jsx';
import { RatingStars } from '../components/common/RatingStars.jsx';
import { Button } from '../components/common/Button.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { useCart } from '../context/CartContext.jsx';

export const AccessoryDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [accessory, setAccessory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await accessoriesAPI.getBySlug(slug);
      setAccessory(res.data);
    } catch (err) {
      setError(err.message || 'Accessory not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) return <Spinner label="Loading accessory details..." />;
  if (error || !accessory) return <ErrorState message={error || 'Not found'} onRetry={fetchDetail} />;

  const handleAddToCart = () => {
    addToCart('accessory', accessory._id, '', 1, {
      name: accessory.name,
      image: accessory.images[0],
      price: accessory.price.current,
      mrp: accessory.price.mrp,
    });
  };

  return (
    <>
      <Helmet>
        <title>{accessory.name} - Buy Online in India | MobiVerse</title>
        <meta
          name="description"
          content={`Buy ${accessory.name} at best price in India ₹${accessory.price.current}. Official brand accessory with India warranty.`}
        />
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumbs
          items={[
            { label: 'Accessories', to: '/accessories' },
            { label: accessory.name },
          ]}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            padding: '2rem 0',
          }}
        >
          {/* Image */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '340px',
            }}
          >
            <img
              src={accessory.images[0]}
              alt={accessory.name}
              style={{ maxHeight: '300px', maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span className="badge badge-neutral" style={{ textTransform: 'capitalize', marginBottom: '8px' }}>
                {accessory.type?.replace('_', ' ')}
              </span>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
                {accessory.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <RatingStars rating={accessory.rating?.avg || 4.5} count={accessory.rating?.count || 0} size={15} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                  • In Stock
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <PriceTag
                price={accessory.price.current}
                mrp={accessory.price.mrp}
                discountPercentage={accessory.price.discountPercentage}
                size="lg"
              />
            </div>

            {/* Compatible Mobiles list */}
            {accessory.compatibleMobiles?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '8px' }}>
                  Compatible Smartphone Models
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {accessory.compatibleMobiles.map((mob) => (
                    <Link
                      key={mob._id}
                      to={`/mobiles/${mob.slug}`}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                      }}
                    >
                      {mob.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              icon={ShoppingBag}
              onClick={handleAddToCart}
            >
              Add to Bag • {formatINR(accessory.price.current)}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

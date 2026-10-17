import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBag,
  ArrowLeftRight,
  ShieldCheck,
  Truck,
  Zap,
  Check,
  Star,
  MessageSquare,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { mobilesAPI, reviewsAPI } from '../services/api.js';
import { Carousel } from '../components/common/Carousel.jsx';
import { PriceTag, formatINR } from '../components/common/PriceTag.jsx';
import { RatingStars } from '../components/common/RatingStars.jsx';
import { Button } from '../components/common/Button.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { AccessoryCard } from '../components/common/AccessoryCard.jsx';
import { MobileCard } from '../components/common/MobileCard.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const MobileDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchMobileDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mobilesAPI.getBySlug(slug);
      setData(res.data);
      if (res.data?.mobile?.variants?.length > 0) {
        setSelectedVariant(res.data.mobile.variants[0]);
      }
    } catch (err) {
      setError(err.message || 'Mobile not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMobileDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) return <Spinner label="Loading mobile specifications & seller deals..." />;
  if (error || !data?.mobile) return <ErrorState message={error || 'Product not found'} onRetry={fetchMobileDetail} />;

  const { mobile, accessories = [], similarMobiles = [], reviews = [] } = data;
  const inCompare = isInCompare(mobile._id || mobile.slug);

  const activePrice = selectedVariant ? selectedVariant.price : mobile.price.current;
  const activeMrp = selectedVariant ? selectedVariant.mrp : mobile.price.mrp;

  const handleAddToCart = () => {
    addToCart('mobile', mobile._id, selectedVariant?.sku, 1, {
      name: `${mobile.name} ${selectedVariant ? `(${selectedVariant.ram}/${selectedVariant.storage}, ${selectedVariant.color})` : ''}`,
      image: selectedVariant?.image || mobile.images[0],
      price: activePrice,
      mrp: activeMrp,
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please log in to submit a verified product review.');
      return;
    }
    if (!newReviewComment.trim() || newReviewComment.length < 5) {
      toast.error('Review comment must be at least 5 characters long.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await reviewsAPI.create({
        itemType: 'mobile',
        itemId: mobile._id,
        rating: newReviewRating,
        comment: newReviewComment.trim(),
      });
      toast.success('Thank you! Your verified review has been posted.');
      setIsReviewModalOpen(false);
      setNewReviewComment('');
      fetchMobileDetail();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Structured JSON-LD Product Schema for SEO
  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: mobile.name,
    image: mobile.images,
    description: mobile.seo?.description || `${mobile.name} with full official specifications and India warranty`,
    brand: {
      '@type': 'Brand',
      name: mobile.brandName,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: activePrice,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'MobiVerse India Verified Partner',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: mobile.rating?.avg || 4.5,
      reviewCount: mobile.rating?.count || 10,
    },
  };

  return (
    <>
      <Helmet>
        <title>{mobile.name} - Price in India, Full Specs, Offers | MobiVerse</title>
        <meta
          name="description"
          content={`Check ${mobile.name} best price in India ₹${activePrice.toLocaleString('en-IN')}. ${mobile.specs?.display?.size} display, ${mobile.specs?.performance?.processor}, ${mobile.specs?.camera?.rear} camera, and verified seller offers.`}
        />
        <link rel="canonical" href={`https://mobiverse.in/mobiles/${mobile.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLdProduct)}</script>
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumbs
          items={[
            { label: 'Mobiles', to: '/mobiles' },
            { label: mobile.brandName, to: `/brands/${mobile.brandName.toLowerCase()}` },
            { label: mobile.name },
          ]}
        />

        {/* Top Product Showcase (Gallery + Info) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            padding: '2rem 0',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {/* Left: Interactive Carousel */}
          <div>
            <Carousel images={mobile.images} alt={mobile.name} />
          </div>

          {/* Right: Product Actions & Specs Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-primary">{mobile.brandName}</span>
                {mobile.specs?.network?.has5G && <span className="badge badge-accent">5G Ready India</span>}
                {mobile.isDeal && <span className="badge badge-danger">Price Drop Deal</span>}
              </div>

              <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, lineHeight: 1.2 }}>
                {mobile.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <RatingStars rating={mobile.rating?.avg || 4.5} count={mobile.rating?.count || 0} size={16} />
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                  In Stock & Verified by MobiVerse
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
              }}
            >
              <PriceTag
                price={activePrice}
                mrp={activeMrp}
                priceUpdatedAt={mobile.priceUpdatedAt}
                size="lg"
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                Inclusive of all Indian taxes (18% GST). Free shipping nationwide.
              </span>
            </div>

            {/* RAM / Storage / Colour Variants */}
            {mobile.variants?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '8px' }}>
                  Select Configuration & Color
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {mobile.variants.map((v) => {
                    const isSelected = selectedVariant?.sku === v.sku;
                    return (
                      <button
                        key={v.sku}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                          background: isSelected ? 'var(--color-primary-light)' : 'var(--bg-card)',
                          color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: 'var(--font-size-xs)',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: v.colorHex || '#333',
                            border: '1px solid rgba(0,0,0,0.2)',
                          }}
                        />
                        <span>{v.ram}/{v.storage}</span>
                        <span>•</span>
                        <span>{v.color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Highlights Fast Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                padding: '12px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Display</span>
                <strong>{mobile.specs?.display?.size} {mobile.specs?.display?.refreshRate}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Processor</span>
                <strong>{mobile.specs?.performance?.processor?.split('(')[0]}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Rear Camera</span>
                <strong>{mobile.specs?.camera?.rear?.split('+')[0]}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Battery & Speed</span>
                <strong>{mobile.specs?.battery?.capacity} ({mobile.specs?.battery?.fastCharging?.split('(')[0]})</strong>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem' }}>
              <Button
                variant="primary"
                size="lg"
                icon={ShoppingBag}
                onClick={handleAddToCart}
                style={{ flex: 1 }}
              >
                Add to Cart • {formatINR(activePrice)}
              </Button>

              <Button
                variant={inCompare ? 'accent' : 'secondary'}
                size="lg"
                icon={inCompare ? Check : ArrowLeftRight}
                onClick={() => {
                  if (inCompare) removeFromCompare(mobile._id || mobile.slug);
                  else addToCompare(mobile);
                }}
              >
                {inCompare ? 'In Compare' : 'Compare'}
              </Button>
            </div>
          </div>
        </div>

        {/* Indian Sellers Comparison Section */}
        {mobile.sellers?.length > 0 && (
          <section style={{ padding: '2.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1rem' }}>
              Compare Verified Sellers & Offers in India
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mobile.sellers.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{s.sellerName}</span>
                      {s.badge && <span className="badge badge-success">{s.badge}</span>}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                      ⭐ {s.rating} Rating • Delivery in {s.deliveryDays} day{s.deliveryDays > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>{formatINR(s.price)}</span>
                      {s.mrp > s.price && (
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {formatINR(s.mrp)}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        addToCart('mobile', mobile._id, selectedVariant?.sku, 1, {
                          name: `${mobile.name} (Sold by ${s.sellerName})`,
                          image: mobile.images[0],
                          price: s.price,
                          mrp: s.mrp,
                        });
                      }}
                    >
                      Buy from Seller
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comprehensive Full Specifications Table */}
        <section style={{ padding: '2.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.5rem' }}>
            Full Specifications & Technical Details
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Display & Build */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '10px' }}>
                🖥️ Display & Design
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Screen Size:</span> {mobile.specs?.display?.size}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Display Type:</span> {mobile.specs?.display?.type}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Refresh Rate:</span> {mobile.specs?.display?.refreshRate}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Resolution:</span> {mobile.specs?.display?.resolution}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Peak Brightness:</span> {mobile.specs?.display?.peakBrightness}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Glass Protection:</span> {mobile.specs?.display?.protection}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Dimensions & Weight:</span> {mobile.specs?.design?.dimensions}, {mobile.specs?.design?.weight}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Water Resistance:</span> {mobile.specs?.design?.ipRating}</div>
              </div>
            </div>

            {/* Performance & Memory */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '10px' }}>
                ⚙️ Processor & Memory
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Processor:</span> {mobile.specs?.performance?.processor}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Chipset:</span> {mobile.specs?.performance?.chipset}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>GPU:</span> {mobile.specs?.performance?.gpu}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>AnTuTu Score:</span> {mobile.specs?.performance?.antutuScore?.toLocaleString('en-IN')} points</div>
                <div><span style={{ color: 'var(--text-muted)' }}>RAM & Type:</span> {mobile.specs?.memory?.ram} ({mobile.specs?.memory?.ramType})</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Storage & Type:</span> {mobile.specs?.memory?.storage} ({mobile.specs?.memory?.storageType})</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Expandable Storage:</span> {mobile.specs?.memory?.expandable}</div>
              </div>
            </div>

            {/* Camera */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '10px' }}>
                📸 Camera Capabilities
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Rear Cameras:</span> {mobile.specs?.camera?.rear}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Features:</span> {mobile.specs?.camera?.rearFeatures}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Front Camera:</span> {mobile.specs?.camera?.front}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Video Recording:</span> {mobile.specs?.camera?.videoRecording}</div>
              </div>
            </div>

            {/* Battery & Network */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '10px' }}>
                🔋 Battery & Indian 5G Network
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Battery Capacity:</span> {mobile.specs?.battery?.capacity}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Fast Charging:</span> {mobile.specs?.battery?.fastCharging}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Wireless Charging:</span> {mobile.specs?.battery?.wirelessCharging}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Charger in Box:</span> {mobile.specs?.battery?.chargerInBox ? 'Yes' : 'No'}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>5G Indian Bands:</span> {mobile.specs?.network?.bands5G}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>OS & Updates:</span> {mobile.specs?.os?.version} • {mobile.specs?.os?.promisedUpdates}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Compatible Accessories Section */}
        {accessories.length > 0 && (
          <section style={{ padding: '2.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.5rem' }}>
              Tailored Accessories for {mobile.name}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {accessories.map((acc) => (
                <AccessoryCard key={acc._id} accessory={acc} />
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        <section style={{ padding: '2.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Customer Reviews & Ratings</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <RatingStars rating={mobile.rating?.avg || 4.5} count={mobile.rating?.count || 0} size={18} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Based on verified Indian purchases
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={MessageSquare}
              onClick={() => setIsReviewModalOpen(true)}
            >
              Write a Review
            </Button>
          </div>

          {reviews.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                No reviews yet for this mobile. Be the first Indian buyer to share your hands-on feedback!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    padding: '1.25rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{rev.userName}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>
                          <CheckCircle2 size={10} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <RatingStars rating={rev.rating} count={0} showCount={false} size={14} />
                  </div>
                  {rev.title && <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>{rev.title}</div>}
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Similar Phones in this Segment */}
        {similarMobiles.length > 0 && (
          <section style={{ padding: '2.5rem 0' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.5rem' }}>
              Similar Phones in this Price Segment
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {similarMobiles.map((sim) => (
                <MobileCard key={sim._id} mobile={sim} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Review Submission Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Review ${mobile.name}`}
      >
        <form onSubmit={handleReviewSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>
              Your Rating (1 to 5 Stars)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewReviewRating(star)}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${star <= newReviewRating ? '#F59E0B' : 'var(--border-color)'}`,
                    background: star <= newReviewRating ? 'var(--color-accent-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <Star size={20} fill={star <= newReviewRating ? '#F59E0B' : 'none'} color="#F59E0B" />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>
              Your Detailed Feedback
            </label>
            <textarea
              rows={4}
              required
              placeholder="Tell other buyers in India about camera quality, battery backup, heating, and general performance..."
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 'var(--font-size-sm)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="ghost" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingReview}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../components/common/PriceTag.jsx';
import { Button } from '../components/common/Button.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';

export const CartPage = () => {
  const { cart, summary, updateQuantity, removeItem, applyCoupon, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
    }
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setPincodeMessage({
        success: true,
        text: `⚡ Express 24-48 hr delivery available for PIN ${pincode.trim()}!`,
      });
    } else {
      setPincodeMessage({
        success: false,
        text: 'Please enter a valid 6-digit Indian PIN code.',
      });
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          message="Looks like you haven't added any smartphones or accessories to your cart yet. Explore our fresh Indian catalogue and deals!"
          actionText="Browse 100+ Mobiles"
          onAction={() => navigate('/mobiles')}
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shopping Cart ({summary.itemsCount || 0} items) | MobiVerse India</title>
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />

        <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Shopping Bag</h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {summary.itemsCount} item{summary.itemsCount > 1 ? 's' : ''} in your cart
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} icon={Trash2}>
            Clear Bag
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2.5rem' }} className="cart-layout">
          {/* Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.items.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                }}
                className="cart-item-row"
              >
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80'}
                  alt={item.name}
                  style={{ width: '80px', height: '80px', objectFit: 'contain', flexShrink: 0 }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, lineHeight: 1.3 }}>
                    {item.name}
                  </h3>
                  {item.variantDetails && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Color: {item.variantDetails.color} • RAM/Storage: {item.variantDetails.ram}/{item.variantDetails.storage}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatINR(item.price)}
                    </span>
                    {item.mrp > item.price && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {formatINR(item.mrp)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px 6px' }}>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                    style={{ padding: '4px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', padding: '0 8px' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    aria-label="Increase quantity"
                    style={{ padding: '4px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item._id)}
                  aria-label="Remove item"
                  style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary & Checkout Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Pincode Availability Checker */}
            <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: 'var(--font-size-xs)', marginBottom: '8px' }}>
                <Truck size={14} color="var(--color-primary)" /> Check Delivery PIN Code
              </div>
              <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560038"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-xs)',
                    outline: 'none',
                  }}
                />
                <Button type="submit" variant="secondary" size="sm">
                  Check
                </Button>
              </form>
              {pincodeMessage && (
                <div style={{ fontSize: '11px', marginTop: '6px', fontWeight: 600, color: pincodeMessage.success ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {pincodeMessage.text}
                </div>
              )}
            </div>

            {/* Coupons Card */}
            <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: 'var(--font-size-xs)', marginBottom: '8px' }}>
                <Tag size={14} color="var(--color-accent)" /> Apply Promo Coupon
              </div>
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="MOBIVERSE10 / FESTIVE500"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-xs)',
                    textTransform: 'uppercase',
                    outline: 'none',
                  }}
                />
                <Button type="submit" variant="outline" size="sm">
                  Apply
                </Button>
              </form>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                💡 Try <strong>MOBIVERSE10</strong> for 10% off (up to ₹1,500)
              </div>
            </div>

            {/* Price Breakup Card */}
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: '1rem' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-xs)', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
                  <span>{formatINR(summary.itemsTotal)}</span>
                </div>

                {summary.couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 700 }}>
                    <span>Coupon Discount ({summary.couponCode})</span>
                    <span>- {formatINR(summary.couponDiscount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                  <span>{summary.shippingFee === 0 ? <strong style={{ color: 'var(--color-success)' }}>FREE</strong> : formatINR(summary.shippingFee)}</span>
                </div>

                {/* GST Breakup */}
                <div style={{ background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>GST (18% inclusive)</span>
                    <span>{formatINR(summary.gstBreakup?.totalGst || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
                    <span>CGST (9%) + SGST (9%)</span>
                    <span>{formatINR(summary.gstBreakup?.cgst || 0)} each</span>
                  </div>
                </div>
              </div>

              {/* Grand Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '1rem 0' }}>
                <span style={{ fontWeight: 800, fontSize: 'var(--font-size-base)' }}>Total Amount</span>
                <span style={{ fontWeight: 900, fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>
                  {formatINR(summary.grandTotal)}
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%' }}
                icon={ArrowRight}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
                <ShieldCheck size={14} color="var(--color-success)" />
                PCI-DSS Safe & Verified Razorpay Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

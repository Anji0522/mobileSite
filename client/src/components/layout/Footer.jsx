import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto',
        paddingTop: '3.5rem',
        paddingBottom: '2rem',
      }}
    >
      <div className="container">
        {/* Value Propositions Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '2.5rem',
            marginBottom: '2.5rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Truck size={32} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Pan-India Fast Delivery</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Free shipping on orders above ₹999</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={32} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>100% Genuine Products</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Official brand warranty with every mobile</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={32} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>PCI-DSS Secure Payments</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>UPI, Cards, NetBanking via Razorpay</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RefreshCw size={32} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Doorstep Repair Warranty</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Up to 180 days warranty on device repairs</div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Col 1: About */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Smartphone size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 'var(--font-size-base)' }}>MobiVerse India</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              "Shop on your fingertips" — India's premier one-stop smartphone catalogue and marketplace. Compare, browse verified specs, book doorstep repairs, and buy directly with confidence.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="var(--color-primary)" /> Indiranagar, Bengaluru, KA 560038
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--color-primary)" /> 1800-MOBIVERSE (Mon-Sat, 9AM-8PM)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="var(--color-primary)" /> support@mobiverse.in
              </span>
            </div>
          </div>

          {/* Col 2: Mobiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Browse Phones</h4>
            <Link to="/mobiles?has5G=true" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>5G Smartphones India</Link>
            <Link to="/mobiles?maxPrice=15000" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Phones under ₹15,000</Link>
            <Link to="/mobiles?minPrice=15000&maxPrice=30000" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Phones ₹15k - ₹30k</Link>
            <Link to="/mobiles?minPrice=50000" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Flagship Phones (₹50k+)</Link>
            <Link to="/compare" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Compare Mobile Phones</Link>
          </div>

          {/* Col 3: Popular Brands */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Popular Brands</h4>
            <Link to="/brands/samsung" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Samsung Mobiles</Link>
            <Link to="/brands/apple" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Apple iPhones</Link>
            <Link to="/brands/oneplus" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>OnePlus Phones</Link>
            <Link to="/brands/xiaomi" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Xiaomi & Redmi</Link>
            <Link to="/brands/lava" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Lava (Make in India)</Link>
            <Link to="/brands" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>All 16 Brands →</Link>
          </div>

          {/* Col 4: Services & Marketplace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Services & Sellers</h4>
            <Link to="/services" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Doorstep Mobile Repair</Link>
            <Link to="/services" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Screen Replacement</Link>
            <Link to="/services" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Battery Replacement</Link>
            <Link to="/register?role=provider" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Sell on MobiVerse</Link>
            <Link to="/contact" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Contact Support</Link>
            <Link to="/about" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>About Us</Link>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} MobiVerse India Private Limited. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Verified Secure Checkout:</span>
            <span style={{ fontWeight: 700, color: '#0C2340' }}>Razorpay</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: '#097939' }}>UPI</span>
            <span>•</span>
            <span style={{ fontWeight: 700, color: '#EA1D2C' }}>RuPay</span>
            <span>•</span>
            <span style={{ fontWeight: 700 }}>NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

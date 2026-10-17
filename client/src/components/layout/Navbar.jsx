import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Smartphone,
  Search,
  ShoppingBag,
  ArrowLeftRight,
  Sun,
  Moon,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  Shield,
  Briefcase,
  Package,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useCompare } from '../../context/CompareContext.jsx';
import { mobilesAPI } from '../../services/api.js';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isProvider, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const { compareCount } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setSuggestions([]);
  }, [location.pathname]);

  // Click outside to dismiss search suggestions and user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestions([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await mobilesAPI.getAll({ q: searchQuery.trim(), limit: 5 });
        setSuggestions(res.data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/mobiles?q=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
    }
  };

  const navLinks = [
    { label: 'Mobiles', to: '/mobiles' },
    { label: 'Accessories', to: '/accessories' },
    { label: 'Brands', to: '/brands' },
    { label: 'Repair & Services', to: '/services' },
    {
      label: 'Compare',
      to: '/compare',
      badge: compareCount > 0 ? compareCount : null,
    },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)',
        transition: 'background var(--transition-fast)',
      }}
    >
      {/* Top micro banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1E40AF 0%, #2563EB 50%, #1D4ED8 100%)',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 600,
          textAlign: 'center',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span>🇮🇳 India's Single Trusted Mobile Catalogue</span>
        <span>•</span>
        <span>Free Express Delivery Above ₹999</span>
        <span>•</span>
        <span>Genuine Indian Warranty</span>
      </div>

      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px', gap: '1rem' }}>
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Smartphone size={22} />
          </div>
          <div>
            <span
              style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              MobiVerse
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                marginLeft: '4px',
                background: 'linear-gradient(90deg, #FF9933 0%, #138808 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              INDIA
            </span>
          </div>
        </Link>

        {/* Search Bar with Autocomplete Dropdown */}
        <div ref={searchRef} style={{ flex: 1, maxWidth: '480px', position: 'relative' }} className="nav-search-bar">
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <input
              type="search"
              placeholder="Search 100+ Indian phones, 5G specs, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search mobiles and accessories"
              style={{
                width: '100%',
                padding: '9px 40px 9px 38px',
                fontSize: 'var(--font-size-sm)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
            />
            <Search
              size={18}
              color="var(--text-muted)"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </form>

          {/* Instant Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                zIndex: 1000,
              }}
            >
              {suggestions.map((m) => (
                <Link
                  key={m._id}
                  to={`/mobiles/${m.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'inherit',
                  }}
                >
                  <img
                    src={m.images?.[0]}
                    alt={m.name}
                    style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {m.name}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700 }}>
                      ₹{m.price?.current?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative',
                }}
              >
                {link.label}
                {link.badge && (
                  <span
                    className="badge badge-accent"
                    style={{ padding: '0 6px', fontSize: '10px' }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} />}
          </button>

          {/* Cart Badge Button */}
          <Link
            to="/cart"
            aria-label={`Shopping Cart with ${itemCount} items`}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Profile / Auth Menu */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-label="User profile menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                  }}
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span className="user-name-label">{user.name.split(' ')[0]}</span>
                </button>

                {isUserMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '210px',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '8px',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)' }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
                      <span className="badge badge-primary" style={{ marginTop: '4px', textTransform: 'uppercase' }}>
                        {user.role}
                      </span>
                    </div>

                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      <UserIcon size={16} /> My Profile
                    </Link>
                    <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      <Package size={16} /> My Orders
                    </Link>
                    <Link to="/bookings" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      <Wrench size={16} /> Repair Bookings
                    </Link>

                    {isProvider && (
                      <Link to="/provider/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                        <Briefcase size={16} /> Provider Portal
                      </Link>
                    )}

                    {isAdmin && (
                      <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                        <Shield size={16} /> Admin Console
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-danger)',
                        width: '100%',
                        textAlign: 'left',
                        borderTop: '1px solid var(--border-color)',
                        marginTop: '4px',
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '8px 14px',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '8px 16px',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    background: 'var(--color-primary)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
            }}
            className="mobile-hamburger-btn"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          className="mobile-drawer"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{link.label}</span>
              {link.badge && <span className="badge badge-accent">{link.badge}</span>}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

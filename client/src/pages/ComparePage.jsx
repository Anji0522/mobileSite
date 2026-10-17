import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeftRight, Plus, Search, Trash2, Smartphone } from 'lucide-react';
import { mobilesAPI } from '../services/api.js';
import { useCompare } from '../context/CompareContext.jsx';
import { CompareTable } from '../components/common/CompareTable.jsx';
import { Button } from '../components/common/Button.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { Modal } from '../components/common/Modal.jsx';

export const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { compareList, addToCompare, clearCompare } = useCompare();

  const [activeMobiles, setActiveMobiles] = useState(compareList);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // If URL has ?slugs=..., load those phones
  useEffect(() => {
    const slugs = searchParams.get('slugs');
    if (slugs) {
      mobilesAPI.compare(slugs).then((res) => {
        if (res.data && res.data.length > 0) {
          setActiveMobiles(res.data);
        }
      });
    } else {
      setActiveMobiles(compareList);
    }
  }, [searchParams.get('slugs'), compareList]);

  // Search mobiles to add to compare
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await mobilesAPI.getAll({ q: searchQuery.trim(), limit: 6 });
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectToCompare = (mobile) => {
    addToCompare(mobile);
    setIsSearchModalOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <Helmet>
        <title>Compare Mobiles in India - Side by Side Specs & Price Comparison | MobiVerse</title>
        <meta
          name="description"
          content="Compare up to 4 mobile phones side-by-side in India. Deep comparison of displays, AnTuTu benchmarks, processors, camera sensors, battery life, Indian 5G bands, and live prices."
        />
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumbs items={[{ label: 'Compare Mobiles' }]} />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1.5rem 0',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
              Compare Smartphones Side by Side
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Comparing {activeMobiles.length} of 4 maximum phones
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeMobiles.length < 4 && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsSearchModalOpen(true)}
              >
                Add Phone
              </Button>
            )}
            {activeMobiles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={clearCompare}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {activeMobiles.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Your comparison tray is empty"
            message="Select up to 4 smartphones from our catalogue to compare technical specifications, cameras, battery performance, and Indian prices."
            actionText="Browse Mobiles Catalogue"
            onAction={() => (window.location.href = '/mobiles')}
          />
        ) : (
          <CompareTable mobiles={activeMobiles} />
        )}
      </div>

      {/* Add Phone Search Modal */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        title="Select Phone to Compare"
      >
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            type="search"
            placeholder="Type mobile name (e.g. S24 Ultra, iPhone 16, OnePlus 12)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              fontSize: 'var(--font-size-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
          {searchResults.map((m) => (
            <div
              key={m._id}
              onClick={() => handleSelectToCompare(m)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
              }}
            >
              <img
                src={m.images?.[0]}
                alt={m.name}
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>{m.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700 }}>
                  ₹{m.price?.current?.toLocaleString('en-IN')}
                </div>
              </div>
              <Button size="sm" variant="outline">
                Compare
              </Button>
            </div>
          ))}

          {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
              No phones found for "{searchQuery}".
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';
import { PriceTag } from './PriceTag.jsx';
import { RatingStars } from './RatingStars.jsx';
import { Button } from './Button.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useCompare } from '../../context/CompareContext.jsx';

export const CompareTable = ({ mobiles = [] }) => {
  const { addToCart } = useCart();
  const { removeFromCompare } = useCompare();

  if (!mobiles || mobiles.length === 0) return null;

  const specCategories = [
    { label: 'Brand', key: 'brandName' },
    { label: 'Current Price', render: (m) => <PriceTag price={m.price?.current} mrp={m.price?.mrp} size="sm" /> },
    { label: 'Rating', render: (m) => <RatingStars rating={m.rating?.avg || 4.5} count={m.rating?.count || 0} size={14} /> },
    { label: 'Display Size & Type', render: (m) => `${m.specs?.display?.size || '-'} (${m.specs?.display?.type || '-'})` },
    { label: 'Refresh Rate', render: (m) => m.specs?.display?.refreshRate || '-' },
    { label: 'Peak Brightness', render: (m) => m.specs?.display?.peakBrightness || '-' },
    { label: 'Processor / Chipset', render: (m) => m.specs?.performance?.processor || '-' },
    { label: 'AnTuTu Benchmark', render: (m) => m.specs?.performance?.antutuScore ? `${m.specs.performance.antutuScore.toLocaleString('en-IN')} points` : '-' },
    { label: 'Primary RAM / Type', render: (m) => `${m.specs?.memory?.ram || '-'} (${m.specs?.memory?.ramType || '-'})` },
    { label: 'Storage / Type', render: (m) => `${m.specs?.memory?.storage || '-'} (${m.specs?.memory?.storageType || '-'})` },
    { label: 'Rear Cameras', render: (m) => m.specs?.camera?.rear || '-' },
    { label: 'Front Camera', render: (m) => m.specs?.camera?.front || '-' },
    { label: 'Battery Capacity', render: (m) => m.specs?.battery?.capacity || '-' },
    { label: 'Fast Charging Speed', render: (m) => m.specs?.battery?.fastCharging || '-' },
    { label: 'Wireless Charging', render: (m) => m.specs?.battery?.wirelessCharging || '-' },
    { label: 'Charger in Box?', render: (m) => m.specs?.battery?.chargerInBox ? '✅ Yes' : '❌ No (Sold Separately)' },
    { label: 'Operating System', render: (m) => `${m.specs?.os?.name || '-'} (${m.specs?.os?.version || '-'})` },
    { label: 'OS Update Guarantee', render: (m) => m.specs?.os?.promisedUpdates || '-' },
    { label: '5G Bands (India)', render: (m) => m.specs?.network?.bands5G || (m.specs?.network?.has5G ? 'All Indian 5G Bands' : '4G LTE Only') },
    { label: 'Water & Dust Resistance', render: (m) => m.specs?.design?.ipRating || '-' },
    { label: 'Weight & Build', render: (m) => `${m.specs?.design?.weight || '-'}, ${m.specs?.design?.buildMaterial || '-'}` },
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
        <thead>
          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '1.25rem', width: '220px', color: 'var(--text-secondary)' }}>Specifications</th>
            {mobiles.map((mobile) => (
              <th key={mobile._id || mobile.slug} style={{ padding: '1.25rem', minWidth: '220px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                  <button
                    onClick={() => removeFromCompare(mobile._id || mobile.slug)}
                    title="Remove from comparison"
                    aria-label={`Remove ${mobile.name}`}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '0',
                      padding: '4px',
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>

                  <img
                    src={mobile.images?.[0] || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80'}
                    alt={mobile.name}
                    style={{ height: '140px', objectFit: 'contain', margin: '0 auto' }}
                  />

                  <Link to={`/mobiles/${mobile.slug}`} style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', textAlign: 'center', color: 'inherit' }}>
                    {mobile.name}
                  </Link>

                  <Button
                    size="sm"
                    variant="primary"
                    icon={ShoppingBag}
                    onClick={() => {
                      addToCart('mobile', mobile._id, mobile.variants?.[0]?.sku, 1, {
                        name: mobile.name,
                        image: mobile.images?.[0],
                        price: mobile.price?.current,
                        mrp: mobile.price?.mrp,
                      });
                    }}
                  >
                    Add to Bag
                  </Button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specCategories.map((spec, idx) => (
            <tr
              key={spec.label}
              style={{
                borderBottom: '1px solid var(--border-color)',
                background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)',
              }}
            >
              <td style={{ padding: '12px 18px', fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                {spec.label}
              </td>
              {mobiles.map((m) => (
                <td key={m._id || m.slug} style={{ padding: '12px 18px', fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
                  {spec.render ? spec.render(m) : m[spec.key] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';
import { Button } from './Button.jsx';

const INDIAN_BRANDS = [
  'Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Redmi', 'Realme',
  'Vivo', 'Oppo', 'Motorola', 'Nothing', 'Google', 'iQOO',
  'Poco', 'Infinix', 'Tecno', 'Lava'
];

const PRICE_SLABS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under ₹15,000', min: '0', max: '15000' },
  { label: '₹15,000 - ₹30,000', min: '15000', max: '30000' },
  { label: '₹30,000 - ₹50,000', min: '30000', max: '50000' },
  { label: '₹50,000 - ₹80,000', min: '50000', max: '80000' },
  { label: 'Above ₹80,000 (Ultra Flagship)', min: '80000', max: '' },
];

const RAM_OPTIONS = ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB'];
const STORAGE_OPTIONS = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

export const FilterSidebar = ({ filters, onFilterChange, onReset }) => {
  const selectedBrands = filters.brand ? filters.brand.split(',') : [];

  const handleBrandToggle = (brandName) => {
    let next;
    if (selectedBrands.includes(brandName)) {
      next = selectedBrands.filter((b) => b !== brandName);
    } else {
      next = [...selectedBrands, brandName];
    }
    onFilterChange('brand', next.join(','));
  };

  const handlePriceSlab = (slab) => {
    onFilterChange('minPrice', slab.min);
    onFilterChange('maxPrice', slab.max);
  };

  const currentPriceMatches = (slab) => {
    return (filters.minPrice || '') === slab.min && (filters.maxPrice || '') === slab.max;
  };

  return (
    <aside
      aria-label="Product Filters"
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <Filter size={18} color="var(--color-primary)" />
          <span>Filters</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} icon={RotateCcw}>
          Reset
        </Button>
      </div>

      {/* 5G Switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
        <label htmlFor="filter-5g" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, cursor: 'pointer' }}>
          ⚡ 5G Phones Only
        </label>
        <input
          id="filter-5g"
          type="checkbox"
          checked={filters.has5G === 'true'}
          onChange={(e) => onFilterChange('has5G', e.target.checked ? 'true' : '')}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
        />
      </div>

      {/* Price Range */}
      <div>
        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '10px' }}>
          Price Range (INR)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {PRICE_SLABS.map((slab, i) => (
            <label
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 'var(--font-size-xs)',
                color: currentPriceMatches(slab) ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: currentPriceMatches(slab) ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="priceSlab"
                checked={currentPriceMatches(slab)}
                onChange={() => handlePriceSlab(slab)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              {slab.label}
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '10px' }}>
          Smartphone Brands
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
          {INDIAN_BRANDS.map((brand) => {
            const isChecked = selectedBrands.includes(brand);
            return (
              <label
                key={brand}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--font-size-xs)',
                  color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isChecked ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleBrandToggle(brand)}
                  style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                />
                {brand}
              </label>
            );
          })}
        </div>
      </div>

      {/* RAM */}
      <div>
        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '8px' }}>
          System RAM
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {RAM_OPTIONS.map((r) => {
            const isSelected = (filters.ram || '').includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => onFilterChange('ram', isSelected ? '' : r)}
                style={{
                  padding: '4px 8px',
                  fontSize: 'var(--font-size-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: isSelected ? 'var(--color-primary-light)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Storage */}
      <div>
        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '8px' }}>
          Internal Storage
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {STORAGE_OPTIONS.map((s) => {
            const isSelected = (filters.storage || '').includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => onFilterChange('storage', isSelected ? '' : s)}
                style={{
                  padding: '4px 8px',
                  fontSize: 'var(--font-size-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: isSelected ? 'var(--color-primary-light)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

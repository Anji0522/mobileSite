import { DataSourceAdapter } from './DataSourceAdapter.js';
import { Mobile } from '../../../models/Mobile.js';

export class MockFeedAdapter extends DataSourceAdapter {
  constructor() {
    super('Official Indian Market Licensed Feed');
  }

  async fetchPriceUpdates() {
    const mobiles = await Mobile.find({ status: 'available' }).select('slug price name').limit(20);
    const updates = [];

    for (const mobile of mobiles) {
      // Simulate legitimate seasonal offers or market price adjustments (+/- 2% to 6%)
      const changeRatio = (Math.random() * 0.08) - 0.04;
      const priceDelta = Math.round(mobile.price.current * changeRatio);
      const newPrice = Math.max(1000, mobile.price.current + priceDelta);

      updates.push({
        slug: mobile.slug,
        price: newPrice,
        mrp: mobile.price.mrp,
        source: 'Official Feed Sync',
      });
    }

    return updates;
  }

  async fetchNewLaunches() {
    // Occasionally simulate a new flagship launch waiting for admin review
    const now = new Date();
    return [
      {
        name: 'Nothing Phone (3) Pro Edition',
        slug: `nothing-phone-3-pro-${Date.now()}`,
        brandName: 'Nothing',
        price: { mrp: 54999, current: 49999, discountPercentage: 9 },
        images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'],
        launchDate: now,
        status: 'pending_review',
        tags: ['5G', 'Flagship', 'Glyph Matrix'],
        specs: {
          display: { size: '6.78 inches', type: 'LTPO OLED 144Hz', resolution: '1.5K' },
          performance: { processor: 'Snapdragon 8 Gen 3', chipset: 'Qualcomm' },
          battery: { capacity: '5200 mAh', fastCharging: '100W Wired' },
          network: { has5G: true },
        },
      },
    ];
  }
}

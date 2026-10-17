import { Mobile } from '../../models/Mobile.js';
import { Brand } from '../../models/Brand.js';
import { PriceHistory } from '../../models/PriceHistory.js';
import { MockFeedAdapter } from './adapters/MockFeedAdapter.js';
import { ProviderEnteredAdapter } from './adapters/ProviderEnteredAdapter.js';
import { CsvImportAdapter } from './adapters/CsvImportAdapter.js';

export const getAdapterInstance = (sourceType) => {
  const source = sourceType || process.env.PRICE_SYNC_DATA_SOURCE || 'mock_feed';
  switch (source) {
    case 'provider_entered':
      return new ProviderEnteredAdapter();
    case 'admin_csv':
      return new CsvImportAdapter();
    case 'mock_feed':
    default:
      return new MockFeedAdapter();
  }
};

export const runPriceSync = async (customAdapter = null) => {
  const adapter = customAdapter || getAdapterInstance();
  console.log(`📡 [PriceSync] Starting price sync using adapter: "${adapter.name}"`);

  let updatedCount = 0;
  let priceDropsCount = 0;
  let newLaunchesCount = 0;

  try {
    // 1. Process Price Updates
    const updates = await adapter.fetchPriceUpdates();
    for (const update of updates) {
      const mobile = await Mobile.findOne({ slug: update.slug });
      if (!mobile) continue;

      const oldPrice = mobile.price.current;
      const newPrice = update.price;

      if (oldPrice !== newPrice) {
        const difference = newPrice - oldPrice;
        const isPriceDrop = newPrice < oldPrice;
        const dropPercentage = isPriceDrop
          ? Math.round(((oldPrice - newPrice) / oldPrice) * 100)
          : 0;

        // Record historical price
        await PriceHistory.create({
          mobile: mobile._id,
          mobileName: mobile.name,
          oldPrice,
          newPrice,
          difference,
          dropPercentage,
          isPriceDrop,
          source: update.source || adapter.name,
          recordedAt: new Date(),
        });

        // Update mobile record
        mobile.price.current = newPrice;
        if (update.mrp) {
          mobile.price.mrp = update.mrp;
        }
        mobile.price.discountPercentage = Math.max(
          0,
          Math.round(((mobile.price.mrp - mobile.price.current) / mobile.price.mrp) * 100)
        );
        mobile.priceUpdatedAt = new Date();
        if (isPriceDrop) {
          mobile.isDeal = true;
        }
        await mobile.save();

        updatedCount++;
        if (isPriceDrop) priceDropsCount++;
      }
    }

    // 2. Process New Launches (flagged as 'pending_review' for Admin Approval)
    const newPhones = await adapter.fetchNewLaunches();
    for (const item of newPhones) {
      const existing = await Mobile.findOne({ slug: item.slug });
      if (!existing) {
        let brandObj = await Brand.findOne({ name: new RegExp(`^${item.brandName}$`, 'i') });
        if (!brandObj) {
          brandObj = await Brand.create({
            name: item.brandName,
            slug: item.brandName.toLowerCase().replace(/\s+/g, '-'),
          });
        }

        await Mobile.create({
          ...item,
          brand: brandObj._id,
          status: 'pending_review',
        });
        newLaunchesCount++;
      }
    }

    console.log(
      `✅ [PriceSync] Completed. ${updatedCount} prices refreshed, ${priceDropsCount} price drops detected, ${newLaunchesCount} pending launches added.`
    );

    return {
      success: true,
      updatedCount,
      priceDropsCount,
      newLaunchesCount,
      adapter: adapter.name,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('❌ [PriceSync] Error running price sync:', err.message);
    throw err;
  }
};

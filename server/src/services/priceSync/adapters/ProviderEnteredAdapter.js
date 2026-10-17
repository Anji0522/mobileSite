import { DataSourceAdapter } from './DataSourceAdapter.js';
import { Mobile } from '../../../models/Mobile.js';

export class ProviderEnteredAdapter extends DataSourceAdapter {
  constructor() {
    super('Provider & Seller Submitted Prices');
  }

  async fetchPriceUpdates() {
    // Find mobiles with sellers and pick the lowest available seller price
    const mobiles = await Mobile.find({ 'sellers.0': { $exists: true } });
    const updates = [];

    for (const mobile of mobiles) {
      if (mobile.sellers && mobile.sellers.length > 0) {
        const inStockSellers = mobile.sellers.filter((s) => s.inStock);
        if (inStockSellers.length > 0) {
          const lowestSellerPrice = Math.min(...inStockSellers.map((s) => s.price));
          if (lowestSellerPrice > 0 && lowestSellerPrice !== mobile.price.current) {
            updates.push({
              slug: mobile.slug,
              price: lowestSellerPrice,
              mrp: mobile.price.mrp,
              source: 'Provider Marketplace Lowest Price',
            });
          }
        }
      }
    }

    return updates;
  }
}

export class CsvImportAdapter extends DataSourceAdapter {
  constructor(csvRecords = []) {
    super('Admin CSV Batch Import');
    this.csvRecords = csvRecords;
  }

  setRecords(records) {
    this.csvRecords = records;
  }

  async fetchPriceUpdates() {
    return this.csvRecords.map((rec) => ({
      slug: rec.slug,
      price: Number(rec.price),
      mrp: rec.mrp ? Number(rec.mrp) : undefined,
      source: 'Admin CSV Feed',
    }));
  }
}

import { DataSourceAdapter } from './DataSourceAdapter.js';

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

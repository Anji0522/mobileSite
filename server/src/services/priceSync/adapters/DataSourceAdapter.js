/**
 * Base Data Source Adapter Interface for Price & Catalogue Sync
 * Complies with strict policy: no unauthorized scraping.
 * Pluggable data sources: Official Brand Feeds, Provider/Seller Feeds, CSV Imports.
 */
export class DataSourceAdapter {
  constructor(name) {
    this.name = name;
  }

  /**
   * Fetch latest price updates
   * @returns {Promise<Array<{ slug: string, price: number, mrp?: number, stock?: number }>>}
   */
  async fetchPriceUpdates() {
    throw new Error('fetchPriceUpdates() must be implemented by adapter');
  }

  /**
   * Fetch any newly launched phones to add as 'pending_review'
   * @returns {Promise<Array<Object>>}
   */
  async fetchNewLaunches() {
    return [];
  }
}

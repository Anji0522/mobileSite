import cron from 'node-cron';
import { runPriceSync } from '../services/priceSync/priceSyncService.js';

export const syncPricesJob = async () => {
  return runPriceSync();
};

export const initPriceSyncCron = () => {
  // Default: Run every 4 hours in production or every minute in active test if configured
  const cronSchedule = process.env.PRICE_SYNC_CRON || '0 */4 * * *';

  console.log(`⏰ Initializing Price Sync Cron Job with schedule: "${cronSchedule}"`);

  cron.schedule(cronSchedule, async () => {
    console.log('⏰ [Cron] Running scheduled price sync job...');
    try {
      await runPriceSync();
    } catch (err) {
      console.error('⏰ [Cron] Scheduled price sync failed:', err.message);
    }
  });
};

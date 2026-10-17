import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { initPriceSyncCron } from './jobs/priceSyncJob.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database (with automatic Dev Memory Fallback)
    await connectDB();

    // Auto-seed if database is empty
    const { Mobile } = await import('./models/Mobile.js');
    const mobileCount = await Mobile.countDocuments();
    if (mobileCount === 0) {
      console.log('📦 Database is empty. Running automatic seed...');
      const { seedDatabase } = await import('./seeds/seed.js');
      await seedDatabase();
    }

    // 2. Start Scheduled Jobs
    initPriceSyncCron();

    // 3. Listen on Port
    const server = app.listen(PORT, () => {
      console.log(`
============================================================
📱 MobiVerse India - API Server Online
🚀 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health Check: http://localhost:${PORT}/api/v1/health
============================================================
      `);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down MobiVerse API server...`);
      server.close(async () => {
        await closeDB();
        console.log('💤 MongoDB disconnected. Process exiting cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('💥 Fatal error starting server:', err.message);
    process.exit(1);
  }
};

startServer();
